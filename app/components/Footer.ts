import Component from "../classes/Component";
import GSAP from "gsap";

export default class Footer extends Component {
  soundAnimation: gsap.core.Tween;
  isSoundOn = true;
  isSocialOpen = false;
  constructor() {
    super({
      element: ".footer",
      elements: {
        soundIconWrapper: ".footer__sound",
        soundIcon: ".footer__sound__icon__path",
        socialToggle: ".footer__social__icon__path",
        socialToggleWrapper: ".footer__social__toggle",
        socialIcons: ".footer__social_icons",
        testIcons: ".footer__social",
      },
    });

    GSAP.set(this.elements.soundIcon, {
      attr: {
        d: this.elements.soundIcon.getAttribute("data-d-on"),
      },
    });

    this.bindEvents();
    this.addEventListeners();
    this.ons();
  }

  ons() {
    this.soundAnimation = GSAP.to(this.elements.soundIcon, {
      x: "120",
      repeat: -1,
      ease: "none",
      duration: 4,
    });
  }

  onClick() {
    if (this.isSoundOn) {
      GSAP.to(this.elements.soundIcon, {
        duration: 0.3,
        attr: {
          d: this.elements.soundIcon.getAttribute("data-d-off"),
        },
      });

      this.emit("sound disabled");
    } else {
      GSAP.to(this.elements.soundIcon, {
        duration: 0.3,
        attr: {
          d: this.elements.soundIcon.getAttribute("data-d-on"),
        },
      });
      this.emit("sound enabled");
    }
    this.isSoundOn = !this.isSoundOn;
  }

  closeSocial() {
    if (this.isSocialOpen === false) return;
    GSAP.to(this.elements.socialToggle, {
      duration: 0.3,
      rotateZ: 0,
      transformOrigin: "center",
    });
    this.elements.socialIcons.style.pointerEvents = "none";
    GSAP.fromTo(
      this.elements.socialIcons,

      { x: "0", autoAlpha: 1 },
      {
        duration: 0.3,
        autoAlpha: 0,
        x: "7rem",
      }
    );
    this.isSocialOpen = false;
  }

  openSocial() {
    if (this.isSocialOpen === true) return;
    GSAP.to(this.elements.socialToggle, {
      duration: 0.3,
      rotateZ: 45,
      transformOrigin: "center",
    });
    this.elements.socialIcons.style.pointerEvents = "all";
    GSAP.fromTo(
      this.elements.socialIcons,
      { x: "7rem", autoAlpha: 0 },
      {
        duration: 0.3,
        x: "0",
        autoAlpha: 1,
      }
    );
    this.isSocialOpen = true;
  }

  bindEvents() {
    this.onClick = this.onClick.bind(this);
    this.openSocial = this.openSocial.bind(this);
    this.closeSocial = this.closeSocial.bind(this);
  }

  addEventListeners(): void {
    this.elements.soundIconWrapper.addEventListener("click", this.onClick);
    this.elements.socialToggleWrapper.addEventListener(
      "mouseenter",
      this.openSocial
    );
    this.elements.socialToggleWrapper.addEventListener(
      "mousedown",
      this.closeSocial
    );
    this.elements.socialToggleWrapper.addEventListener(
      "touchstart",
      this.openSocial
    );
    this.elements.testIcons.addEventListener("mouseleave", this.closeSocial);
  }
}
