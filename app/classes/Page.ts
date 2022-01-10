import EventEmitter from "events";
import { clamp, lerp } from "three/src/math/MathUtils";
import GSAP from "gsap";

interface Props {
  classes: any;
  element: any;
  elements: any;
  isScrollable?: boolean;
}

export default class Page extends EventEmitter {
  classes;
  selectors;
  isScrollable;
  element: any;
  elements: any;
  isVisible: boolean;
  scroll;
  constructor({ classes, element, elements, isScrollable = true }: Props) {
    super();

    this.classes = {
      ...classes,
    };

    this.selectors = {
      element,
      elements: {
        ...elements,
      },
    };

    this.scroll = {
      ease: 0.07,
      position: 0,
      current: 0,
      target: 0,
      limit: 5000,
      last: 0,
    };

    this.isScrollable = isScrollable;

    this.create();
  }

  create() {
    this.element = document.querySelector(this.selectors.element);

    this.elements = {};

    Object.entries(this.selectors.elements).forEach(([key, selector]) => {
      if (
        selector instanceof window.HTMLElement ||
        selector instanceof window.NodeList
      ) {
        this.elements[key] = selector;
      } else if (Array.isArray(selector)) {
        this.elements[key] = selector;
      } else {
        this.elements[key] = this.element.querySelectorAll(selector);

        if (this.elements[key].length === 0) {
          this.elements[key] = null;
        } else if (this.elements[key].length === 1) {
          this.elements[key] = this.element.querySelector(selector);
        }
      }
    });

    this.setAnimations();
    this.setObserver();
    this.setPreloaders();
  }

  setAnimations() {}

  setObserver() {}

  setPreloaders() {}

  show() {
    this.isVisible = true;

    this.addEventListeners();
  }

  hide() {
    this.isVisible = false;

    this.removeEventListeners();

    this.element.classList.remove(this.classes.active);

    return new Promise<void>((resolve) => {
      window.setTimeout(resolve, 3500);
    });
    // return new Promise((resolve: any) => {
    //   GSAP.to(this.element, {
    //     autoAlpha: 0,
    //     duration: 0.5,
    //     onComplete: () => console.log("hello"),
    //   });
    // });
  }

  resetScroll() {
    this.scroll = {
      ease: 0.07,
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
      last: 0,
    };
  }

  setScroll(value: number) {
    this.scroll.current = this.scroll.target = this.scroll.last = value;

    this.transform(this.elements.wrapper, value);
  }

  transform(element: HTMLElement, y: number) {
    element.style.transform = `translate3d(0,${-Math.round(y)}px,0)`;
  }

  onResize() {
    window.requestAnimationFrame(() => {
      this.scroll.limit =
        this.elements.wrapper.clientHeight - window.innerHeight;
    });
  }

  onWheel(event: any): number {
    const { pixelY } = event;
    this.scroll.target += pixelY;
    return pixelY;
  }

  onTouchDown(event: Event) {}

  onTouchMove(event: Event) {}

  onTouchUp(event: Event) {}

  addEventListeners() {}

  removeEventListeners() {}

  update() {
    if (this.isScrollable) {
      this.scroll.target = clamp(this.scroll.target, 0, this.scroll.limit);

      this.scroll.current = lerp(
        this.scroll.current,
        this.scroll.target,
        this.scroll.ease
      );
      this.scroll.current = Math.floor(this.scroll.current);

      if (this.scroll.current < 0.1) {
        this.scroll.current = 0;
      }

      this.transform(this.elements.wrapper, this.scroll.current);

      this.scroll.last = this.scroll.current;
    }
  }
}
