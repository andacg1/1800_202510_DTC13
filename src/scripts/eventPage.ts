import { AttendanceData, CustomEventData, EventData } from "./Api";
import { CalSyncApi } from "./CalSyncApi.ts";
import safeOnLoad from "./lib/safeOnLoad.ts";
import "add-to-calendar-button";
import {
  getDateParts,
  getPaddedTime,
  getTimeParts,
  toShortISO,
} from "./lib/temporal.ts";
import { doc, getDoc } from "firebase/firestore";

function getEventId(): string | null {
  console.debug("Current URL:", window.location.href); // Log the full URL

  const params = new URLSearchParams(window.location.search);
  console.debug("URLSearchParams:", params.toString()); // Debugging log

  const eventId = params.get("id");
  console.debug("Extracted event ID:", eventId); // Debugging log
  return eventId;
}

async function fetchEventData(eventId: string | null) {
  if (!eventId) {
    alert("Error: No event ID found in the URL.");
    throw new Error("id= query parameter is required");
  }

  const event = await CalSyncApi.getEvent(eventId);

  if (!event) {
    alert(`Error: Event with ID ${eventId} not found.`);
    throw new Error(`Could not find event with id=${eventId}`);
  }

  console.debug("Fetched event data:", event);
  return event;
}

function timeUntil(targetDate: Date) {
  const currentTs = Date.now();
  const msDiff = targetDate.getTime() - currentTs;
  let seconds = Math.floor((msDiff % 6e4) / 1000);
  let minutes = Math.floor((msDiff % 36e5) / 6e4);
  let hours = Math.floor((msDiff / 36e5) % 24);
  let days = Math.round(msDiff / 36e5 / 24);
  const pastEvent = [seconds, minutes, hours, days].some((time) => time < 0);
  return {
    seconds: Math.abs(seconds),
    minutes: Math.abs(minutes),
    hours: Math.abs(hours),
    days: Math.min(99, Math.abs(days)),
    pastEvent,
  };
}

function updateCountdown(targetDate: Date) {
  const { seconds, minutes, hours, days, pastEvent } = timeUntil(targetDate);
  const daysEl: HTMLElement = document.getElementById(
    "countdown-days",
  ) as HTMLElement;
  const hoursEl: HTMLElement = document.getElementById(
    "countdown-hours",
  ) as HTMLElement;
  const minutesEl: HTMLElement = document.getElementById(
    "countdown-minutes",
  ) as HTMLElement;
  const secondsEl: HTMLElement = document.getElementById(
    "countdown-seconds",
  ) as HTMLElement;
  daysEl.style.setProperty("--value", String(days));
  hoursEl.style.setProperty("--value", String(hours));
  minutesEl.style.setProperty("--value", String(minutes));
  secondsEl.style.setProperty("--value", String(seconds));

  const agoEl = document.getElementById("countdown-ago") as HTMLElement;
  if (pastEvent) {
    agoEl.classList.remove("hidden");
    agoEl.classList.add("flex");
  } else {
    agoEl.classList.remove("flex");
    agoEl.classList.add("hidden");
  }
}

function scheduleCountdownUpdate(event: CustomEventData) {
  const countdownCb = updateCountdown.bind(
    updateCountdown,
    event.startTimeParts.date,
  );
  const interval = setInterval(countdownCb, 1000);
}

function updateAddEventButton(event: CustomEventData) {
  const addToCalendarContainerEl = document.getElementById(
    "add-to-calendar-container",
  ) as HTMLElement;
  // TODO: Calculate endTime and endDate
  // TODO: Add organizer (related User)
  const addToCalendarEl = document.createElement("add-to-calendar-button");

  Object.assign(addToCalendarEl, {
    name: event.title,
    description: event.description,
    startDate: toShortISO(event.startTimeParts.date),
    startTime: event.startTimeParts.timeISO,
  });

  const endDate = new Date(event.startTimeParts.date);
  endDate.setHours(endDate.getHours() + event.duration / 60);
  const endDateParts = CalSyncApi.getDateParts(endDate.getSeconds());

  const paddedStartTime = getPaddedTime(event.startTimeParts.timeISO);
  const paddedEndTime = getPaddedTime(endDateParts.timeISO);
  // FIXME

  console.debug({ paddedEndTime, paddedStartTime });

  addToCalendarContainerEl.innerHTML = `
  <add-to-calendar-button
    name="${event.title}"
    startDate="${toShortISO(event.startTimeParts.date)}"
    startTime="${paddedStartTime}"
    endDate="${toShortISO(endDate)}"
    endTime="${paddedEndTime}"
    description="${event.description}"
    options="'Apple','Google','iCal','Outlook.com'"
    label="Add to Calendar"
    iCalFileName="CalSync-Event"
    listStyle="overlay"
    size="5"
    lightMode="bodyScheme"
  >

  </add-to-calendar-button>
  `;
}

