import { Scene, WebGLRenderer, PerspectiveCamera } from "three";

import Background from "./Background";
import Trail from "./Trail";
import Home from "./Home";
import About from "./About";
import Snippets from "./Snippets";
import Detail from "./Detail";
import Particles from "./Particles";

export default class Canvas {
  template: string;
  container: HTMLDivElement = document.querySelector("#canvas")!;
  scene = new Scene();
  ratio = 0.8;
  time = 0;
  isDown = false;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;
  width: number;
  height: number;
  home: Home;
  about: About;
  snippets: Snippets;
  detail: Detail;
  x;
  y;
  active: any;
  background: Background;
  trail: Trail;
  particles: Particles;
  constructor({ template }: { template: string }) {
    this.template = template;

    this.x = {
      start: 0,
      distance: 0,
      end: 0,
    };
    this.y = {
      start: 0,
      distance: 0,
      end: 0,
    };

    this.setRenderer();
    this.setCamera();
  }

  setRenderer() {
    this.renderer = new WebGLRenderer({
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(1);
    this.container.appendChild(this.renderer.domElement);
  }

  setCamera() {
    this.camera = new PerspectiveCamera(65, 2, 2, 3500);
    this.camera.position.z = 500;
  }

  setTrail() {
    this.trail = new Trail({
      width: this.width,
      height: this.height,
      renderer: this.renderer,
      camera: this.camera,
      ratio: this.ratio,
    });
  }

  setBackground() {
    this.background = new Background({
      scene: this.scene,
      width: this.width,
      height: this.height,
      trail: this.trail.texture,
      fov: this.camera.fov,
      aspect: this.camera.aspect,
      template: this.template,
    });
  }

  setParticles() {
    this.particles = new Particles({
      scene: this.scene,
      width: this.width,
      height: this.height,
      trail: this.trail.texture,
      template: this.template,
    });
  }

  setHome() {
    this.home = new Home();
    this.active = this.home;
  }

  setAbout() {
    this.about = new About();
  }

  setSnippets() {
    this.snippets = new Snippets({
      scene: this.scene,
      width: this.width,
      height: this.height,
    });

    this.snippets.on("toDetail", (horizontalPosition, depth) => {
      this.detail.transitionStartPosition = horizontalPosition;
      this.detail.transitionStartPositionDepth = depth;
    });
  }

  setDetail() {
    this.detail = new Detail({
      scene: this.scene,
      width: this.width,
      height: this.height,
      template: this.template,
      camera: this.camera,
    });
    this.detail.on("leavingDetail", (texture, podIndex) => {
      this.snippets.podTexture = texture;
      this.snippets.activePodIndex = podIndex;
    });
  }

  onPreloaded() {
    this.setTrail();
    this.setBackground();
    this.setParticles();
    this.setHome();
    this.setAbout();
    this.setSnippets();
    this.setDetail();

    this.onChange(this.template);
  }

  async onChange(template: string) {
    this.active.hide(template);

    this.particles && this.particles.onChange(template); // try remove conditional
    this.background && this.background.onChange(template);
    // this.trail && this.trail.onChange(template);

    if (template === "/") {
      this.home.show();
      this.active = this.home;
    } else if (template === "/about") {
      this.about.show();
      this.active = this.about;
    } else if (template === "/snippets") {
      this.snippets.show(this.template);
      this.active = this.snippets;
    } else {
      this.detail.show({ from: this.template, to: template, time: this.time });
      this.active = this.detail;
    }

    this.template = template;
  }

  onResize(transition?: boolean) {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    // this.height = this.container.offsetHeight * this.ratio;
    // this.renderer.domElement.style.top = ""
    this.renderer.setSize(this.width, this.height);
    this.camera.fov = (360 / Math.PI) * Math.atan(this.height * 0.001);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.trail.onResize({
      width: this.width,
      height: this.height,
      ratio: this.ratio,
    });

    this.particles.onResize({ width: this.width, height: this.height });

    this.background.onResize({ camera: this.camera });

    !transition &&
      this.detail.onResize({ width: this.width, height: this.height });
    !transition &&
      this.snippets.onResize({ width: this.width, height: this.height });
  }

  onWheel(scroll: number) {
    this.template === "/snippets" && this.snippets.onWheel(scroll);
  }

  onTouchDown({ x, y }: { x: number; y: number }) {
    this.active === this.snippets && this.snippets.onTouchDown({ x, y });

    this.active == this.detail && this.detail.onTouchDown({ x, y });
  }

  onTouchMove({ x, y, isDown }: { x: number; y: number; isDown: boolean }) {
    this.active === this.snippets &&
      isDown &&
      this.snippets.onTouchMove({ x, y });

    this.active === this.detail &&
      this.detail.onTouchMove({
        x,
        y,
      });

    this.trail.onTouchMove({ x, y });

    this.particles.onTouchMove({ x, y });
  }

  onTouchUp({ x, y }: { x: number; y: number }) {
    this.active === this.snippets && this.snippets.onTouchUp();
    this.active === this.detail && this.detail.onTouchUp({ x, y });
  }

  update(scroll: number) {
    this.time += 0.01633;

    this.active === this.snippets && this.snippets.update(this.time);
    this.active === this.detail &&
      this.detail.update({ time: this.time, scroll: scroll });

    this.background.update(this.time);
    this.trail.update();
    this.particles.update(this.time);

    this.renderer.render(this.scene, this.camera);
  }
}
