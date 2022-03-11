import EventEmitter from "events";
import { clamp, lerp } from "three/src/math/MathUtils";

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
  scroll;
  // isDown = false;
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
      touchPosition: 0,
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
  }

  show() {}

  hide() {
    this.element.classList.remove(this.classes.active);

    return Promise.resolve();
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
        this.elements.wrapper.scrollHeight - this.elements.wrapper.clientHeight;
    });
  }

  onWheel(scroll: number) {
    this.scroll.target += scroll;
  }

  onTouchDown(position: number) {
    this.scroll.touchPosition = position;
  }

  onTouchMove(position: number) {
    const diff = this.scroll.touchPosition - position;
    this.scroll.touchPosition = position;
    this.scroll.target += diff * 4;
  }

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
