import "cally";
import type { App } from "../../window";
import "./store.ts";
import "./firebaseAPI_DTC13.ts";
import { hydrate } from "./hydrate";
import safeOnLoad from "./lib/safeOnLoad.ts";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import store from "./store.ts";
import "../main.tsx";

function addLogoutListener() {
  const logoutBtn = document.getElementById("logout-btn");
  if (!logoutBtn) {
    console.warn("Could not find logout-btn");
    return;
  }

  logoutBtn.addEventListener("click", async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      window.location.assign("/login.html");
    } catch (error) {
      console.error("Error signing out:", error);
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
    if (String(window.location).includes(href)) {
      dockLink.classList.add("dock-active");
    } else {
      dockLink.classList.remove("dock-active");
    }
  }
}

function initApp() {
  setAppState();
  injectElements().then(() => {
    updateDockLinks();
  });
  checkAuthState();
  updateDockLinks();
}

safeOnLoad(initApp);
