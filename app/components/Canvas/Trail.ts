import * as THREE from "three";
import { urlToHttpOptions } from "url";
import img from "./vortex3.jpg";
// import img from "./vortex4.png";

export default class Trail {
  width: any;
  height: any;
  texture: any;
  geometry: any;
  textureLoader: any;
  material: any;
  num: any;
  meshes: any;
  group;
  previous;
  position;
  currentWave;
  mesh: any;
  scene;
  target: any;
  trail: any;
  renderer: THREE.WebGLRenderer;
  camera: any;
  constructor({ width, height, scene, camera, renderer }: any) {
    this.width = width;
    this.height = height;
    this.scene = new THREE.Scene();
    this.camera = camera;
    this.renderer = renderer;
    this.textureLoader = new THREE.TextureLoader();
    this.group = new THREE.Group();
    this.previous = new THREE.Vector2();
    this.position = new THREE.Vector2();
    this.currentWave = 0;

    this.setTexture();
    this.setMesh();
  }

  setTexture() {
    this.target = new THREE.WebGLRenderTarget(this.width, this.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
    this.texture = this.target.texture;
  }

  setMesh() {
    this.num = 10;
    this.meshes = [];
    const geom = new THREE.PlaneGeometry(130, 130);
    const map = this.textureLoader.load(img);
    this.material = new THREE.MeshBasicMaterial({
      map: map,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    for (let i = 0; i < this.num; i++) {
      const mesh = new THREE.Mesh(geom, this.material.clone());
      mesh.visible = false;
      mesh.rotation.z = 2 * Math.PI * Math.random();
      // mesh.position.x += 100 * i;
      this.scene.add(mesh);
      this.meshes.push(mesh);
    }
  }

  setNewWave(x: any, y: any, index: any) {
    let mesh = this.meshes[index];
    mesh.visible = true;
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.material.opacity = 1;
    mesh.scale.x = 1;
    mesh.scale.y = 1;
  }

  trackMousePos() {
    if (this.position.distanceTo(this.previous) < 4) {
    } else {
      this.setNewWave(this.position.x, this.position.y, this.currentWave);
      this.currentWave = (this.currentWave + 1) % this.num;
    }
    this.previous.set(this.position.x, this.position.y);
  }

  onTouchMove(values: any) {
    this.position.x = values.x.end - this.width / 2;
    this.position.y = -values.y.end + this.height / 2;
  }

  update(time: any) {
    this.renderer.setRenderTarget(this.target);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.renderer.clear();

    if (this.meshes.length) {
      this.meshes.forEach((mesh: any) => {
        if (mesh.visible) {
          mesh.rotation.z += 0.04;
          mesh.material.opacity *= 0.97;
          mesh.scale.x = mesh.scale.x * 0.96 + 0.09;
          mesh.scale.y = mesh.scale.x;
          if (mesh.material.opacity < 0.02) mesh.visible = false;
        }
      });
    }
    this.trackMousePos();
  }
}
