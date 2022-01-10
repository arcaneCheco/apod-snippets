import * as THREE from "three";
import vertexShader from "../../../shaders/about/vertex.glsl";
import fragmentShader from "../../../shaders/about/fragment.glsl";
import img from "./trans.png";

interface Props {
  scene: THREE.Scene;
  width: number;
  height: number;
  renderer: THREE.WebGLRenderer;
}

export default class About {
  constructor({ scene, width, height, renderer }: Props) {}

  show() {}

  hide() {}

  destroy() {}

  update() {}
}

class RippleTexture {
  parent;
  textureSize;
  radius;
  trail: any;
  wait;
  previousCoor;
  canvas: any;
  ctx: any;
  texture: any;
  constructor(parent: any) {
    this.parent = parent;
    this.textureSize = 200;
    this.radius = 0.05 * this.textureSize;
    this.trail = [];
    this.wait = false;

    this.previousCoor = new THREE.Vector2();

    this.setTexture();
  }

  setTexture() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvas.height = this.textureSize;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.texture = new THREE.Texture(this.canvas);
  }

  clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  addTouch(coor: any) {
    if (!this.wait) {
      const pos = {
        x: coor.x * this.textureSize,
        y: (1 - coor.y) * this.textureSize,
      };
      if (coor.distanceTo(this.previousCoor) > 4 / this.parent) {
        this.trail.push({
          pos,
          intensity: 0.5,
          radius: 0,
        });
      }
      // this.wait = true;
      // window.setTimeout(() => (this.wait = false), 10);
    }
    this.previousCoor.x = coor.x;
    this.previousCoor.y = coor.y;
  }

  drawTouch(point: any) {
    point.intensity *= 0.99;

    point.radius = point.radius * 0.96 + 0.08 * this.radius;

    const grd = this.ctx.createRadialGradient(
      point.pos.x,
      point.pos.y,
      0,
      point.pos.x,
      point.pos.y,
      point.radius
    );
    grd.addColorStop(0.5, `rgba(255, 255, 255, 0)`);
    grd.addColorStop(1, `rgba(255, 255, 255, ${point.intensity})`);

    this.ctx.beginPath();
    this.ctx.fillStyle = grd;
    this.ctx.arc(point.pos.x, point.pos.y, point.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  update() {
    if (this.trail.length) {
      this.clear();

      this.trail = this.trail
        .splice(-15)
        .filter((point: any, i: any) => point.intensity > 0.01);

      this.trail.forEach((point: any) => {
        this.drawTouch(point);
      });

      this.texture.needsUpdate = true;
    }
  }
}
