import * as THREE from "three";
import img from "./smoke3.png";
import imgN from "./nebula1.jpeg";
import imgR from "./noise1.png";
import imgC from "./palette.png";
import vertexShader from "../../shaders/smoke/vertex.glsl";
import fragmentShader from "../../shaders/smoke/fragment.glsl";

export default class Smoke {
  group;
  textureLoader;
  geometry: any;
  material: any;
  meshes: any;
  width;
  height;
  debug: any;
  color: any;
  smokeColor: any;
  mesh: any;
  trail: any;
  fov: any;
  aspect: any;
  parentWidth: any;
  parentHeight: any;
  constructor({ scene, width, height, debug, trail, fov, aspect }: any) {
    this.parentWidth = width;
    this.parentHeight = height;
    this.fov = fov;
    this.aspect = aspect;
    this.height = 800 * Math.tan((fov * Math.PI) / 180 / 2);
    this.width = this.height * aspect;
    this.group = new THREE.Group();
    this.textureLoader = new THREE.TextureLoader();
    scene.add(this.group);

    this.trail = trail;

    debug && this.setDebug(debug);

    this.setMaterial();
  }

  setDebug(debug: any) {
    this.debug = debug.addFolder({ title: "Smoke" });
  }

  setMaterial() {
    this.geometry = new THREE.PlaneGeometry(1, 1);
    const tex = this.textureLoader.load(img);
    const texN = this.textureLoader.load(imgN);
    const texR = this.textureLoader.load(imgR);
    const texC = this.textureLoader.load(imgC);
    tex.generateMipmaps = false;
    texN.generateMipmaps = false;
    texR.generateMipmaps = false;
    texC.generateMipmaps = false;
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: this.width / this.height },
        uTexture: { value: tex },
        uTextureN: { value: texN },
        uTextureC: { value: texC },
        uTrail: { value: this.trail },
        uDistortion: { value: 0.6 },
        uSpeedXneb: { value: 0.05 },
        uSpeedYneb: { value: 0.05 },
        uSpeedXsmoke: { value: 0.25 },
        uSpeedYsmoke: { value: 0.15 },
        uMultiplier: { value: 3 },
        uColorSpeed: { value: 0.3 },
      },
      transparent: true,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.z = 100;
    this.mesh.scale.set(this.width, this.height, 1);
    this.group.add(this.mesh);

    if (this.debug) {
      this.debug.addInput(this.material.uniforms.uDistortion, "value", {
        label: "uDistortion",
        min: 0,
        max: 5,
        step: 0.01,
      });
      this.debug.addInput(this.material.uniforms.uSpeedXneb, "value", {
        label: "uSpeedXneb",
        min: -0.2,
        max: 0.2,
        step: 0.001,
      });
      this.debug.addInput(this.material.uniforms.uSpeedYneb, "value", {
        label: "uSpeedYneb",
        min: -0.2,
        max: 0.2,
        step: 0.001,
      });
      this.debug.addInput(this.material.uniforms.uSpeedXsmoke, "value", {
        label: "uSpeedXsmoke",
        min: -0.6,
        max: 2,
        step: 0.001,
      });
      this.debug.addInput(this.material.uniforms.uSpeedYsmoke, "value", {
        label: "uSpeedYsmoke",
        min: -0.6,
        max: 0.6,
        step: 0.001,
      });
      this.debug.addInput(this.material.uniforms.uMultiplier, "value", {
        label: "uMultiplier",
        min: 0,
        max: 6,
        step: 0.01,
      });
      this.debug.addInput(this.material.uniforms.uColorSpeed, "value", {
        label: "uColorSpeed",
        min: 0,
        max: 1,
        step: 0.01,
      });
    }
  }

  onTouchMove(values: any) {
    // this.material.uniforms.uMouse.value.x = values.x.end / this.parentWidth;
    // this.material.uniforms.uMouse.value.y =
    //   1 - values.y.end / this.parentHeight;
  }

  update(delta: number, time: number) {
    this.material.uniforms.uTime.value = time;
  }
}
