import { TagData, WithId } from "./Api";
import { CalSyncApi } from "./CalSyncApi.ts";
import safeOnLoad from "./lib/safeOnLoad.ts";
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
    });
  }
}

function addEventTimeListener(formElement: HTMLFormElement) {
  const eventTimeInput: HTMLInputElement = formElement["event-time"];
  eventTimeInput.addEventListener("change", (e) => {
    const state = store.getState();
    const target = e.target as HTMLInputElement;
    const eventStartTime = new Date(state.draftEvent.startTime || Date.now());
    console.debug(target.value);
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

function addEventIsPublicListener(formElement: HTMLFormElement) {
  const eventIsPublicInput: HTMLInputElement = formElement["event-is-public"];
  eventIsPublicInput.addEventListener("change", (e) => {
    store
      .getState()
      .setDraftEvent({ isPublic: (e.target as HTMLInputElement)?.checked });
  });
}

function addTagListener(formElement: HTMLFormElement) {
  const eventTagInput: HTMLInputElement = formElement["event-tag"];

  eventTagInput.addEventListener("change", (e) => {
    store
      .getState()
      .setDraftEvent({ tagName: (e.target as HTMLInputElement)?.value });
  });
}

function addSubmitListener(formElement: HTMLFormElement) {
  formElement.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { draftEvent } = store.getState();
    const {
      startDate,
      startTime,
      title,
      description,
      duration,
      tagName,
      isPublic = false,
    } = draftEvent;

    if (!startTime || !startDate) {
      console.error("Date and time required");
      // TODO: Show error message
      return;
    }

    await CalSyncApi.createEvent({
      title,
      description,
      duration,
      startDate,
      startTime,
      tagName: tagName || null,
      isPublic,
    });
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
  addTagListener(formElement);
  addEventIsPublicListener(formElement);
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

function updateInputFromQueryParams() {
  const calendar = document.getElementById(
    "create-event-calendar",
  ) as HTMLInputElement;
  const params = new URLSearchParams(window.location.search);
  if (!params.has("date")) {
    return;
  }
  calendar.value = params.get("date") || "";
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
  const eventTagInput: HTMLInputElement = formElement["event-tag"];
  const eventTimeInput: HTMLInputElement = formElement["event-time"];
  const eventIsPublicInput: HTMLInputElement = formElement["event-is-public"];
  const calendar = document.getElementById(
    "create-event-calendar",
  ) as HTMLInputElement;

  const params = new URLSearchParams(window.location.search);

  eventDescriptionInput.value = state.draftEvent.description || "";
  eventTitleInput.value = state.draftEvent.title || "";
  eventTimeInput.value = state.draftEvent.startTime || "";
  eventTagInput.value = state.draftEvent.tagName || "";
  calendar.value = state.draftEvent.startDate || params.get("date") || "";
  eventIsPublicInput.checked = state.draftEvent.isPublic || false;
}

function updateExistingTags(tags: WithId<TagData>[]) {
  const existingTagsDatalist: HTMLDataListElement = document.getElementById(
    "existing-tags",
  ) as HTMLDataListElement;
  existingTagsDatalist.replaceChildren(
    ...tags.map((tag) => {
      const option = document.createElement("option");
      option.innerText = tag.name;
      option.value = tag.name;
      return option;
    }),
  );
}

function setupTagInput() {}

async function initCreatePage() {
  setupHashListener();
  syncStep();
  setupCalendarListeners();
  updateInputFromQueryParams();
  const tags = await CalSyncApi.getAllTags();
  updateExistingTags(tags);
  setupTagInput();

  store.subscribe(updateInputs);
}

safeOnLoad(initCreatePage);
