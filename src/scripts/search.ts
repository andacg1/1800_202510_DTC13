import { CalSyncApi } from "./CalSyncApi.ts";
import { EventElement } from "./components.ts";
import safeOnLoad from "./lib/safeOnLoad.ts";
import store from "./store.ts";

//let events: Awaited<ReturnType<typeof CalSyncApi.getUserEvents>> = [];

async function loadAllEvents() {
  store.getState().setFilteredEvents(await CalSyncApi.getUserEvents());
}

const filterEvents = (query: string) =>
  store
    .getState()
    .filteredEvents.filter((event) =>
      (event.description + " " + event.title)
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .slice(0, 5)
    .sort((a, b) => {
      const now = Date.now() / 1000;
      return (
        Math.abs(now - a.startTime.seconds) -
        Math.abs(now - b.startTime.seconds)
      );
    });

function addSearchListener() {
  const searchEl = document.getElementById(
    "event-search-input",
  ) as HTMLInputElement;
  const resultsContainerEl = document.getElementById(
    "search-results-container",
  ) as HTMLElement;

  searchEl.addEventListener("keyup", () => {
    const filteredEvents = filterEvents(searchEl.value);
    const fragment = document.createDocumentFragment();
    for (const event of filteredEvents) {
      const eventEl = document.createElement("a");
      eventEl.innerHTML = EventElement({
        ...CalSyncApi.getDateParts(event.startTime.seconds),
        title: event.title,
      });
      eventEl.classList.add("list-row");
      eventEl.href = `/event.html?id=${event.id}`;
      fragment.appendChild(eventEl);
    }
    resultsContainerEl.replaceChildren(fragment);
  });
}

async function initSearchPage() {
  loadAllEvents();
  addSearchListener();
}

safeOnLoad(initSearchPage);
