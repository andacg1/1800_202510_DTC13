import "cally";
import { library, icon } from "@fortawesome/fontawesome-svg-core";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { hydrate } from "./hydrate";

library.add(faCamera);

const camera = icon({ prefix: "fas", iconName: "camera" });

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
