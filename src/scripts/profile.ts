import { CalSyncApi } from "./CalSyncApi.ts";

const user = await CalSyncApi.getUser();
console.log(user);

const events = await CalSyncApi.getUserEvents();
console.log(events);

const event = await CalSyncApi.getEvent("fFfwAB5aR9AdOL4aBpdt");
console.log(event);
