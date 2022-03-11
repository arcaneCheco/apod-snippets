import EventEmitter from "events";

interface Props {
  element: any;
  elements: any;
}

export default class Component extends EventEmitter {
  selector;
  selectorChildren;
  element: any;
  elements: any;
  constructor({ element, elements }: Props) {
    super();

    this.selector = element;
    this.selectorChildren = { ...elements };

    this.create();
  }

  create() {
    if (this.selector instanceof window.HTMLElement) {
      this.element = this.selector;
    } else {
      this.element = document.querySelector(this.selector);
    }
    this.elements = {};
    Object.entries(this.selectorChildren).forEach(([key, entry]: any) => {
      if (
        entry instanceof window.HTMLElement ||
        entry instanceof window.NodeList ||
        Array.isArray(entry)
      ) {
        this.elements[key] = entry;
      } else {
        this.elements[key] = this.element.querySelectorAll(entry);

        if (this.elements[key].length === 0) {
          this.elements[key] = null;
        } else if (this.elements[key].length === 1) {
          this.elements[key] = this.element.querySelector(entry);
        }
      }
    });
  }
}
