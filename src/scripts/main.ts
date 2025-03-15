import { EventData, WithId } from "./Api";
import { CalSyncApi } from "./CalSyncApi.ts";
import { createHtmlElement, EventElement } from "./components.ts";
import safeOnLoad from "./lib/safeOnLoad.ts";
import { toShortISO } from "./lib/temporal.ts";
import store, { AppStoreState } from "./store.ts";

type CalendarElement = HTMLInputElement & {
  getDayParts?: (date: Date) => string;
  change?: (event: Event) => void;
};

function getDayParts(date: Date): string {
  const isoDate = toShortISO(date);
  const eventDates = new Set(
    store.getState().filteredEvents.map((event) => {
      const { date } = CalSyncApi.getDateParts(event.startTime.seconds);
      return toShortISO(date);
    }),
  );
  if (eventDates.has(isoDate)) {
    return "event";
  }
  return "";
}

function handleDateChange(event: Event) {
  const dateString = (event.target as HTMLInputElement).value;
  console.log((event.target as HTMLInputElement).value);
  const events = store
    .getState()
    .filteredEvents.filter(
      (event) =>
        toShortISO(CalSyncApi.getDateParts(event.startTime.seconds).date) ===
        dateString,
    );

  const container = document.getElementById("main-event-list");
  const rows = events.map((event) => EventElement(event as WithId<EventData>));
  container?.replaceChildren(...rows);
}

function highlightEvents() {
  const calendar: CalendarElement | null = document.querySelector(
    "#my-events-calendar",
  );
  if (!calendar) {
    return;
  }
  console.log(calendar);
  calendar!.getDayParts = getDayParts;
  calendar.addEventListener("change", handleDateChange);
}

// {"duration":60,"startTime":{"seconds":1744171440,"nanoseconds":0},"description":"demo","title":"Test event"}

async function insertUserEvents() {
  const events = await CalSyncApi.getUserEvents();
  store.getState().setFilteredEvents(events);
  const calendar: CalendarElement | null = document.querySelector(
    "#my-events-calendar",
  );

  const todayString = toShortISO(new Date());
  const container = document.getElementById("main-event-list");
  const rows = events
    .filter(
      (event) =>
        toShortISO(CalSyncApi.getDateParts(event.startTime.seconds).date) ===
        todayString,
    )
    .map((event) => EventElement(event as WithId<EventData>));
  container?.replaceChildren(...rows);
}

function handleStoreUpdate(_state: AppStoreState) {
  highlightEvents();
}

async function initMainPage() {
  await insertUserEvents();
  store.subscribe(handleStoreUpdate);
  highlightEvents();
}

safeOnLoad(initMainPage);
