import { createTagsPlugin, Tag } from "@algolia/autocomplete-plugin-tags";
import { EventData, TagData, WithId } from "./Api";
import { CalSyncApi } from "./CalSyncApi.ts";
import { addTags } from "./data/addTags.ts";
import safeOnLoad from "./lib/safeOnLoad.ts";
import store from "./store.ts";
import { autocomplete, AutocompleteOptions } from "@algolia/autocomplete-js";

import "@algolia/autocomplete-theme-classic";
import "@algolia/autocomplete-plugin-tags/dist/theme.min.css";

//let events: Awaited<ReturnType<typeof CalSyncApi.getUserEvents>> = [];

const tagsPlugin = createTagsPlugin<WithId<TagData>>({
  getTagsSubscribers() {
    return [
      {
        sourceId: "events",
        getTag({ item }) {
          return {
            ...item,
            label: item.name,
          };
        },
      },
    ];
  },
  transformSource() {
    return undefined;
  },
});

async function loadAllEvents() {
  store.getState().setFilteredEvents(await CalSyncApi.getUserEvents());
}

const filterEvents = (query: string) => {
  const filterTag = store.getState().currentTag;
  return store
    .getState()
    .filteredEvents.filter((event) => {
      if (!filterTag) {
        return true;
      }

      return event?.tag?.id === filterTag.id;
    })
    .filter((event) =>
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
};

function enableAutocomplete(
  options: Partial<AutocompleteOptions<WithId<EventData>>>,
) {
  autocomplete<WithId<EventData>>({
    container: "#autocomplete",
    openOnFocus: true,
    detachedMediaQuery: "none",
    debug: false,
    panelContainer: "#search-results-container",

    classNames: {
      list: "list bg-base-100 rounded-box shadow-md text-white",
      panel: "bg-base-200",
      root: "bg-base-200",
      detachedContainer: "bg-base-200",
      input: "bg-base-200 !text-white !ps-3",
      form: "bg-base-200",
      detachedOverlay: "bg-base-200",
      detachedSearchButton: "!bg-base-200",
      inputWrapper: "bg-base-300 text-white",
      detachedSearchButtonIcon: "bg-base-200",
      detachedFormContainer: "bg-base-200",
      source: "bg-base-200",
      sourceNoResults: "bg-base-200",
      panelLayout: "bg-base-200",
      submitButton: "!bg-base-200",
      clearButton: "!bg-base-100 !text-white",
      detachedCancelButton: "!bg-base-100 !text-white",
    },
    getSources() {
      return [
        {
          sourceId: "events",
          getItems({ query }) {
            return filterEvents(query);
          },
          getItemUrl({ item }) {
            return `/event.html?id=${item.id}`;
          },
          templates: {
            item({ item: event, html }) {
              const { startTime, id, title, description, duration, user } =
                event;
              const { amPm, hours, minutes, date } = CalSyncApi.getDateParts(
                startTime.seconds,
              );
              return html`
                <a href="/event.html?id=${id}" class="list-row">
                  <div
                    class="text-4xl font-thin opacity-30 tabular-nums text-center min-w-12"
                  >
                    <div class="">${date.getDate()}</div>
                    <div class="text-sm text-primary">
                      ${date.toString().split(" ")[1]}
                    </div>
                  </div>
                  <div class="list-col-grow gap-2 flex flex-col pt-2">
                    <div>${title}</div>
                    <div class="text-xs uppercase font-semibold opacity-60">
                      ${hours}:${minutes} ${amPm}
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
                </a>
              `;
            },
          },
          // ...
        },
      ];
    },

    ...options,
  });
}

function injectTags(tags: WithId<TagData>[]) {
  const tagForm = document.getElementById("filter-form") as HTMLFormElement;
  const container = document.createDocumentFragment();
  for (const tag of tags) {
    const input = document.createElement("input");
    Object.assign(input, {
      className: "btn",
      type: "radio",
      name: "tags",
      ariaLabel: tag.name,
      value: tag.id,
    });
    container.appendChild(input);
  }
  tagForm.append(container);
}

function addTagListener() {
  const tagForm = document.getElementById("filter-form") as HTMLFormElement;
  tagForm.addEventListener("change", (e) => {
    console.log(e);
    const targetTagId = (e.target as HTMLInputElement).value;
    const allTags = store.getState().tags;
    const newTag = allTags.find((tag) => tag.id == targetTagId);
    if (!newTag) {
      console.error(`Couldn't find tag with name: ${newTag}`);
      return;
    }
    store.getState().setCurrentTag(newTag);
  });
  tagForm.addEventListener("reset", (e) => {
    store.getState().setCurrentTag(null);
  });
}

async function initSearchPage() {
  await loadAllEvents();
  const tags = await CalSyncApi.getAllTags();
  injectTags(tags);
  addTagListener();
  //await addTags();
  enableAutocomplete({ plugins: [tagsPlugin] });
}

safeOnLoad(initSearchPage);
