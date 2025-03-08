import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import safeOnLoad from "./lib/safeOnLoad.ts";
import { toast } from "./lib/toast.ts";
import store, { AppStoreState, ShortISODate, Time } from "./store.ts";

function setupHashListener() {
  addEventListener("hashchange", (e) => {
    const parsedUrl = new URL(e.newURL);
    if (!parsedUrl?.hash) {
      return;
    }
    syncStep();
  });
}

function addCalendarListener() {
  const calendar = document.getElementById("create-event-calendar");
  if (!calendar) {
    console.error("Calendar element not found");
  } else {
    calendar.addEventListener("change", (e) => {
      const state = store.getState();
      const target = e.target as HTMLInputElement;
      const [year, month, day] = target.value.split("-").map((s) => Number(s));
      const eventStartTime = new Date(state.draftEvent.startTime || Date.now());
      eventStartTime.setFullYear(year, month, day);

      store
        .getState()
        .setDraftEvent({ startDate: target.value as ShortISODate });
      // store.getState().setDraftEvent({ startTime: eventStartTime });
    });
  }
}

function addEventTimeListener(formElement: HTMLFormElement) {
  const eventTimeInput: HTMLInputElement = formElement["event-time"];
  eventTimeInput.addEventListener("change", (e) => {
    const state = store.getState();
    const target = e.target as HTMLInputElement;
    const eventStartTime = new Date(state.draftEvent.startTime || Date.now());
    console.log(target.value);
    const [hours, minutes] = target.value.split(":");
    eventStartTime.setHours(Number(hours), Number(minutes), 0, 0);
    store.getState().setDraftEvent({ startTime: target.value as Time });
  });
}

function addEventTitleListener(formElement: HTMLFormElement) {
  const eventTitleInput: HTMLInputElement = formElement["event-title"];
  eventTitleInput.addEventListener("change", (e) => {
    store
      .getState()
      .setDraftEvent({ title: (e.target as HTMLInputElement)?.value });
  });
}

function addEventDescriptionListener(formElement: HTMLFormElement) {
  const eventDescriptionInput: HTMLInputElement =
    formElement["event-description"];
  eventDescriptionInput.addEventListener("change", (e) => {
    store
      .getState()
      .setDraftEvent({ description: (e.target as HTMLInputElement)?.value });
  });
}

function addSubmitListener(formElement: HTMLFormElement) {
  formElement.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { draftEvent, userId, db } = store.getState();
    if (!db) {
      throw Error("Could not find Firestore Database");
    }
    const { startDate, startTime, title, description, duration } = draftEvent;

    if (!startTime || !startDate) {
      console.error("Date and time required");
      // TODO: Show error message
      return;
    }

    const [year, month, day] = startDate.split("-").map((s) => Number(s));
    const [hours, minutes] = startTime.split(":").map((s) => Number(s));
    const eventDate = new Date(year, month, day, hours, minutes);

    const newEventRef = doc(collection(db, "events"));
    const userRef = doc(db, "users", userId);

    try {
      await setDoc(newEventRef, {
        title,
        description,
        duration,
        startTime: eventDate,
        user: userRef,
      });

      toast("Event created successfully.", "success");
      setTimeout(() => {
        window.location.assign("/main.html");
      }, 2000);
    } catch (e) {
      toast("Event creation failed.", "error");
    }
  });
}

function setupCalendarListeners() {
  addCalendarListener();

  const formElement = document.getElementById(
    "create-event-form",
  ) as HTMLFormElement;
  if (!formElement) {
    console.error("Calendar form not found");
    return;
  }
  addSubmitListener(formElement);
  addEventDescriptionListener(formElement);
  addEventTimeListener(formElement);
  addEventTitleListener(formElement);
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

function updateInputs(state: AppStoreState) {
  const formElement = document.getElementById(
    "create-event-form",
  ) as HTMLFormElement;
  if (!formElement) {
    console.error("Calendar form not found");
    return;
  }

  const eventDescriptionInput: HTMLInputElement =
    formElement["event-description"];
  const eventTitleInput: HTMLInputElement = formElement["event-title"];
  const eventTimeInput: HTMLInputElement = formElement["event-time"];
  const calendar = document.getElementById(
    "create-event-calendar",
  ) as HTMLInputElement;

  eventDescriptionInput.value = state.draftEvent.description || "";
  eventTitleInput.value = state.draftEvent.title || "";
  eventTimeInput.value = state.draftEvent.startTime || "";
  calendar.value = state.draftEvent.startDate || "";
}

function initCreatePage() {
  setupHashListener();
  syncStep();
  setupCalendarListeners();
  store.subscribe(updateInputs);
}

safeOnLoad(initCreatePage);
