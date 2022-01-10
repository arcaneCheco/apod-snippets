import { Pane } from "tweakpane";

import Canvas from "./components/Canvas";

import NormalizeWheel from "normalize-wheel";

import Page from "./classes/Page";
import Assets from "./classes/Assets";

import Home from "./pages/Home";
import About from "./pages/About";
import Explore from "./pages/Explore";
import Detail from "./pages/Detail";
import Preloader from "./components/Preloader";
import { resolve } from "path/posix";

class App {
  template: string;
  canvas: Canvas;
  home: Home;
  about: Page;
  explore: Page;
  detail: Page;
  pages: { [key: string]: Page };
  page: Page;
  assets: Assets;
  preloader: any;
  debug: Pane;
  constructor() {
    this.template = window.location.pathname;

    this.setDebug();
    this.setCanvas();
    this.setPreloader();
    // this.setAssets();
    this.setPages();

    this.addEventListeners();
    this.addLinkListeners();

    this.update();
  }

  setCanvas() {
    this.canvas = new Canvas({ template: this.template, debug: this.debug });
  }

  setPreloader() {
    this.preloader = new Preloader();
    this.preloader.once("completed", this.onPreloaded.bind(this));
  }

  setAssets() {
    this.assets = new Assets();
    this.assets.once("completed", this.onPreloaded.bind(this));
  }

  setPages() {
    this.home = new Home();
    this.about = new About();
    this.explore = new Explore();

    this.pages = {
      "/": this.home,
      "/about": this.about,
      "/explore": this.explore,
    };

    const detailElements = document.querySelectorAll(".detail");
    detailElements.forEach((element) => {
      this.pages[`/detail/${element.id}`] = new Detail({
        element: `#${element.id}`,
      });
    });

    this.page = this.pages[this.template];
  }

  setDebug() {
    this.debug = new Pane();
    this.debug.containerElem_.style.zIndex = "100";
  }

  /**
   * Events
   */
  async onChange({ url, push = true }: any) {
    url = url.replace(window.location.origin, "");

    if (push) {
      window.history.pushState({}, "", url);
    }

    this.template = window.location.pathname;

    const page = this.pages[this.template];

    await this.page.hide();
    this.canvas.onChange(this.template);

    this.page = page;
    this.page.show();
    this.onResize();
  }

  onPreloaded() {
    this.onResize();
    this.canvas.onPreloaded();
    this.page.show();
  }

  onPopState() {
    this.onChange({
      url: window.location.pathname,
      push: false,
    });
  }

  onWheel(event: Event) {
    const normalizedWheel = NormalizeWheel(event);

    this.canvas && this.canvas.onWheel(normalizedWheel);

    this.page.isScrollable && this.page.onWheel(normalizedWheel);
  }

  onTouchDown(event: Event) {
    this.canvas.onTouchDown(event);
    this.page.onTouchDown(event);
  }

  onTouchMove(event: Event) {
    this.canvas.onTouchMove(event);
    // console.log("moving");
    this.page.onTouchMove(event);
  }

  onTouchUp(event: Event) {
    this.canvas.onTouchUp(event);
    this.page.onTouchUp(event);
  }

  onResize() {
    this.canvas.onResize();

    this.page.onResize();
  }

  addEventListeners() {
    window.addEventListener("popstate", this.onPopState.bind(this));

    window.addEventListener("wheel", this.onWheel.bind(this));
    window.addEventListener("resize", this.onResize.bind(this));

    window.addEventListener("mousedown", this.onTouchDown.bind(this));
    window.addEventListener("mousemove", this.onTouchMove.bind(this));
    window.addEventListener("mouseup", this.onTouchUp.bind(this));

    window.addEventListener("touchstart", this.onTouchDown.bind(this));
    window.addEventListener("touchmove", this.onTouchMove.bind(this));
    window.addEventListener("touchend", this.onTouchUp.bind(this));
  }

  addLinkListeners() {
    const links = document.querySelectorAll("a");

    links.forEach((link) => {
      link.onclick = (event) => {
        event.preventDefault();

        const { href } = link;

        this.onChange({ url: href });
      };
    });
  }

  update() {
    this.canvas && this.canvas.update();

    this.page && this.page.update();

    window.requestAnimationFrame(this.update.bind(this));
  }
}

new App();
