import { CalSyncApi } from "./CalSyncApi.ts";
import { insertEvents } from "./lib/event.ts";
import safeOnLoad from "./lib/safeOnLoad.ts";
import { insertUserEvents } from "./main.ts";
import store from "./store.ts";

async function initMyEventsPage() {
  const attendingEvents = await CalSyncApi.getUserAttendingEvents();
  console.log(attendingEvents);
  insertEvents(attendingEvents, "my-events-container");
}

safeOnLoad(initMyEventsPage);
