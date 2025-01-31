import { BoundingBox } from "./utils";

export default class ElementOverlay {
  overlay: HTMLDivElement;
  shadowContainer: HTMLDivElement;
  shadowRoot: ShadowRoot;
  usingShadowDOM?: boolean;

  constructor() {
    this.overlay = document.createElement("div");
    this.overlay.className = "_ext-element-overlay";
    this.overlay.style.background = "rgba(250, 240, 202, 0.2)";
    this.overlay.style.borderColor = "#F95738";
    this.overlay.style.borderStyle = "solid";
    this.overlay.style.borderRadius = "1px";
    this.overlay.style.borderWidth = "1px";
    this.overlay.style.boxSizing = "border-box";
    this.overlay.style.cursor = "crosshair";
    this.overlay.style.position = "absolute";
    this.overlay.style.zIndex = "2147483647";

    this.shadowContainer = document.createElement("div");
    this.shadowContainer.className = "_ext-element-overlay-container";
    this.shadowContainer.style.position = "absolute";
    this.shadowContainer.style.top = "0px";
    this.shadowContainer.style.left = "0px";
    this.shadowRoot = this.shadowContainer.attachShadow({ mode: "open" });
  }

  addToDOM(parent: Node, useShadowDOM: boolean) {
    this.usingShadowDOM = useShadowDOM;
    if (useShadowDOM) {
      parent.insertBefore(this.shadowContainer, parent.firstChild);
      this.shadowRoot.appendChild(this.overlay);
    } else {
      parent.appendChild(this.overlay);
    }
  }

  removeFromDOM() {
    this.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    this.overlay.remove();
    if (this.usingShadowDOM) {
      this.shadowContainer.remove();
    }
  }

  captureCursor() {
    this.overlay.style.pointerEvents = "auto";
  }

  ignoreCursor() {
    this.overlay.style.pointerEvents = "none";
  }

  setBounds({ x, y, width, height }: BoundingBox) {
    this.overlay.style.left = x + "px";
    this.overlay.style.top = y + "px";
    this.overlay.style.width = width + "px";
    this.overlay.style.height = height + "px";
  }
}
