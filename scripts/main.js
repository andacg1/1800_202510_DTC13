import { install } from "@twind/core";
import config from "../twind.config";

import "@shoelace-style/shoelace";
import "@shoelace-style/shoelace/dist/themes/light.css";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/rating/rating.js";
import "@shoelace-style/shoelace/dist/components/tab/tab.js";
// import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";

install(config);

// Set the base path to the folder you copied Shoelace's assets to
setBasePath("/shoelace");
// console.log("SCRIPT");
