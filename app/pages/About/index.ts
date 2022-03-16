import Page from "../../classes/Page";

export default class About extends Page {
  returnPageSet = true;
  constructor() {
    super({
      classes: {
        active: "about--active",
      },
      element: ".about",
      elements: {
        wrapper: ".about__wrapper",
        toggle: ".credits__toggle",
        creditsList: ".about__credits__podlist",
        credits: ".credits",
        toggleText: ".credits__toggle__text",
        link: ".about__link",
        pod: document.querySelector<HTMLElement>(".about__credits__podname"),
      },
      isScrollable: true,
    });

    this.addEventListeners();
  }

  show() {
    this.returnPageSet = true;
    this.element.classList.add(this.classes.active);
  }

  onResize(): void {
    window.requestAnimationFrame(() => {
      this.scroll.limit =
        this.elements.wrapper.scrollHeight -
        this.elements.wrapper.clientHeight +
        window.innerHeight * 0.1;
    });
  }

  async hide() {
    await super.hide();
    this.element.classList.remove(this.classes.active);
  }

  addEventListeners(): void {
    this.elements.toggle.addEventListener("click", () => {
      this.elements.toggle.classList.toggle("active");
      this.elements.toggleText.classList.toggle("active");
      this.elements.creditsList.classList.toggle("active");
      this.onResize();
      window.requestAnimationFrame(() => {
        this.scroll.target += this.elements.pod.clientHeight + 64;
      });
    });

    this.elements.link.addEventListener("click", () => {
      if (this.returnPageSet) {
        window.history.back();
      } else {
        this.emit("navigate to home");
      }
    });
  }
}
