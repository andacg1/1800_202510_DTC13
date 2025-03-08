import safeOnLoad from "./lib/safeOnLoad.ts";

function setupHashListener() {
  addEventListener("hashchange", (e) => {
    const parsedUrl = new URL(e.newURL);
    if (!parsedUrl?.hash) {
      return;
    }
    syncStep();
  });
}

const handleCalendarChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  console.log(target?.value);
  const { draftEvent } = window.App.state.create;

  Object.assign(draftEvent, {
    startDate: new Date(target?.value),
  });
};

function setupCalendarListeners() {
  const calendar = document.getElementById("create-event-calendar");
  if (!calendar) {
    console.error("Calendar element not found");
  } else {
    calendar.addEventListener("change", handleCalendarChange);
  }


}

function syncStep() {
  const parsedUrl = new URL(window.location.href);
  const frag = parsedUrl.hash;
  if (!frag) {
    window.location.hash = "step1";
  }
  const currentStep = window.location.hash.substring(1);
  const stepsEl = document.querySelector("#carousel-steps");
  if (!stepsEl) {
    console.error("Couldn't find Steps element");
    return;
  }
  if (!stepsEl?.children) {
    console.error("Steps element is empty");
    return;
  }
  const targetStep = parseInt(currentStep.split("step")?.[1]);
  for (const child of stepsEl?.children) {
    const currentHref = child.getAttribute("href");
    if (!currentHref) {
      continue;
    }
    const currentElementStep = parseInt(currentHref.split("step")?.[1]);
    if (currentElementStep <= targetStep) {
      child.classList.add("step-primary");
    } else {
      child.classList.remove("step-primary");
    }
  }
  stepsEl?.children;
}

function initCreatePage() {
  setupHashListener();
  syncStep();
  setupCalendarListeners();
}

safeOnLoad(initCreatePage);
