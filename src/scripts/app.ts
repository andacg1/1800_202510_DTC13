import "cally";
import type { App } from "../../window";
import "./store.ts";
import "./firebaseAPI_DTC13.ts";
import { hydrate } from "./hydrate";
import safeOnLoad from "./lib/safeOnLoad.ts";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import store from "./store.ts";

// Set the base path to the folder you copied Shoelace's assets to
console.log("SCRIPT");

function injectElements() {
  return Promise.allSettled([
    hydrate("/src/components/bottom-navbar.html", "#bottom-navbar"),
    hydrate("/src/components/top-navbar.html", "#top-navbar"),
  ]);
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
      if (!String(window.location).includes("login.html")) {
        window.location.assign("/login.html");
      }
    }
  });
}

function initApp() {
  setAppState();
  injectElements();
  checkAuthState();
}

safeOnLoad(initApp);
