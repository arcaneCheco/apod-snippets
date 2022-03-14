import Detection from "../../classes/Detection";
import {
  Texture,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Group,
  Vector2,
  WebGLRenderTarget,
  LinearFilter,
  RGBAFormat,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  AdditiveBlending,
} from "three";

export default class Trail {
  width: number;
  height: number;
  texture: Texture;
  scene = new Scene();
  baseScale: number;
  camera: PerspectiveCamera;
  renderer: WebGLRenderer;
  group = new Group();
  previous = new Vector2();
  position = new Vector2();
  currentTouch = 0;
  map = window.TEXTURES.vortex;
  target: THREE.WebGLRenderTarget;
  numTouch = 10;
  trail: Mesh<PlaneGeometry, MeshBasicMaterial>[] = [];
  stop = true;
  pause = false;
  constructor({
    width,
    height,
    ratio,
    camera,
    renderer,
  }: {
    width: number;
    height: number;
    ratio: number;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
  }) {
    this.width = width;
    this.height = height;
    this.scene.position.y = 0.5 * (1 - ratio) * this.height;
    this.baseScale = Math.max(this.height * 0.4, this.width * 0.2);
    this.camera = camera;
    this.renderer = renderer;

    this.setRenderTarget();
    this.setTrail();
  }

  setRenderTarget() {
    this.target = new WebGLRenderTarget(this.width, this.height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
      generateMipmaps: false,
    });
    this.texture = this.target.texture;
  }

  setTrail() {
    const geometry = new PlaneGeometry(1, 1);
    const material = new MeshBasicMaterial({
      map: this.map,
      transparent: true,
      blending: AdditiveBlending,
    });
    for (let i = 0; i < this.numTouch; i++) {
      const mesh = new Mesh(geometry, i === 0 ? material : material.clone());
      mesh.visible = false;
      mesh.rotation.z = 2 * Math.PI * Math.random();

      mesh.scale.x = mesh.scale.y = this.baseScale;

      this.scene.add(mesh);
      this.trail.push(mesh);
    }
  }

  addTouch(x: any, y: any, index: any) {
    let mesh = this.trail[index];
    mesh.visible = true;
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.material.opacity = 1;
    mesh.scale.x = mesh.scale.y = this.baseScale;
  }

  updateTouch() {
    if (this.position.distanceTo(this.previous) > 6) {
      this.addTouch(this.position.x, this.position.y, this.currentTouch);
      this.currentTouch = (this.currentTouch + 1) % this.numTouch;
    }
    this.previous.set(this.position.x, this.position.y);
  }

  onTouchMove({ x, y }: { x: number; y: number }) {
    this.position.x = x - this.width / 2;
    this.position.y = -y + this.height / 2;
  }

  onChange(template: string) {
    // if (Detection.isDesktop()) return;
    // if (template !== "/") {
    //   this.pause = true;
    // } else {
    //   this.pause = false;
    // }
  }

  onResize({ width, height, ratio }: any) {
    this.width = width;
    this.height = height;
    this.target.setSize(this.width, this.height);
    this.scene.position.y = 0.5 * (1 - ratio) * this.height;
    this.baseScale = Math.max(this.height * 0.4, this.width * 0.2);
  }

  update() {
    if (this.pause) return;
    if (!this.stop) {
      this.renderer.setRenderTarget(this.target);
      this.renderer.render(this.scene, this.camera);
      this.renderer.setRenderTarget(null);
      this.renderer.clear();
    }

    this.stop = true;
    this.trail.forEach((mesh) => {
      if (mesh.visible) {
        this.stop = false;
        mesh.rotation.z += 0.03;
        mesh.material.opacity *= 0.99;
        mesh.scale.x = mesh.scale.x * 0.992;
        mesh.scale.y = mesh.scale.x;
        if (mesh.material.opacity < 0.05) mesh.visible = false;
      }
    });
    this.updateTouch();
  }
}
