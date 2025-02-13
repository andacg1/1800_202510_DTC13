import { html, LitElement, css } from "lit";
import "../../styles/style.css";

import { customElement, property } from "lit/decorators.js";

@customElement("bottom-navbar")
export class BottomNavbar extends LitElement {
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
      class="container fixed bottom-0 left-0 w-dvw h-60 bg-amber-300 w-100"
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
