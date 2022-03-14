import { Scene, WebGLRenderer, PerspectiveCamera } from "three";

import Smoke from "./Smoke";
import Trail from "./Trail";
import Home from "./Home";
import About from "./About";
import Explore from "./Explore";
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
  explore: Explore;
  detail: Detail;
  x;
  y;
  active: any;
  smoke: Smoke;
  trail: Trail;
  particles: Particles;
  templateRouteMap: any;
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

    this.templateRouteMap = {
      "": this.home,
      explore: this.explore,
      about: this.about,
      detail: this.detail,
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

  setSmoke() {
    this.smoke = new Smoke({
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

  setExplore() {
    this.explore = new Explore({
      scene: this.scene,
      width: this.width,
      height: this.height,
    });

    this.explore.on("toDetail", (horizontalPosition, depth) => {
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
      this.explore.podTexture = texture;
      this.explore.activePodIndex = podIndex;
    });
  }

  onPreloaded() {
    this.setTrail();
    this.setSmoke();
    this.setParticles();
    this.setHome();
    this.setAbout();
    this.setExplore();
    this.setDetail();

    this.onChange(this.template);
  }

  async onChange(template: string) {
    this.active.hide(template);

    this.particles && this.particles.onChange(template);
    this.smoke && this.smoke.onChange(template);
    // this.trail && this.trail.onChange(template);

    if (template === "/") {
      this.home.show();
      this.active = this.home;
    } else if (template === "/about") {
      this.about.show();
      this.active = this.about;
    } else if (template === "/explore") {
      this.explore.show(this.template);
      this.active = this.explore;
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

    this.smoke.onResize({ camera: this.camera });

    !transition &&
      this.detail.onResize({ width: this.width, height: this.height });
    !transition &&
      this.explore.onResize({ width: this.width, height: this.height });
  }

  onWheel(scroll: number) {
    this.template === "/explore" && this.explore.onWheel(scroll);
  }

  onTouchDown({ x, y }: { x: number; y: number }) {
    this.active === this.explore && this.explore.onTouchDown({ x, y });

    this.active == this.detail && this.detail.onTouchDown({ x, y });
  }

  onTouchMove({ x, y, isDown }: { x: number; y: number; isDown: boolean }) {
    this.active === this.explore &&
      isDown &&
      this.explore.onTouchMove({ x, y });

    this.active === this.detail &&
      this.detail.onTouchMove({
        x,
        y,
      });

    this.trail.onTouchMove({ x, y });

    this.particles.onTouchMove({ x, y });
  }

  onTouchUp({ x, y }: { x: number; y: number }) {
    this.active === this.explore && this.explore.onTouchUp();
    this.active === this.detail && this.detail.onTouchUp({ x, y });
  }

  update(scroll: number) {
    this.time += 0.01633;

    this.active === this.explore && this.explore.update(this.time);
    this.active === this.detail &&
      this.detail.update({ time: this.time, scroll: scroll });

    this.smoke.update(this.time);
    this.trail.update();
    this.particles.update(this.time);

    this.renderer.render(this.scene, this.camera);
  }
}
