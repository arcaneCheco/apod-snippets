import EventEmitter from "events";

// StrictUnion type from https://stackoverflow.com/questions/69218241/property-does-not-exist-on-type-union
type UnionKeys<T> = T extends T ? keyof T : never;
type StrictUnionHelper<T, TAll> = T extends any
  ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, never>>
  : never;
type StrictUnion<T> = StrictUnionHelper<T, T>;

export type MainSelector = string | HTMLElement;
export interface OtherSelectors {
  [key: string]: MainSelector | NodeListOf<HTMLElement>;
  wrapper: MainSelector | NodeListOf<HTMLElement>;
}

type SelectedChild = StrictUnion<HTMLElement | NodeListOf<HTMLElement>>;
type SelectedChildren = Record<string, SelectedChild> & {
  wrapper: HTMLElement;
};

export default class Component extends EventEmitter {
  element: HTMLElement;
  elements: SelectedChildren;
  constructor({
    element,
    elements,
  }: {
    element: MainSelector;
    elements: OtherSelectors;
  }) {
    super();

    this.create(element, elements);
  }

  create(mainSelector: MainSelector, otherSelectors: OtherSelectors) {
    this.element =
      typeof mainSelector === "string"
        ? document.querySelector(mainSelector)
        : mainSelector;

    this.elements = {} as SelectedChildren;

    Object.entries(otherSelectors).forEach(([key, selector]) => {
      if (typeof selector === "string") {
        this.elements[key] = this.element.querySelectorAll(selector);

        if (this.elements[key].length === 0) {
          this.elements[key] = null;
        } else if (this.elements[key].length === 1) {
          this.elements[key] = this.elements[key][0] as SelectedChild;
        }
      } else {
        this.elements[key] = selector as SelectedChild;
      }
    });
  }
}
