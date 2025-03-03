import "cally";
import { hydrate } from "./hydrate";

// Set the base path to the folder you copied Shoelace's assets to
console.log("SCRIPT");

function injectElements() {
  return Promise.allSettled([
    hydrate("/src/components/bottom-navbar.html", "#bottom-navbar"),
    hydrate("/src/components/top-navbar.html", "#top-navbar"),
  ]);
}

if (
  document.readyState === "complete" ||
  document.readyState === "interactive"
) {
  injectElements();
} else {
  document.addEventListener("load", injectElements);
}
