import ElementOverlay from "./element-overlay";
import { getElementBounds } from "./utils";

type ElementCallback<T> = (el: HTMLElement) => T;
type ElementPickerOptions = {
  parentElement?: Node;
  useShadowDOM?: boolean;
  onClick?: ElementCallback<void>;
  onHover?: ElementCallback<void>;
  elementFilter?: ElementCallback<boolean>;
};

export default class ElementPicker {
  private overlay: ElementOverlay;
  private active: boolean;
  private options?: ElementPickerOptions;
  private target?: HTMLElement;
  private mouseX?: number;
  private mouseY?: number;
  private tickReq?: number;

  constructor() {
    this.active = false;
    this.overlay = new ElementOverlay();
  }

  start(options: ElementPickerOptions): boolean {
    if (this.active) {
      return false;
    }

    this.active = true;
    this.options = options;
    document.addEventListener("mousemove", this.handleMouseMove, true);
    document.addEventListener("click", this.handleClick, true);
    document.addEventListener("keydown", this.handleKeyDown, true);
    this.overlay.addToDOM(
      options.parentElement ?? document.body,
      options.useShadowDOM ?? true
    );

    // this.tick();

    return true;
  }



  stop() {
    this.active = false;
    this.options = undefined;
    document.removeEventListener("mousemove", this.handleMouseMove, true);
    document.removeEventListener("click", this.handleClick, true);
    document.removeEventListener("keydown", this.handleKeyDown, true);
    this.overlay.removeFromDOM();
    this.target = undefined;
    this.mouseX = undefined;
    this.mouseY = undefined;

    if (this.tickReq) {
      window.cancelAnimationFrame(this.tickReq);
    }
  }

  private handleMouseMove = (event: MouseEvent) => {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    this.updateTarget();
  };

  private handleClick = (event: MouseEvent) => {
    if (this.target && this.options?.onClick) {
      this.options.onClick(this.target);
    }
    event.preventDefault();
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    let preventDefault = true;
    if(event.key == 'Escape')
    {
      this.stop();
    }
    else if(event.key === 'ArrowUp'){
      this.updateTarget(this.target?.parentElement);
    }
    else if(event.key === 'ArrowDown'){
      this.updateTarget(this.target?.firstElementChild as HTMLElement);
    }
    else if(event.key === 'ArrowLeft'){
      this.updateTarget(this.target?.previousElementSibling as HTMLElement);
    }
    else if(event.key === 'ArrowRight'){
      this.updateTarget(this.target?.nextElementSibling as HTMLElement);
    }
    else {
      preventDefault = false;
    }
    if(preventDefault)
      event.preventDefault();
  };

  private tick = () => {
    this.updateTarget();
    this.tickReq = window.requestAnimationFrame(this.tick);
  };

  private updateTarget(assignTarget: HTMLElement | null = null) {
    if (this.mouseX === undefined || this.mouseY === undefined) {
      return;
    }

    // Peek through the overlay to find the new target
    this.overlay.ignoreCursor();
    const elAtCursor = document.elementFromPoint(this.mouseX, this.mouseY);
    let newTarget = elAtCursor as HTMLElement;
    if(assignTarget)
      newTarget = assignTarget;
    this.overlay.captureCursor();

    // If the target hasn't changed, there's nothing to do
    if (!newTarget || newTarget === this.target) {
      return;
    }

    // If we have an element filter and the new target doesn't match,
    // clear out the target
    if (this.options?.elementFilter) {
      if (!this.options.elementFilter(newTarget)) {
        this.target = undefined;
        this.overlay.setBounds({ x: 0, y: 0, width: 0, height: 0 });
        return;
      }
    }

    this.target = newTarget;

    const bounds = getElementBounds(newTarget);
    this.overlay.setBounds(bounds);

    if (this.options?.onHover) {
      this.options.onHover(newTarget);
    }
  }
}
