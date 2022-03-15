import Canvas from "./components/Canvas";

import NormalizeWheel from "normalize-wheel";

import Page from "./classes/Page";
import Assets from "./classes/Assets";

import Home from "./pages/Home";
import About from "./pages/About";
import Snippets from "./pages/Snippets";
import Detail from "./pages/Detail";
import Preloader from "./components/Preloader";
import Icon from "./components/Icon";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

import { defineElement as defineBentoFitText } from "@bentoproject/fit-text";

// TODO
// get correct audio sources
// reduce audio file sizes
// favicon
// clean up typescript
// file names on prismic
// DONE

import Sound from "./components/Sound";
import Detection from "./classes/Detection";

class App {
  template: string;
  canvas: Canvas;
  home: Home;
  about: About;
  snippets: Snippets;
  detail: Detail;
  pages: { [key: string]: Page };
  page: Home | About | Snippets | Detail;
  assets: Assets;
  preloader: Preloader;
  icon: Icon;
  navigation: Navigation;
  footer: Footer;
  sound: Sound;
  isDown = false;
  touchEnd = { x: 0, y: 0 };
  constructor() {
    this.template = window.location.pathname;

    defineBentoFitText();

    this.setCanvas();
    this.setAssets();
    this.setPreloader();
    this.setIcon();
    this.setFooter();
    this.setNavigation();
    this.setPages();
    this.addLinkListeners();
  }

  setSound() {
    this.sound = new Sound();

    this.footer.on("sound enabled", () => {
      this.sound.enableSound();
    });
    this.footer.on("sound disabled", () => {
      this.sound.disableSound();
    });
    this.navigation.on("open nav", () => {
      this.sound.onOpenNav();
    });
    this.navigation.on("close nav", () => {
      this.sound.onCloseNav();
    });
    this.navigation.on("enter nav icon", () => {
      this.sound.onEnterNavIcon();
    });
    this.canvas.particles.on("vibrate particles start", () => {
      this.sound.onVibrateParticlesStart();
    });
    this.canvas.particles.on("vibrate particles end", () => {
      this.sound.onVibrateParticlesEnd();
    });
    this.canvas.detail.on("enter fullscreen", () => {
      this.sound.onEnterFullscreen();
    });
    this.canvas.detail.on("exit fullscreen", () => {
      this.sound.onExitFullscreen();
    });
    this.preloader.on("enter site", () => {
      this.sound.enableSound();
    });
  }

  setCanvas() {
    this.canvas = new Canvas({ template: this.template });
  }

  setAssets() {
    this.assets = new Assets(this.canvas.renderer);
    this.assets.on("asset loaded", (progress: number, image: string) => {
      this.preloader.onAssetLoaded(progress, image);
      this.icon.onAssetLoaded(progress);
    });
    this.assets.once("all assets loaded", () => {
      this.preloader.onAllAssetsLoaded();
      this.onPreloaded();
    });
  }

  setPreloader() {
    this.preloader = new Preloader({
      template: this.template,
    });

    this.preloader.on("enter site", () => {
      this.bindEvents();
      this.addEventListeners();
      this.onResize();
    });
  }

  setIcon() {
    this.icon = new Icon({
      template: this.template,
    });

    this.preloader.on("enter site", () => {
      this.icon.onEnterSite();
    });
    this.preloader.on("destroy preloader", () => {
      this.icon.onDestroyPreloader();
    });
  }

  setFooter() {
    this.footer = new Footer();
  }

  setNavigation() {
    this.navigation = new Navigation();
  }

  setPages() {
    this.home = new Home();
    this.about = new About();
    this.snippets = new Snippets();

    this.pages = {
      "/": this.home,
      "/about": this.about,
      "/snippets": this.snippets,
    };

    const detailElements = document.querySelectorAll(".detail");
    detailElements.forEach((element) => {
      this.pages[`/detail/${element.id}`] = new Detail({
        element: `#${element.id}`,
      });
    });

    this.page = this.pages[this.template];

    this.about.on("navigate to home", () => {
      this.onChange({ url: "/" });
    });
  }

