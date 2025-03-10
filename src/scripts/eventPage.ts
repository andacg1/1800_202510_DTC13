import { CustomEventData, EventData } from "./Api";
import { CalSyncApi } from "./CalSyncApi.ts";
import safeOnLoad from "./lib/safeOnLoad.ts";

async function fetchEventData() {
  const params = new URLSearchParams(document.location.search);
  const eventId = params.get("id");
  if (!eventId) {
    throw new Error("id= query parameter is required");
  }
  const event = await CalSyncApi.getEvent(eventId);
  if (!event) {
    throw new Error(`Could not find event with id=${eventId}`);
  }
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

function updateEventPage(event: CustomEventData) {
  const form = document.getElementById("event-details-form") as HTMLFormElement;
  const titleEl: HTMLInputElement = form["event-title"];
  const descriptionEl: HTMLInputElement = form["event-description"];
  const durationEl: HTMLInputElement = form["event-duration"];

  titleEl.value = event.title;
  descriptionEl.value = event.description;
  durationEl.value = String(event.duration);
}

async function initEventPage() {
  const event = await fetchEventData();
  updateEventPage(event);
  scheduleCountdownUpdate(event);
}

safeOnLoad(initEventPage);
