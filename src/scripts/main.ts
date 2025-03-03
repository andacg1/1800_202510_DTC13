import safeOnLoad from "./lib/safeOnLoad.ts";
import { toShortISO } from "./lib/temporal.ts";

type CalendarElement = Element & { getDayParts?: (date: Date) => string };

const testEventDates = new Set(["2025-03-23", "2025-03-20"]);

function getDayParts(date: Date): string {
  const isoDate = toShortISO(date);
  // console.log(isoDate);
  if (testEventDates.has(isoDate)) {
    return "event";
  }
  return "";
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
}

function initMainPage() {
  highlightEvents();
}

safeOnLoad(initMainPage);
