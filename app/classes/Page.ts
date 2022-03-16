import EventEmitter from "events";
import { clamp, lerp } from "three/src/math/MathUtils";

// StrictUnion type from https://stackoverflow.com/questions/69218241/property-does-not-exist-on-type-union
type UnionKeys<T> = T extends T ? keyof T : never;
type StrictUnionHelper<T, TAll> = T extends any
  ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>>
  : never;
type StrictUnion<T> = StrictUnionHelper<T, T>;

interface Classes {
  [key: string]: string;
  active: string;
}
type MainSelector = string | HTMLElement;
interface OtherSelectors {
  [key: string]: MainSelector | NodeListOf<HTMLElement>;
  wrapper: MainSelector | NodeListOf<HTMLElement>;
}
type PageElement = StrictUnion<HTMLElement | NodeListOf<HTMLElement>>;
type PageElementRecord = Record<string, PageElement> & { wrapper: HTMLElement };

export default class Page extends EventEmitter {
  classes: Classes;
  element: HTMLElement;
  elements: PageElementRecord;
  isScrollable: boolean;
  scroll = {
    ease: 0.07,
    position: 0,
    current: 0,
    target: 0,
    limit: 5000,
    last: 0,
    touchPosition: 0,
  };
  constructor({
    classes,
    element,
    elements,
    isScrollable = true,
  }: {
    classes: Classes;
    element: MainSelector;
    elements: OtherSelectors;
    isScrollable?: boolean;
  }) {
    super();

    this.classes = {
      ...classes,
    };

    this.isScrollable = isScrollable;

    this.create(element, elements);
  }

  create(mainSelector: MainSelector, otherSelectors: OtherSelectors) {
    this.element =
      typeof mainSelector === "string"
        ? document.querySelector(mainSelector)
        : mainSelector;

    this.elements = {} as PageElementRecord;

    Object.entries(otherSelectors).forEach(([key, selector]) => {
      if (typeof selector === "string") {
        this.elements[key] = this.element.querySelectorAll(selector);

        if (this.elements[key].length === 0) {
          this.elements[key] = null;
        } else if (this.elements[key].length === 1) {
          this.elements[key] = this.elements[key][0] as PageElement;
        }
      } else {
        this.elements[key] = selector as PageElement;
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
