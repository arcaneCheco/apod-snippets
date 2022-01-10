import Page from "../../classes/Page";

export default class Detail extends Page {
  constructor({ element }: { element: string }) {
    super({
      classes: {
        active: "detail--active",
      },
      element: element,
      elements: {
        wrapper: ".detail__wrapper",
      },
      isScrollable: false,
    });
  }

  // setData(id:string) {}

  show() {
    this.element.classList.add(this.classes.active);
  }

  async hide() {
    super.hide();
    this.element.classList.remove(this.classes.active);
  }
}
