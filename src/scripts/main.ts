import { getDoc, query, where, collection, getDocs } from "firebase/firestore";
import safeOnLoad from "./lib/safeOnLoad.ts";
import { toShortISO } from "./lib/temporal.ts";
import store from "./store.ts";
import { getUserRef } from "./lib/auth.ts";

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

// {"duration":60,"startTime":{"seconds":1744171440,"nanoseconds":0},"description":"demo","title":"Test event"}
const buildEventElement = ({
  description,
  duration,
  startTime,
  title,
}: UserEventData) => {
  // TODO: add nanoseconds
  const date = new Date(startTime.seconds * 1000);
  const [_dateISO, timeISO, period] = date.toLocaleString("en-US").split(" ");
  const [hours, minutes] = timeISO.split(":");

  const rowEl = document.createElement("li");
  rowEl.classList.add("list-row");
  rowEl.innerHTML = `
            <div class="text-4xl font-thin opacity-30 tabular-nums text-center min-w-12">
<div class="">${date.getDate()}</div>
<div class="text-sm text-primary">${date.toString().split(" ")[1]}</div>
</div>
            <div class="list-col-grow gap-2 flex flex-col pt-2">
              <div>${title}</div>
              <div class="text-xs uppercase font-semibold opacity-60">
                ${hours}:${minutes} ${period}
              </div>
            </div>
            <button class="btn btn-square btn-ghost">
              <svg
                class="size-[1.2em]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  stroke-linejoin="round"
                  stroke-linecap="round"
                  stroke-width="2"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M6 3L20 12 6 21 6 3z"></path>
                </g>
              </svg>
            </button>
  `;
  return rowEl;
};

async function getUserEvents() {
  const { db } = store.getState();

  const q = query(
    collection(db, "events"),
    where("user", "==", await getUserRef()),
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => doc.data());
}

async function insertUserEvents() {
  const events = await getUserEvents();
  console.log(events);
  const container = document.getElementById("main-event-list");
  const rows = events.map((event) => buildEventElement(event as UserEventData));
  container?.replaceChildren(...rows);
}

function initMainPage() {
  highlightEvents();
  insertUserEvents();
}

safeOnLoad(initMainPage);
