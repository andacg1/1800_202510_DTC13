import "cally";
import type { App } from "../../window";
import "./store.ts";
import "./firebaseAPI_DTC13.ts";
import { CalSyncApi } from "./CalSyncApi.ts";
import { hydrate } from "./hydrate";
import safeOnLoad from "./lib/safeOnLoad.ts";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import store from "./store.ts";

function addLogoutListener() {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) {
    console.warn("Could not find logout-btn");
    return;
  }
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      logoutBtn.textContent = "Logout";
      logoutBtn.onclick = async () => {
        try {
          await signOut(auth);
          window.location.assign("/login.html");
        } catch (error) {
          console.error("Error signing out:", error);
        }
      };
    } else {
      logoutBtn.textContent = "Login";
      logoutBtn.onclick = () => {
        window.location.assign("/login.html");
      };
    }
  });
}

function injectElements() {
  return Promise.allSettled([
    hydrate("/src/components/bottom-navbar.html", "#bottom-navbar"),
    hydrate("/src/components/top-navbar.html", "#top-navbar"),
  ]).then(addLogoutListener);
}

const defaultAppState: App = {
  state: {
    create: {
      step: 0,
    },
  },
  db: null,
  app: null,
  auth: null,
};

function setAppState() {
  window.App = defaultAppState;
}

function checkAuthState() {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (currentUser) {
    store.setState({ userId: currentUser.uid });
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      store.setState({ userId: uid });
      // ...
    } else {
      // User is signed out
      // ...
      const publicPages = ["login.html", "index.html"];
      if (!publicPages.some((page) => String(window.location).includes(page))) {
        window.location.assign("/login.html");
      }
    }
  });
}

function updateDockLinks() {
  const dockEl = document.getElementById("bottom-navbar");
  const dockLinks = dockEl?.querySelectorAll("a");
  if (!dockLinks) {
    console.error("Could not find dock links");
    return;
  }
  for (const dockLink of dockLinks) {
    const href = dockLink.href;
    if (!href && String(window.location).includes("create")) {
      dockLink.classList.add("dock-active");
    } else if (href && String(window.location).includes(href)) {
      dockLink.classList.add("dock-active");
    } else {
      dockLink.classList.remove("dock-active");
    }
  }
}

function addDockButtonListeners() {
  const dockEl = document.getElementById("bottom-navbar");
  const eventMenuEl = document.getElementById(
    "dock-event-menu-toggle",
  ) as HTMLInputElement;
  const myEventsEl = document.getElementById(
    "dock-my-events",
  ) as HTMLButtonElement;
  const createEventEl = document.getElementById(
    "dock-create-event",
  ) as HTMLButtonElement;
  const container = myEventsEl?.parentElement as HTMLElement;

  if (eventMenuEl) {
    eventMenuEl.addEventListener("change", (e) => {
      if ((e.target as HTMLInputElement)?.checked) {
        container?.classList.add("flex");
        container?.classList.remove("hidden");
        container.focus();
      } else {
        container?.classList.add("hidden");
        container?.classList.remove("flex");
      }
    });
  }
  if (myEventsEl) {
    myEventsEl.addEventListener(
      "click",
      (e) => {
        // e.preventDefault();
        // e.stopPropagation();
        // TODO: create my-events.html
        window.location.assign("/search.html");
      },
      true,
    );
  }
  if (createEventEl) {
    createEventEl.addEventListener(
      "click",
      (e) => {
        // e.preventDefault();
        // e.stopPropagation();
        window.location.assign("/create.html");
      },
      true,
    );
  }

  if (eventMenuEl) {
    eventMenuEl?.addEventListener(
      "focusout",
      (e) => {
        if (container.contains(e?.relatedTarget as HTMLElement)) {
          return;
        }
        eventMenuEl.checked = false;
        container?.classList.add("hidden");
        container?.classList.remove("flex");
      },
      //true,
    );
  }
}

export async function updateFirestore() {
  const events = await CalSyncApi.getUserAttendance();
  //const tags = await CalSyncApi.getAllTags();

  // console.debug(events);

  // for await (const event of events) {
  //   const tagRef = doc(CalSyncApi.db, "tags", pickRandom(tags).id);
  //
  //   CalSyncApi.updateEvent(event.id, {
  //     ...event,
  //     tag: tagRef,
  //   });
  // }
}

window.updateFirestore = updateFirestore;

function initApp() {
  setAppState();
  injectElements().then(() => {
    updateDockLinks();
    addDockButtonListeners();
  });
  checkAuthState();
  updateDockLinks();
}

safeOnLoad(initApp);
