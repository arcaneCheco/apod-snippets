import Page from "../../classes/Page";
import GSAP from "gsap";

export default class Detail extends Page {
  observer: IntersectionObserver;
  constructor({ element }: { element: string }) {
    super({
      classes: {
        active: "detail--active",
      },
      element: element,
      elements: {
        wrapper: ".detail__wrapper",
        slice: ".detail__explanation__slice",
        textBox: ".detail__explanation__text__box",
        titleBox: ".detail__title__box",
        closeButton: ".detail__close",
      },
    });

    this.createObserver();
  }

  show() {
    GSAP.fromTo(
      this.element,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 2, delay: 1 }
    );
    this.element.classList.add(this.classes.active);
  }

  async hide() {
    this.onExitFullscreen();
    super.hide();
    this.element.classList.remove(this.classes.active);
  }

  createObserver() {
    this.observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            GSAP.fromTo(
              entry.target,
              { autoAlpha: 0 },
              {
                autoAlpha: 1,
                duration: 3,
              }
            );
          }
        });
      },
      { threshold: 0 }
    );

    this.elements.textBox.forEach((el) => this.observer.observe(el));
  }

  onEnterFullscreen() {
    this.isScrollable = false;

    this.elements.closeButton.style["pointer-events"] = "none";
    GSAP.to(this.elements.closeButton, {
      opacity: 0,
      duration: 1,
    });

    GSAP.to(this.elements.titleBox, {
      translateX: "-200%",
      duration: 1,
      ease: "power2.out",
    });

    this.elements.textBox.forEach((target, index) => {
      GSAP.to(target, {
        translateX: index % 2 === 1 ? "-200%" : "200%",
        duration: 1,
        ease: "power2.out",
      });
    });
  }

  onExitFullscreen() {
    this.isScrollable = true;

    this.elements.closeButton.style.pointerEvents = "";
    GSAP.to(this.elements.closeButton, {
      opacity: 1,
      duration: 1,
    });

    GSAP.to(this.elements.titleBox, {
      translateX: 0,
      duration: 1,
      ease: "power2.out",
    });

    this.elements.textBox.forEach((target) => {
      GSAP.to(target, {
        translateX: 0,
        duration: 1,
        ease: "power2.out",
      });
    });
  }

  update(): void {
    super.update();
    if (this.scroll.current < window.innerHeight * 0.7) {
      this.elements.closeButton.style.opacity = "1";
    } else {
      this.elements.closeButton.style.opacity = "0.4";
    }
  }
}
