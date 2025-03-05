import "cally";
import { App } from "../../window";
import { hydrate } from "./hydrate";
import safeOnLoad from "./lib/safeOnLoad.ts";

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

function initApp() {
  setAppState();
  injectElements();
}

safeOnLoad(initApp);
