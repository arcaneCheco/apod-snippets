import Component from "../classes/Component";
import GSAP from "gsap";

export default class Preloader extends Component {
  template: any;
  width;
  height;
  spotlight: gsap.core.Tween;
  constructor({ template }: any) {
    super({
      element: ".preloader",
      elements: {
        wrapper: ".preloader__wrapper",
        title: ".preloader__title",
        text: ".title1",
        progress: ".title2",
        abab: ".abab",
        baba: ".baba",
        notification: ".preloader__notification",
        notificationText: ".preloader__notification__text",
        assetName: ".preloader__notification__assetname",
      },
    });

    this.template = template;
    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;

    this.spotlight = GSAP.fromTo(
      ".spotlight",
      {
        x: "-50%",
        y: "-50%",
      },
      {
        x: "0",
        y: "0",
        duration: 10,
        repeat: -1,
        ease: "none",
      }
    );

    this.bindEvents();
  }

  bindEvents() {
    this.onEnter = this.onEnter.bind(this);
  }

  onAssetLoaded(progress: number, image: string) {
    this.elements.assetName.innerText = image;

    const percent = Math.round(100 * progress);

    this.elements.progress.innerText = `${percent}%`;

    document.documentElement.style.setProperty("--percent", String(percent));
  }

  onAllAssetsLoaded() {
    GSAP.to(this.elements.notificationText, {
      opacity: 0,
      duration: 1,
      repeat: 1,
      onRepeat: () => {
        this.elements.notificationText.innerText =
          "Ready! Click or press any key to enter.";
        this.elements.notification.classList.add("onloaded");
      },
    }).yoyo(true);

    document.addEventListener("click", this.onEnter);
    document.addEventListener("keypress", this.onEnter);
  }

  onEnter() {
    document.removeEventListener("click", this.onEnter);
    document.removeEventListener("keypress", this.onEnter);
    this.emit("enter site");
    this.hide();
  }

  hide() {
    GSAP.to(this.elements.text, {
      transform: "translate(0, 100%)",
      duration: 1,
    });
    GSAP.to(this.elements.abab, {
      transform: "translate(0, 103%)",
      duration: 1,
    });
    GSAP.to(this.elements.progress, {
      transform: "translate(0, -100%)",
      duration: 1,
    });
    GSAP.to(this.elements.baba, {
      transform: "translate(0, -103%)",
      duration: 1,
    });
    GSAP.to(this.element, {
      autoAlpha: 0,
      delay: 0.5,
      duration: 1.5,
      ease: "power1.in",
      onComplete: this.destroy.bind(this),
    });
  }

  destroy() {
    this.emit("destroy preloader");
    this.spotlight.kill();
    this.element.parentNode.removeChild(this.element);
  }
}
