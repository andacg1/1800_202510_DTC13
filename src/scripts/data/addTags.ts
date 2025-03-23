import { doc } from "firebase/firestore";
import { CalSyncApi } from "../CalSyncApi.ts";
import safeOnLoad from "../lib/safeOnLoad.ts";
import { pickRandom } from "../lib/util.ts";

export async function addTags() {
  const events = await CalSyncApi.getUserAttendance();
  //const tags = await CalSyncApi.getAllTags();

  console.debug(events);

  // for await (const event of events) {
  //   const tagRef = doc(CalSyncApi.db, "tags", pickRandom(tags).id);
  //
  //   CalSyncApi.updateEvent(event.id, {
  //     ...event,
  //     tag: tagRef,
  //   });
  // }
}

safeOnLoad(addTags);
