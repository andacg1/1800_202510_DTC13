import { html, LitElement, css } from "lit";
import install from "@twind/with-web-components";
import config from "../../twind.config";
import "../../styles/style.css";

import { customElement, property } from "lit/decorators.js";

const withTwind = install(config);

@customElement("bottom-navbar")
export class BottomNavbar extends withTwind(LitElement) {
  static styles = css`
    .container {
      display: block;
      color: blue;
      position: fixed;
    }
  `;
  @property()
  name = "Somebody";

  render() {
    return html`<div
      class="container fixed bottom-0 left-0 w-dvw h-60 bg-amber-300"
    >
      Hello, ${this.name}!
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "bottom-navbar": BottomNavbar;
  }
}
