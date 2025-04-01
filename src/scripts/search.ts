import { createTagsPlugin, Tag } from "@algolia/autocomplete-plugin-tags";
import { EventData, TagData, WithId } from "./Api";
import { CalSyncApi } from "./CalSyncApi.ts";
import { addTags } from "./data/addTags.ts";
import safeOnLoad from "./lib/safeOnLoad.ts";
import store from "./store.ts";
import { autocomplete, AutocompleteOptions } from "@algolia/autocomplete-js";

// @ts-ignore
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
  store.getState().setFilteredEvents(await CalSyncApi.searchAllEvents());
}

function focusAutocomplete() {
  const autocomplete = document.getElementById(
    "autocomplete-0-input",
  ) as HTMLInputElement;
  if (!autocomplete) {
    console.warn("Could not find autocomplete");
  }
  autocomplete?.focus();
}

const filterEvents = (query: string) => {
  const filterTag = store.getState().currentTag;
  const isPublicCheckbox: HTMLInputElement | null = document.querySelector(
    "[name='is-public-filter']",
  );
  const isPublic = isPublicCheckbox?.checked; // Get toggle state

  return store
    .getState()
    .filteredEvents.filter((event) => event.isPublic === isPublic) // Filter by public/private
    .filter((event) => {
      if (!filterTag) return true;
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
              const { userAttendance } = store.getState();
              // Algolia is making it really difficult to just reuse the EventElement function
              return html`
                <a
                  href="/event.html?id=${id}"
                  class="list-row hover:bg-neutral transition-all"
                >
                  <div
                    class="text-4xl font-thin opacity-30 tabular-nums text-center min-w-12"
                  >
                    <div class="">${date.getDate()}</div>
                    <div class="text-sm text-primary">
                      ${date.toString().split(" ")[1]}
                    </div>
                  </div>
                  <div class="list-col-grow gap-2 flex flex-col pt-2">
                    <div class="flex flex-row justify-between pr-1">
                      <span>${title}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 576 512"
                        height="14"
                        width="15.75"
                        style="display:${userAttendance.includes(id)
                          ? "inline"
                          : "none"}"
                      >
                        <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path
                          fill="var(--color-primary)"
                          d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 
1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 
2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 
225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
                        />
                      </svg>
                    </div>
                    <div class="text-xs uppercase font-semibold opacity-60">
                      ${hours}:${minutes} ${amPm}
                    </div>
                  </div>
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
      className: "btn text-xs mt-1",
      type: "radio",
      name: "tags",
      ariaLabel: tag.name,
      value: tag.id,
    });
    container.appendChild(input);
  }
  tagForm.append(container);
}

function toggleLabel() {
  focusAutocomplete();
  const label = document.getElementById("toggle-label");
  if (!label) {
    return;
  }
  const target = label.parentElement?.querySelector("input");
  label.textContent = target?.checked ? "Public Events" : "My Events";
}

function addIsPublicListener() {
  const isPublicInput = document.querySelector(
    "[name='is-public-filter']",
  ) as HTMLInputElement;
  isPublicInput.addEventListener("change", (e) => {
    toggleLabel();
  });
}

function addTagListener() {
  const tagForm = document.getElementById("filter-form") as HTMLFormElement;
  tagForm.addEventListener("change", (e) => {
    console.log(e);
    const targetTagId = (e.target as HTMLInputElement).value;
    const allTags = store.getState().tags;
    setTimeout(focusAutocomplete, 200);

    const newTag = allTags.find((tag) => tag.id == targetTagId);
    if (!newTag) {
      console.error(`Couldn't find tag with name: ${newTag}`);
      return;
    }
    store.getState().setCurrentTag(newTag);
  });
  tagForm.addEventListener("reset", (e) => {
    store.getState().setCurrentTag(null);
    setTimeout(focusAutocomplete, 200);
  });
}

async function initSearchPage() {
  const [tags] = await Promise.all([
    CalSyncApi.getAllTags(),
    loadAllEvents(),
    CalSyncApi.getUserAttendance(),
  ]);
  injectTags(tags);
  addTagListener();
  addIsPublicListener();
  //await addTags();
  enableAutocomplete({ plugins: [tagsPlugin] });
  toggleLabel();
}

safeOnLoad(initSearchPage);
