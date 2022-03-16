import GSAP from "gsap";
import Component from "../classes/Component";
import Detection from "../classes/Detection";

export default class Icon extends Component {
  progress: number;
  paths: { element: SVGPathElement; pathLength: number }[] = [];
  template: string;
  constructor({ template }: { template: string }) {
    super({
      element: ".icon",
      elements: {
        wrapper: ".icon__wrapper",
        outer: ".icon__outer",
        inner: ".icon__inner",
        link: ".icon__link",
        svg: ".icon__svg",
        paths: "path",
        center: ".icon__center",
        sun: ".icon__sun",
        circle: ".icon__circle",
        white: ".icon__color__white",
        black: ".icon__color__black",
      },
    });
    this.template = template;

    this.setPaths();
  }

  setPaths() {
    this.elements.paths.forEach((element) => {
      const pathLength = element.getTotalLength();
      GSAP.set(element, {
        strokeDashoffset: pathLength,
        strokeDasharray: `${pathLength} ${pathLength}`,
      });
      this.paths.push({ element: element as SVGPathElement, pathLength });
    });
  }

  onAssetLoaded(percent: number) {
    this.paths.forEach((path) => {
      GSAP.to(path.element, {
        strokeDashoffset: (1 - percent) * path.pathLength,
        duration: 3 * percent,
      });
    });
  }

  setDefaultAnimation() {
    GSAP.to(this.elements.outer, {
      rotation: 360,
      duration: 12,
      repeat: -1,
      svgOrigin: "32 32",
    });
    GSAP.to(this.elements.inner, {
      rotation: -360,
      duration: 8,
      repeat: -1,
      svgOrigin: "32 32",
    });
    GSAP.to(this.elements.white, {
      attr: {
        offset: 0.33,
      },
      duration: 1,
      repeat: -1,
      delay: 1,
    }).yoyo(true);
  }

  onEnterSite() {
    Detection.isDesktop() && this.addEventListeners();
    this.show(this.template, true);
    this.setDefaultAnimation();
  }

  onMouseEnter() {
    this.emit("mouse enter icon");
    GSAP.to(this.elements.black, {
      attr: {
        offset: 0.16,
        duration: 1.5,
      },
    });
  }

  onMouseLeave() {
    this.emit("mouse exit icon");
    GSAP.to(this.elements.black, {
      attr: {
        offset: 0,
        duration: 1.5,
      },
    });
  }

  onDestroyPreloader() {
    this.element.classList.remove("icon__loading");
  }

  show(template: string, firstLoad?: boolean) {
    if (template === "/") {
      this.elements.link.style.pointerEvents = "all";
      GSAP.set(this.elements.svg, {
        transform: "translateY(0)",
      });
      GSAP.set(this.elements.wrapper, {
        height: "10vw",
        width: "10vw",
        top: "",
        left: "",
        opacity: 0.5,
        right: firstLoad ? "" : "20%",
      });
      GSAP.to(this.elements.wrapper, {
        right: "5%",
        duration: 1,
        opacity: 1,
        ease: "power2.out",
      });
      GSAP.set(this.elements.link, {
        attr: {
          href: "/snippets",
        },
      });
    } else if (template === "/snippets") {
      this.elements.link.style.pointerEvents = "all";
      GSAP.set(this.elements.wrapper, {
        opacity: 1,
        height: "5rem",
        width: "5rem",
        top: "10%",
        left: "0",
        right: "",
      });
      GSAP.fromTo(
        this.elements.svg,
        { transform: "translateY(5rem)" },
        {
          transform: "translateY(0)",
          duration: 1,
          ease: "back.out(1.4)",
        }
      );
      GSAP.set(this.elements.link, {
        attr: {
          href: "/",
        },
      });
    } else {
      GSAP.to(this.elements.wrapper, {
        duration: 1,
        opacity: 0,
      });
      this.elements.link.style.pointerEvents = "none";
    }
  }

  hide() {
    return new Promise<void>((resolve) => {
      this.elements.link.style.pointerEvents = "none";
      this.onMouseLeave();
      if (this.template === "/") {
        GSAP.to(this.elements.wrapper, {
          opacity: 0,
          duration: 1,
        });
      } else if (this.template === "/snippets") {
        GSAP.to(this.elements.svg, {
          transform: "translateY(8rem)",
          duration: 1,
          ease: "back.out(1.4)",
        });
      }
      window.setTimeout(resolve, 1001);
    });
  }

  async onChange(template: any) {
    await this.hide();
    this.show(template);
    this.template = template;
  }

  addEventListeners(): void {
    this.elements.link.addEventListener(
      "mouseenter",
      this.onMouseEnter.bind(this)
    );
    this.elements.link.addEventListener(
      "mouseleave",
      this.onMouseLeave.bind(this)
    );
  }
}
