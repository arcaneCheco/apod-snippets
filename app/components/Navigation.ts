import Component from "../classes/Component";
import GSAP from "gsap";

export default class Navigation extends Component {
  progress: any;
  isOpen;
  constructor() {
    super({
      element: ".navigation",
      elements: {
        listWrapper: ".navigation__list__wrapper",
        list: ".navigation__list",
        listItems: ".navigation__list__item",
        overlay: ".navigation__overlay",
        overlayPath: ".navigation__overlay__path",
        icon: ".navigation__icon__svg",
        iconPath: ".navigation__icon__path",
      },
    });

    this.isOpen = false;

    GSAP.set(this.elements.iconPath, {
      attr: {
        d: this.elements.iconPath.getAttribute("data-d"),
      },
    });
    GSAP.set(this.elements.overlayPath, {
      attr: {
        d: this.elements.overlayPath.getAttribute("data-d-curve"),
      },
    });
    this.addEventListeners();
  }

  open() {
    this.isOpen = true;
    GSAP.to(this.elements.iconPath, {
      duration: 0.5,
      attr: {
        d: this.elements.iconPath.getAttribute("data-d-click"),
      },
    });
    GSAP.to(this.elements.overlay, {
      duration: 0.5,
      width: "100%",
      ease: "power2.in",
    });
    GSAP.to(this.elements.overlayPath, {
      duration: 0.3,
      delay: 0.5,
      attr: {
        d: this.elements.overlayPath.getAttribute("data-d"),
      },
      ease: "power2.out",
    });

    this.elements.list.style.visibility = "visible";

    GSAP.fromTo(
      this.elements.listItems,
      { x: 200, autoAlpha: 0 },
      {
        x: 0,
        duration: 0.3,
        autoAlpha: 1,
        delay: 0.5,
        stagger: 0.1,
      }
    );
  }

  close() {
    this.isOpen = false;
    GSAP.to(this.elements.iconPath, {
      duration: 0.5,
      attr: {
        d: this.elements.iconPath.getAttribute("data-d"),
      },
    });
    GSAP.to(this.elements.overlay, {
      duration: 0.5,
      delay: 0.3,
      width: "0",
      ease: "power2.out",
    });
    GSAP.to(this.elements.overlayPath, {
      duration: 0.3,
      ease: "power2.in",
      attr: {
        d: this.elements.overlayPath.getAttribute("data-d-curve"),
      },
    });

    GSAP.fromTo(
      this.elements.listItems,
      { x: 0, autoAlpha: 1 },
      {
        x: 200,
        duration: 0.3,
        autoAlpha: 0,
        stagger: -0.1,
      }
    );
  }

  toggle() {
    if (this.isOpen) {
      this.emit("close nav");
      this.close();
    } else {
      this.emit("open nav");
      this.open();
    }
  }

  onMouseEnter() {
    if (!this.isOpen) {
      this.emit("enter nav icon");
      GSAP.to(this.elements.iconPath, {
        duration: 0.5,
        attr: {
          d: this.elements.iconPath.getAttribute("data-d-hover"),
        },
      });
    }
  }
  onMouseLeave() {
    if (!this.isOpen) {
      GSAP.to(this.elements.iconPath, {
        duration: 0.5,
        attr: {
          d: this.elements.iconPath.getAttribute("data-d"),
        },
      });
    }
  }

  onChange() {
    this.isOpen && this.close();
  }

  addEventListeners(): void {
    this.elements.icon.addEventListener(
      "mouseenter",
      this.onMouseEnter.bind(this)
    );
    this.elements.icon.addEventListener(
      "mouseleave",
      this.onMouseLeave.bind(this)
    );
    this.elements.icon.addEventListener("click", this.toggle.bind(this));

    this.elements.overlay.addEventListener("click", () => {
      this.onChange();
    });
  }
}
