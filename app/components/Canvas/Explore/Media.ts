import * as THREE from "three";
import { Pane } from "tweakpane";

import vertexShader from "../../../shaders/explore/vertex.glsl";
import fragmentShader from "../../../shaders/explore/fragment.glsl";

interface Props {
  element: Element;
  geometry: THREE.PlaneGeometry;
  index: number;
  scene: THREE.Group;
  mediaBounds: {
    width: number;
    height: number;
    gap: number;
  };
  displacementMap: any;
}

export default class Media {
  element;
  geometry;
  index;
  scene;
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  texture: THREE.Texture;
  extra;
  initialPosition;
  mediaBounds;
  textureLoader;
  displacementMap;
  constructor({
    element,
    geometry,
    index,
    scene,
    mediaBounds,
    displacementMap,
  }: Props) {
    this.element = element;
    this.geometry = geometry;
    this.index = index;
    this.scene = scene;
    this.extra = 0;
    this.initialPosition = 0;
    this.mediaBounds = mediaBounds;
    this.textureLoader = new THREE.TextureLoader();
    this.displacementMap = displacementMap;

    this.setTexture();
    this.setMaterial();
    this.setMesh();
    this.updateScale();
    this.updateX();
  }

  setTexture() {
    const image = this.element.querySelector("img")!;
    this.texture = window.TEXTURES[image.getAttribute("data-src")!];
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: this.texture },
        uTime: { value: 0 },
        uSpeed: { value: 0 },
        uAdjusting: { value: 0 },
        uDirection: { value: 0 },
        uDisplacementMap: {
          value: this.textureLoader.load(this.displacementMap),
        },
        uProgress: { value: 0 },
      },
      transparent: true,
      // wireframe: true,
    });
    // const pane = new Pane();
    // pane.addInput(this.material.uniforms.uProgress, "value", {
    //   min: 0,
    //   max: 1,
    //   step: 0.05,
    // });
    // pane.containerElem_.style.zIndex = "100";
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  onResize({ mediaBounds }: any) {
    this.extra = 0;
    this.mediaBounds = mediaBounds;
    this.updateScale();
    this.updateX();
  }

  onWheel() {}

  updateScale() {
    this.mesh.scale.x = this.mediaBounds.width;
    this.mesh.scale.y = this.mediaBounds.height;
  }

  updateX() {
    this.initialPosition =
      this.index * this.mediaBounds.width + this.index * this.mediaBounds.gap;
    this.mesh.position.x = this.initialPosition;
  }

  updateY() {
    // this.mesh.position.y =
    //   this.height / 2 - this.bounds.height / 2 - this.bounds.top;
  }

  update({ scroll, galleryWidth }: any) {
    this.mesh.position.x = this.initialPosition - scroll + this.extra;
    if (
      this.mesh.position.x >
      galleryWidth - this.mediaBounds.width / 2 - this.mediaBounds.gap / 2
    ) {
      this.extra -= galleryWidth;
    } else if (
      this.mesh.position.x <
      -this.mediaBounds.width / 2 - this.mediaBounds.gap / 2
    ) {
      this.extra += galleryWidth;
    }
  }
}
