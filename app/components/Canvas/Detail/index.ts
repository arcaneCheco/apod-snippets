import * as THREE from "three";
// import Component from "../../../classes/Component";
import vertexShader from "../../../shaders/detail/vertex.glsl";
import fragmentShader from "../../../shaders/detail/fragment.glsl";

export default class Detail {
  scene;
  width;
  height;
  group;
  details: any;
  detail: any;
  sliceFigure: any;
  textures: any;
  textureArray: any;
  bounds: any;
  template;
  material: any;
  mesh: any;
  geometry;
  currentTexture;
  block: any;
  constructor({ scene, width, height, template }: any) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.template = template;
    this.group = new THREE.Group();
    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.currentTexture = 0;

    this.setElements();

    this.setBounds();

    this.setMaterial();
    this.setMesh();

    this.onResize({ width: this.width, height: this.height });
  }

  onWheel(event: any) {
    if (this.block) return;
    if (event.pixelY > 0) {
      this.material.uniforms.uTextureNext.value =
        this.textureArray[(this.currentTexture + 1) % this.textureArray.length];
    } else {
      this.material.uniforms.uTextureNext.value =
        this.textureArray[
          (this.currentTexture + this.textureArray.length - 1) %
            this.textureArray.length
        ];
    }
    let speed = Math.min(Math.abs(event.pixelY), 101);
    if (speed < 3) {
      speed = 0;
    }
    this.material.uniforms.uProgress.value = speed / 100;
    if (speed > 100) {
      this.block = true;
      window.setTimeout(() => (this.block = false), 1000);
      this.currentTexture += Math.sign(event.pixelY);
      if (this.currentTexture < 0) {
        this.currentTexture += this.textureArray.length;
      }
      console.log(this.currentTexture);
      this.material.uniforms.uTextureCurrent.value =
        this.textureArray[this.currentTexture % this.textureArray.length];
      this.material.uniforms.uProgress.value = 0;
    }
  }

  //   addEventListeners() {
  //     document.addEventListener("wheel", this.onWheel.bind(this));
  //   }

  //   removeEventListeners() {
  //     document.removeEventListener("wheel", this.onWheel.bind(this));
  //   }

  setElements() {
    const details = document.querySelectorAll(".detail");
    this.sliceFigure = document.querySelector(".detail__explanation__media");
    this.details = {};
    [...details].forEach((element) => {
      this.details[element.id] = {
        slices: [
          ...element.querySelectorAll(".detail__explanation__slice"),
        ].map((slice) => {
          return slice.querySelector(".detail__explanation__media");
        }),
      };
    });
    this.textures = {};
    [...document.querySelectorAll(".detail")].forEach((element) => {
      this.textures[element.id] = [
        ...element.querySelectorAll(".detail__explanation__media__image"),
      ].map((img) => window.TEXTURES[img.getAttribute("data-src")!]);
    });

    // this.detail = this.details[this.template.split("/").pop()];
    // this.textureArray = this.textures[this.template.split("/").pop()];
    // console.log(this.textureArray);
  }

  setBounds() {
    this.bounds = this.sliceFigure.getBoundingClientRect();
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTextureCurrent: { value: null },
        uTextureNext: { value: null },
        uProgress: { value: 0 },
        uIntensity: { value: 0.8 },
        uAspect: { value: this.bounds.width / this.bounds.height },
      },
    });
    // this.material.needsUpdate = true;
    // const pane = new Pane();
    // document.querySelector(".tp-dfwv").style.zIndex = "99";
    // pane.addInput(this.material.uniforms.uProgress, "value", {
    //   min: 0,
    //   max: 1,
    //   step: 0.001,
    // });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.group.add(this.mesh);
  }

  onResize({ width, height }: any) {
    this.width = width;
    this.height = height;
    this.setBounds();
    this.mesh.scale.set(this.bounds.width, this.bounds.height, 1);
    // this.mesh.scale.set(600, 600, 1); // to be removed
    this.mesh.position.x =
      this.bounds.left - this.width / 2 + this.bounds.width / 2;
    this.mesh.position.y =
      -this.bounds.top + this.height / 2 - this.bounds.height / 2;
  }

  onTouchMove() {}

  show(template: string) {
    const id: string = template.split("/").pop()!;
    this.detail = this.details[id];
    this.textureArray = this.textures[id];
    if (!this.material.uniforms.uTextureCurrent.value) {
      this.material.uniforms.uTextureCurrent.value = this.textureArray[0];
      this.material.uniforms.uTextureNext.value = this.textureArray[1];
    }
    this.scene.add(this.group);
  }
  hide() {
    this.scene.remove(this.group);
  }

  update() {}
}
