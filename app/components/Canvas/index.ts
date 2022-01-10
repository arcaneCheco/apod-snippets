import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import Background from "./Background";
import Smoke from "./Smoke";
import Trail from "./Trail";
import ExploreDetailTransition from "./ExploreDetailTransition";
import Home from "./Home";
import About from "./About";
import Explore from "./Explore";
import Detail from "./Detail";

interface Props {
  template: string;
  debug?: any;
}

export default class Canvas {
  template: string;
  scene;
  renderer: THREE.WebGLRenderer;
  width: number;
  height: number;
  container: HTMLDivElement;
  camera: THREE.PerspectiveCamera;
  background: Background;
  home: Home;
  about: About;
  explore: Explore;
  detail: Detail;
  isDown: boolean;
  x;
  y;
  active: any;
  controls: OrbitControls;
  time;
  exploreDetailTransition: any;
  smoke: any;
  debug: any;
  trail: any;
  constructor({ template, debug }: Props) {
    this.template = template;
    this.container = document.querySelector("#canvas")!;
    this.scene = new THREE.Scene();

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

    this.time = 0;

    debug && this.setDebug(debug);

    this.setRenderer();
    this.setCamera();
    // this.onResize();
    // this.setBackground();
  }

  setDebug(debug: any) {
    this.debug = debug.addFolder({ title: "Canvas" });
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(65, 2, 200, 1500);
    this.camera.position.z = 500;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  setBackground() {
    this.background = new Background({
      scene: this.scene,
      width: this.width,
      height: this.height,
    });
  }

  setTrail() {
    this.trail = new Trail({
      width: this.width,
      height: this.height,
      scene: this.scene,
      renderer: this.renderer,
      camera: this.camera,
    });
    // const mesh = new THREE.Mesh(
    //   new THREE.PlaneGeometry(1, 1),
    //   new THREE.MeshBasicMaterial({
    //     map: this.trail.texture,
    //     transparent: true,
    //     color: 0xff0000,
    //   })
    // );
    // mesh.scale.set(this.width, this.height, 1);
    // this.scene.add(mesh);
  }

  setSmoke() {
    this.smoke = new Smoke({
      scene: this.scene,
      width: this.width,
      height: this.height,
      debug: this.debug,
      trail: this.trail ? this.trail.texture : null,
      fov: this.camera.fov,
      aspect: this.camera.aspect,
    });
  }

  setHome() {
    this.home = new Home({
      scene: this.scene,
      width: this.width,
      height: this.height,
    });
  }

  setAbout() {
    this.about = new About({
      scene: this.scene,
      width: this.width,
      height: this.height,
      renderer: this.renderer,
    });
  }

  setExplore() {
    this.explore = new Explore({
      scene: this.scene,
      width: this.width,
      height: this.height,
    });
  }

  setDetail() {
    this.detail = new Detail({
      scene: this.scene,
      width: this.width,
      height: this.height,
      template: this.template,
    });
  }

  setExploreDetailTransition() {
    this.exploreDetailTransition = new ExploreDetailTransition({
      scene: this.scene,
      detail: this.detail,
      explore: this.explore,
    });
  }

  onPreloaded() {
    this.setTrail();
    this.setSmoke();
    this.setHome();
    this.setAbout();
    this.setExplore();
    this.setDetail();
    this.setExploreDetailTransition();

    this.onChange(this.template);
  }

  onChange(template: string) {
    if (template === "/") {
      this.home.show();
      this.active = this.home;
    } else {
      this.home.hide();
    }

    if (template === "/about") {
      this.about.show();
      this.active = this.about;
    } else {
      this.about.hide();
    }

    if (template === "/explore") {
      if (this.template.includes("/detail/")) {
        console.log("transition from detail to explore");
        this.exploreDetailTransition.detailToExplore();
      }
      this.explore.show();
      this.active = this.explore;
    } else {
      this.explore.hide();
    }

    if (template.includes("/detail/")) {
      if (this.template === "/explore") {
        console.log("transition from explore to detail");
        this.exploreDetailTransition.exploreToDetail();
      }
      this.detail.show(template);
      this.active = this.detail;
    } else {
      this.detail.hide();
    }

    this.template = template;
  }

  onResize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer.setSize(this.width, this.height);

    this.camera.fov = (360 / Math.PI) * Math.atan(this.height * 0.001);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.active &&
      this.active.onResize({ width: this.width, height: this.height });
  }

  onWheel(event: any) {
    this.active.onWheel(event);
  }

  onTouchDown(event: any) {
    this.isDown = true;

    this.x.start = event.touches ? event.touches[0].clientX : event.clientX;
    this.y.start = event.touches ? event.touches[0].clientY : event.clientY;

    const values = {
      x: this.x,
      y: this.y,
    };

    if (this.explore) {
      this.explore.onTouchDown(values);
    }
  }

  onTouchMove(event: any) {
    this.x.end = event.touches ? event.touches[0].clientX : event.clientX;
    this.y.end = event.touches ? event.touches[0].clientY : event.clientY;

    const values = {
      x: this.x,
      y: this.y,
      idDown: this.isDown,
    };

    this.active && this.active.onTouchMove(values);

    this.trail && this.trail.onTouchMove(values);

    this.smoke && this.smoke.onTouchMove(values);
  }

  onTouchUp(event: any) {
    this.isDown = false;

    this.x.end = event.changedTouches
      ? event.changedTouches[0].clientX
      : event.clientX;
    this.y.end = event.changedTouches
      ? event.changedTouches[0].clientY
      : event.clientY;

    const values = {
      x: this.x,
      y: this.y,
    };

    if (this.explore === this.active) {
      this.explore.onTouchUp(values);
    }
  }

  update() {
    this.time += 0.01633;

    this.active && this.active.update({ time: this.time });

    // this.background.update(this.time);
    this.smoke && this.smoke.update(0.01633, this.time);
    this.trail && this.trail.update(this.time);
    // this.active === this.home && this.trail && this.trail.update(this.time);

    this.renderer.render(this.scene, this.camera);
  }
}
