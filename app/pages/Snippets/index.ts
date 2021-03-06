import Page from "../../classes/Page";

export default class Snippets extends Page {
  constructor() {
    super({
      classes: {
        active: "snippets--active",
      },
      element: ".snippets",
      elements: {
        wrapper: ".snippets__wrapper",
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
