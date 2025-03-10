import { UserData, WithId } from "./Api";
import { CalSyncApi } from "./CalSyncApi.ts";
import safeOnLoad from "./lib/safeOnLoad.ts";

const user = await CalSyncApi.getUser();
console.log(user);

const events = await CalSyncApi.getUserEvents();
console.log(events);

const event = await CalSyncApi.getEvent("fFfwAB5aR9AdOL4aBpdt");
console.log(event);

async function fetchUserData() {
  const user = await CalSyncApi.getUser();
  if (!user) {
    throw new Error("Could not find user");
  }
  return user;
}

function updateProfile(user: WithId<UserData>) {
  const userDetailsFormEl: HTMLFormElement = document.getElementById(
    "user-details-form",
  ) as HTMLFormElement;
  const emailEl: HTMLInputElement = userDetailsFormEl[
    "user-email"
  ] as HTMLInputElement;
  const nameEl: HTMLInputElement = userDetailsFormEl[
    "user-name"
  ] as HTMLInputElement;

  emailEl.value = user.email;
  nameEl.value = user.name;

  // Set event listeners
  emailEl.addEventListener("change", async (e) => {
    const target = e.target as HTMLInputElement;
    await CalSyncApi.updateUser(user.id, { email: target.value });
  });

  nameEl.addEventListener("change", async (e) => {
    const target = e.target as HTMLInputElement;
    await CalSyncApi.updateUser(user.id, { name: target.value });
  });
}

async function initProfilePage() {
  const user = await fetchUserData();
  updateProfile(user);
}

safeOnLoad(initProfilePage);
