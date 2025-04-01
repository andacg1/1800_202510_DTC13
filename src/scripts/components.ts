import { tz } from "@date-fns/tz";
import { format, getDate } from "date-fns";
import type { EventData, WithId } from "./Api";
import { CalSyncApi } from "./CalSyncApi.ts";
import store from "./store.ts";

export function createHtmlElement(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.firstElementChild as Element;
}

export const EventElement = (event: WithId<EventData>) => {
  const { startTime, id, title, description, duration, user } = event;
  const { userAttendance } = store.getState();
  const { amPm, hours, minutes, date } = CalSyncApi.getDateParts(
    startTime.seconds,
  );
  return createHtmlElement(`
            <a href="/event.html?id=${id}" class="list-row hover:bg-neutral transition-all shadow-md">
            <div class="text-4xl font-thin tabular-nums text-center min-w-12">
            <div class="">${getDate(date, { in: tz("UTC") })}</div>
            <div class="text-sm text-secondary">${format(date, "LLL", { in: tz("UTC") })}</div>
            </div>
            <div class="list-col-grow gap-2 flex flex-col pt-2">
              <div class="flex flex-row justify-between pr-1">
                <span class="text-wrap max-w-[32ch] inline-block pr-2">${title}</span>
                ${userAttendance.includes(id) ? `<i class="fa-solid fa-star self-end text-primary"></i>` : ""}
              </div>
              <div class="text-xs uppercase font-semibold opacity-60">
                ${hours}:${minutes} ${amPm}
              </div>
              
            </div>
            </a>
  `);
};
