import Page from "../../classes/Page";

export default class About extends Page {
  constructor() {
    super({
      classes: {
        active: "about--active",
      },
      element: ".about",
      elements: {
        wrapper: ".about__wrapper",
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
