import Page from "../../classes/Page";
import GSAP from "gsap";

export default class Home extends Page {
  constructor() {
    super({
      classes: {
        active: "home--active",
      },
      element: ".home",
      elements: {
        wrapper: ".home__wrapper",
        particles: ".home__particles",
      },
      isScrollable: false,
    });
  }

  show() {
    GSAP.to(this.element, { autoAlpha: 1, duration: 0.5, ease: "expo.in" });
    this.element.classList.add(this.classes.active);
  }

  hide() {
    return new Promise<void>((resolve) => {
      GSAP.to(this.element, {
        autoAlpha: 0,
        duration: 0.5,
        ease: "expo.out",
        onComplete: () => {
          this.element.classList.remove(this.classes.active);
          resolve();
        },
      });
    });
  }
}
