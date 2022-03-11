import Page from "../../classes/Page";

export default class Explore extends Page {
  constructor() {
    super({
      classes: {
        active: "explore--active",
      },
      element: ".explore",
      elements: {
        wrapper: ".explore__wrapper",
      },
      isScrollable: false,
    });
  }

  show() {
    this.element.classList.add(this.classes.active);
  }

  async hide() {
    await super.hide();
    this.element.classList.remove(this.classes.active);
  }
}
