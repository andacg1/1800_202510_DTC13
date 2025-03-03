import "cally";
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

safeOnLoad(injectElements)
