import type { EventData, WithId } from "./Api";
import { CalSyncApi } from "./CalSyncApi.ts";

export function createHtmlElement(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.firstElementChild as Element;
}

export const EventElement = (event: WithId<EventData>) => {
  const { startTime, id, title, description, duration, user } = event;
  const { amPm, hours, minutes, date } = CalSyncApi.getDateParts(
    startTime.seconds,
  );
  return createHtmlElement(`
            <a href="/event.html?id=${id}" class="list-row">
            <div class="text-4xl font-thin opacity-30 tabular-nums text-center min-w-12">
            <div class="">${date.getDate()}</div>
            <div class="text-sm text-primary">${
              date.toString().split(" ")[1]
            }</div>
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
  `);
};