function updateEventPage(event: CustomEventData) {
  const form = document.getElementById("event-details-form") as HTMLFormElement;
  const titleEl: HTMLInputElement = form["event-title"];
  const descriptionEl: HTMLInputElement = form["event-description"];
  const durationEl: HTMLInputElement = form["event-duration"];

  titleEl.value = event.title;
  descriptionEl.value = event.description;
  durationEl.value = String(event.duration);
  //attendingEl.value = String(event.duration);

  // Set event listeners
  titleEl.addEventListener("change", async (e) => {
    const target = e.target as HTMLInputElement;
    await CalSyncApi.updateEvent(event.id, { title: target.value });
  });

  descriptionEl.addEventListener("change", async (e) => {
    const target = e.target as HTMLInputElement;
    await CalSyncApi.updateEvent(event.id, { description: target.value });
  });

  durationEl.addEventListener("change", async (e) => {
    const target = e.target as HTMLInputElement;
    await CalSyncApi.updateEvent(event.id, { duration: Number(target.value) });
  });
}

function addUserAttendingListener(
  attendance: AttendanceData | null,
  eventId: string,
) {
  const form = document.getElementById("event-details-form") as HTMLFormElement;
  const userAttendingEl: HTMLInputElement = form["user-attending"];
  userAttendingEl.checked = !!attendance;

  // TODO: Hide if event is in the past
  userAttendingEl.disabled = false;

  // Set event listeners
  userAttendingEl.addEventListener("change", async (e) => {
    const target = e.target as HTMLInputElement;
    await CalSyncApi.setUserAttendanceFor(eventId, target?.checked);
  });
}

function addDeleteEventListener(event: CustomEventData) {
  const deleteButton = document.getElementById(
    "delete-event-button",
  ) as HTMLButtonElement;

  if (!deleteButton) {
    console.error("Delete button not found.");
    return;
  }

  deleteButton.addEventListener("click", async (e) => {
    e.preventDefault(); // ⬅️ Prevents form submission
    e.stopPropagation(); // ⬅️ Stops event bubbling
    if (confirm("Are you sure you want to delete this event?")) {
      console.debug(`Deleting event with ID: ${event.id}`);
      await CalSyncApi.deleteEvent(event.id);
    }
  });
}

async function loadEventTag(event: CustomEventData) {
  const tagInput = document.getElementById("event-tag") as HTMLInputElement;
  console.log("123", event.tag)
  if (event.tag) {
    try {
      console.log("456", CalSyncApi.db)
      const tagRef = doc(CalSyncApi.db, `tags/${event.tag.id}`);
      const tagSnap = await getDoc(tagRef);
      if (tagSnap.exists()) {
        const tagData = tagSnap.data();
        tagInput.value = tagData.name ?? "";
      } else {
        tagInput.value = "(Unknown Tag)";
      }
    } catch (error) {
      console.error("Failed to load tag:", error);
      tagInput.value = "(Error)";
    }
  } else {
    tagInput.value = "(No Tag)";
  }
}

async function initEventPage() {
  const eventId = getEventId();
  fetchEventData(eventId).then((event) => {
    updateEventPage(event);
    scheduleCountdownUpdate(event);
    updateAddEventButton(event);
    addDeleteEventListener(event);
    loadEventTag(event);
  });
  if (eventId) {
    CalSyncApi.getUserAttendanceFor(eventId).then((attendance) => {
      addUserAttendingListener(attendance, eventId);
    });
  }
}



safeOnLoad(initEventPage);
