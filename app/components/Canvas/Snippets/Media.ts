import {
  CompressedTexture,
  Group,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
} from "three";
// @ts-ignore
import vertexShader from "../../../shaders/snippets/vertex.glsl";
// @ts-ignore
import fragmentShader from "../../../shaders/snippets/fragment.glsl";

export default class Media {
  texture: CompressedTexture;
  snippetIndex: number;
  geometry: PlaneGeometry;
  position: number;
  scene: Group;
  extra = 0;
  initialPosition = 0;
  material: ShaderMaterial;
  mesh: Mesh;
  galleryWidth: number;
  upperBound: number;
  lowerBound: number;
  displacementLeftTexture = window.TEXTURES.displ;
  displacementRightTexture = window.TEXTURES.displ2;
  constructor({
    element,
    geometry,
    position,
    scene,
  }: {
    element: HTMLElement;
    geometry: PlaneGeometry;
    position: number;
    scene: Group;
  }) {
    this.texture =
      window.TEXTURES[element.querySelector("img")!.getAttribute("data-src")!];
    this.snippetIndex = Number(element.getAttribute("data-index")!);

    this.geometry = geometry;
    this.position = position;
    this.scene = scene;

    this.setMaterial();
    this.setMesh();
  }

  setMaterial() {
    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: this.texture },
        uTime: { value: 0 },
        uSpeed: { value: 0 },
        uOpacity: { value: 1 },
        uDirection: { value: 0 },
        uTransition: { value: 1 },
        uDisplacementMap: {
          value: this.displacementLeftTexture,
        },
        uScale: { value: 1 },
        uZ: { value: 0 },
        uIndex: { value: this.position },
        uDisplacementMap2: {
          value: this.displacementRightTexture,
        },
      },
      transparent: true,
    });
  }

  setMesh() {
    this.mesh = new Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  onResize({
    galleryWidth,
    upperBound,
    lowerBound,
    scale,
    unitSize,
  }: {
    galleryWidth: number;
    upperBound: number;
    lowerBound: number;
    scale: number;
    unitSize: number;
  }) {
    this.extra = 0;
    this.galleryWidth = galleryWidth;
    this.upperBound = upperBound;
    this.lowerBound = lowerBound;

    this.mesh.scale.x = this.mesh.scale.y = scale;
    this.initialPosition = this.position * unitSize;
    this.mesh.position.x = this.initialPosition;
  }

  update(scroll: number) {
    this.mesh.position.x = this.initialPosition - scroll + this.extra;
    if (this.mesh.position.x > this.upperBound) {
      this.extra -= this.galleryWidth;
    } else if (this.mesh.position.x < this.lowerBound) {
      this.extra += this.galleryWidth;
    }
  }
}