  /**
   * Events
   */
  async onChange({ url, push = true }: any) {
    url = url.replace(window.location.origin, "");

    if (this.template === url) {
      this.navigation.onChange();
      return;
    }

    if (push) {
      window.history.pushState({}, "", url);
    }

    this.sound.onChange({ from: this.template, to: window.location.pathname });

    this.template = window.location.pathname;

    const page = this.pages[this.template];

    this.icon.onChange(this.template);
    this.navigation.onChange();

    await this.page.hide();

    this.page = page;
    this.onResize(undefined, true);
    await this.canvas.onChange(this.template);

    this.page.show();
  }

  onPreloaded() {
    this.canvas.onPreloaded();
    this.onResize();
    this.setSound();
    this.page.show();
    this.update();

    if (this.page instanceof About) {
      this.page.returnPageSet = false;
    }

    this.canvas.particles.on("goToEplore", () => {
      this.onChange({ url: "/snippets" });
    });
    this.canvas.detail.on("enterFullscreen", () => {
      this.page instanceof Detail && this.page.onEnterFullscreen();
    });
    this.canvas.detail.on("exitFullscreen", () => {
      this.page instanceof Detail && this.page.onExitFullscreen();
    });
    this.canvas.detail.on("orbit control enabled", () => {
      this.page instanceof Detail && (this.page.isScrollable = false);
    });
    this.canvas.detail.on("orbit control disabled", () => {
      this.page instanceof Detail && (this.page.isScrollable = true);
    });
    this.icon.on("mouse enter icon", () => {
      this.canvas.particles.onMouseEnterLink();
    });
    this.icon.on("mouse exit icon", () => {
      this.canvas.particles.onMouseExitLink();
    });
  }

  onPopState() {
    this.onChange({
      url: window.location.pathname,
      push: false,
    });
  }

  onWheel(event: Event) {
    if (this.navigation.isOpen) return;
    const { pixelY } = NormalizeWheel(event);

    this.canvas.onWheel(pixelY);

    this.page.isScrollable && this.page.onWheel(pixelY);
  }

  onTouchDown(event: any) {
    if (this.navigation.isOpen) return;

    this.isDown = true;

    let x: number, y: number;
    if (event.touches) {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    } else {
      x = event.clientX;
      y = event.clientY;
    }

    this.canvas.onTouchDown({ x, y });
    this.page.onTouchDown(y);
  }

  onTouchMove(event: any) {
    if (this.navigation.isOpen) return;

    let x: number, y: number;
    if (event.touches) {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
      this.touchEnd.x = x;
      this.touchEnd.y = y;
    } else {
      x = event.clientX;
      y = event.clientY;
    }

    this.canvas.onTouchMove({ x, y, isDown: this.isDown });
    this.isDown && this.page.isScrollable && this.page.onTouchMove(y);
  }

  onTouchUp(event: any) {
    if (this.navigation.isOpen) return;
    this.isDown = false;

    let x: number, y: number;
    if (event.touches) {
      x = this.touchEnd.x;
      y = this.touchEnd.y;
    } else {
      x = event.clientX;
      y = event.clientY;
    }

    this.canvas.onTouchUp({ x, y });
  }

  onResize(_?: any, transition?: boolean) {
    document.documentElement.style.setProperty(
      "--vh",
      `${window.innerHeight * 0.01}px`
    );

    this.canvas.onResize(transition);

    this.page.onResize();
  }

  bindEvents() {
    this.onPopState = this.onPopState.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onTouchDown = this.onTouchDown.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchUp = this.onTouchUp.bind(this);
  }

  addEventListeners() {
    window.addEventListener("popstate", this.onPopState);

    window.addEventListener("resize", this.onResize);

    window.addEventListener("wheel", this.onWheel);
    window.addEventListener("mousedown", this.onTouchDown);
    window.addEventListener("mousemove", this.onTouchMove);
    Detection.isDesktop() && window.addEventListener("mouseup", this.onTouchUp);

    window.addEventListener("touchstart", this.onTouchDown);
    window.addEventListener("touchmove", this.onTouchMove);
    window.addEventListener("touchend", this.onTouchUp);
  }

  addLinkListeners() {
    const links = document.querySelectorAll("a");

    links.forEach((link) => {
      const { href } = link;
      const isLocal = href.indexOf(window.location.origin) > -1;

      link.onclick = (event) => {
        if (isLocal) {
          event.preventDefault();
          this.onChange({ url: link.href });
        }
      };
    });
  }

  update() {
    this.canvas && this.canvas.update(this.page.scroll.current);
    this.page && this.page.update();

    window.requestAnimationFrame(this.update.bind(this));
  }
}

new App();
