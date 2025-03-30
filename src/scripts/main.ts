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
  console.debug(calendar);
  calendar!.getDayParts = getDayParts;
  calendar.addEventListener("change", handleDateChange);
}

// {"duration":60,"startTime":{"seconds":1744171440,"nanoseconds":0},"description":"demo","title":"Test event"}

async function insertUserEvents(events: WithId<EventData>[]) {
  //const events = await CalSyncApi.getUserEvents();
  //store.getState().setFilteredEvents(events);
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

async function handleStoreUpdate(state: AppStoreState) {
  highlightEvents();
  await insertUserEvents(state.filteredEvents);
}

function addCalendarListener() {
  const calendar: CalendarElement | null = document.querySelector(
    "#my-events-calendar",
  );
  calendar?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const path = e.composedPath();

    const target = path?.[0] as HTMLButtonElement;
    if (!target) {
      console.debug("Could not find click target");
      return;
    }

    const partAttr = target.attributes.getNamedItem("part");
    if (!partAttr || !partAttr.value.includes("day")) {
      console.debug("Clicked outside of a date button");
      return;
    }

    if (target.querySelector("button")) {
      console.debug("Date is already active");
      return;
    }
    // Setup
    target.classList.add("relative");
    target.style.position = "relative";
    target.style.zIndex = "10";
    const plusBtn = document.createElement("button");
    Object.assign(plusBtn.style, {
      position: "absolute",
      bottom: "100%",
      left: "0",
      backgroundColor: "var(--color-secondary)",
      color: "var(--color-white)",
      borderRadius: "4px",
      opacity: "0",
      transition: "ease-out 0.2s all",
      transform: "translateY(100%)",
      fontSize: "2em",
      zIndex: "5",
    } satisfies Partial<CSSStyleDeclaration>);

    plusBtn.innerText = "+";
    const blurHandler = () => {
      setTimeout(() => {
        plusBtn.style.transform = "translateY(100%)";
        plusBtn.style.opacity = "0";
        // Workaround to animate blur event
        setTimeout(() => {
          plusBtn.remove();
          target.classList.remove("relative");
          target.style.position = "static";
        }, 100);
      }, 200);
    };
    const createEventHandler = (e: MouseEvent) => {
      console.log(calendar);
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.assign(`/create.html?date=${calendar?.value || ""}`);
    };
    target.appendChild(plusBtn);
    // Can't read the animation keyframes from inside the shadow DOM, so
    // this is a workaround
    setTimeout(() => {
      plusBtn.style.transform = "translateY(0%)";
      plusBtn.style.opacity = "1";
    }, 0);
    plusBtn.addEventListener("click", createEventHandler);
    target.addEventListener("focusout", blurHandler);
  });
}

async function initMainPage() {
  addCalendarListener();
  await CalSyncApi.getUserAttendance();
  await CalSyncApi.getUserEvents();
  await insertUserEvents(store.getState().filteredEvents);

  store.subscribe(handleStoreUpdate);
  highlightEvents();
}

safeOnLoad(initMainPage);
