import Component, { MainSelector, OtherSelectors } from "./Component";
import { clamp, lerp } from "three/src/math/MathUtils";
interface Classes {
  [key: string]: string;
  active: string;
}

export default class Page extends Component {
  classes: Classes;
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
    element,
    elements,
    classes,
    isScrollable = true,
  }: {
    element: MainSelector;
    elements: OtherSelectors;
    classes: Classes;
    isScrollable?: boolean;
  }) {
    super({ element, elements });

    this.classes = {
      ...classes,
    };

    this.isScrollable = isScrollable;
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

  transform(element: HTMLElement | SVGPathElement, y: number) {
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
