import { UserData, WithId } from "./Api";
import { CalSyncApi } from "./CalSyncApi.ts";
import safeOnLoad from "./lib/safeOnLoad.ts";

const tags = await CalSyncApi.getAllTags();
console.log(tags);

async function fetchUserData() {
  const user = await CalSyncApi.getUser();
  console.log("Fetched user data:", user); // Debugging

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
