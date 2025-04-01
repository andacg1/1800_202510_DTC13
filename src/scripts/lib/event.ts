import { EventData, WithId } from "../Api";
import { CalSyncApi } from "../CalSyncApi.ts";
import { EventElement } from "../components.ts";
import { toShortISO } from "./temporal.ts";

export function insertEvents(events: WithId<EventData>[], id: string) {
  const container = document.getElementById(id);
  const rows = events.map((event) => EventElement(event as WithId<EventData>));
  container?.replaceChildren(...rows);
}
