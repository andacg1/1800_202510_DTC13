import { html, LitElement } from "lit";
import install from "@twind/with-web-components";
import { twConfig } from "../twConfig";
import "../../styles/style.css";

import { customElement, property } from "lit/decorators.js";

const withTwind = install(twConfig);

@customElement("bottom-navbar")
export class BottomNavbar extends withTwind(LitElement) {
  @property()
  name = "Somebody";

  render() {
    return html`<div class="fixed bottom-0 left-0 w-full h-32  bg-amber-300">
      <sl-button variant="primary">Primary</sl-button>
      <sl-button variant="default">Default</sl-button>
      <sl-button variant="primary" outline>Primary</sl-button>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "bottom-navbar": BottomNavbar;
  }
}
