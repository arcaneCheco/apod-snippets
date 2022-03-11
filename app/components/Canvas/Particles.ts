import {
  BufferGeometry,
  Scene,
  Texture,
  Float32BufferAttribute,
  ShaderMaterial,
  Vector2,
  Points,
} from "three";
import GSAP from "gsap";
import vertexShader from "../../shaders/particles/vertex.glsl";
import fragmentShader from "../../shaders/particles/fragment.glsl";
import EventEmitter from "events";

export default class Particles extends EventEmitter {
  template: string;
  scene: Scene;
  trail: Texture;
  width: number;
  height: number;
  logoElement: HTMLImageElement = document.querySelector(".home__logo")!;
  textureWidth = 512;
  textureHeight = 256;
  numPoints: number;
  imgData: any;
  threshold = 1;
  numVisible = 0;
  geometry = new BufferGeometry();
  material: any;
  debug: any;
  mesh: Points;
  touchStart = new Vector2();
  rotation: { current: Vector2; target: Vector2 } = {
    current: new Vector2(),
    target: new Vector2(),
  };
  vibrateAnimation: gsap.core.Tween | null = null;
  constructor({
    width,
    height,
    scene,
    trail,
    template,
  }: {
    width: number;
    height: number;
    scene: Scene;
    trail: Texture;
    template: string;
  }) {
    super();
    this.template = template;
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.trail = trail;

    this.setImageData();
    this.countVisibleData();
    this.setAttributes();
    this.setMaterial();
    this.setMesh();
    this.onChange(this.template);
    this.onResize({ width: this.width, height: this.height });
  }

  setImageData() {
    this.numPoints = this.textureWidth * this.textureHeight;
    const canvas = document.createElement("canvas");
    canvas.width = this.textureWidth;
    canvas.height = this.textureHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(1, -1);
    ctx.drawImage(
      this.logoElement,
      0,
      0,
      this.textureWidth,
      this.textureHeight * -1
    );
    const { data } = ctx.getImageData(
      0,
      0,
      this.textureWidth,
      this.textureHeight
    );
    this.imgData = Float32Array.from(data);
  }

  countVisibleData() {
    for (let i = 0; i < this.numPoints; i++) {
      if (this.imgData[i * 4 + 1] > this.threshold) this.numVisible++;
    }
  }

  setAttributes() {
    const positionArray = new Float32Array(this.numVisible * 3);
    const uvArray = new Float32Array(this.numVisible * 2);
    const textArray = new Float32Array(this.numVisible);

    const explodeArray = new Float32Array(this.numVisible * 3);

    for (let i = 0, j = 0; i < this.numPoints; i++) {
      if (this.imgData[i * 4 + 1] <= this.threshold) continue;

      textArray[j] = this.imgData[i * 4] > 230 ? 1 : 0;

      positionArray[j * 3] = (i % this.textureWidth) - this.textureWidth / 2;
      positionArray[j * 3 + 1] =
        Math.floor(i / this.textureWidth) - this.textureHeight / 2;

      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.random() * 2 * Math.PI;
      explodeArray[j * 3 + 0] = Math.sin(theta) * Math.cos(phi);
      explodeArray[j * 3 + 1] = Math.cos(theta);
      explodeArray[j * 3 + 2] = Math.sin(theta) * Math.sin(phi);

      uvArray[j * 2 + 0] = (i % this.textureWidth) / this.textureWidth;
      uvArray[j * 2 + 1] =
        Math.floor(i / this.textureWidth) / this.textureHeight;

      j++;
    }

    this.geometry.setAttribute(
      "position",
      new Float32BufferAttribute(positionArray, 3)
    );
    this.geometry.setAttribute(
      "aText",
      new Float32BufferAttribute(textArray, 1)
    );
    this.geometry.setAttribute(
      "aExplode",
      new Float32BufferAttribute(explodeArray, 3)
    );
    this.geometry.setAttribute("uv", new Float32BufferAttribute(uvArray, 2));
  }

  setMaterial() {
    this.material = new ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uShake: { value: 0 },
        uTime: { value: 0 },
        uTrail: { value: this.trail },
        uResolution: {
          value: new Vector2(
            this.textureWidth / this.width,
            this.textureHeight / this.height
          ),
        },
        uScale: { value: 1 },
        uHome: { value: 1 },
        uOpacity: {
          value: 1,
        },
      },
      transparent: true,
      vertexShader,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
    });
  }

  setMesh() {
    this.mesh = new Points(this.geometry, this.material);
    this.scene.add(this.mesh);
    this.mesh.renderOrder = -10;
    this.rotation.target.y = -0.485;
  }

  onTouchMove({ x, y }: { x: number; y: number }) {
    if (this.mesh.visible) {
      const xScreen = (2 * x) / this.width - 1;
      const yScreen = (-2 * (y * 0.8)) / this.height + 1;
      this.rotation.target.x = -yScreen;
      this.rotation.target.y = xScreen;
    }
  }

  onResize({ width, height }: { width: number; height: number }) {
    this.width = width;
    this.height = height;
    const elementWidth = this.logoElement.clientWidth;
    const scale = elementWidth / this.textureWidth;

    if (this.material) {
      this.material.uniforms.uScale.value = scale;
      this.material.uniforms.uResolution.value.x =
        this.textureWidth / this.width;
      this.material.uniforms.uResolution.value.y =
        this.textureHeight / this.height;
    }
  }

  onChange(template: any) {
    this.template = template;
    if (template === "/") {
      this.mesh.visible = true;
      if (this.material) {
        GSAP.to(this.material.uniforms.uProgress, {
          value: 0,
          duration: 1.5,
        });
        GSAP.to(this.material.uniforms.uOpacity, {
          value: 1,
          duration: 1.5,
        });
      }
      if (this.mesh) {
        GSAP.to(this.mesh.rotation, {
          y: 0,
          z: 0,
          duration: 1.5,
        });
        GSAP.to(this.mesh.position, {
          z: 10,
          duration: 1.5,
        });
      }
    } else if (template === "/explore") {
      this.mesh.visible = true;
      if (this.material) {
        GSAP.to(this.material.uniforms.uProgress, {
          value: 1,
          duration: 1.5,
        });
        GSAP.to(this.material.uniforms.uOpacity, {
          value: 1,
          duration: 1.5,
        });
      }
      GSAP.to(this.mesh.position, {
        z: 500,
        duration: 1.5,
      });
    } else {
      if (this.material) {
        GSAP.to(this.material.uniforms.uOpacity, {
          value: 0,
          duration: 1.5,
          onComplete: () => {
            this.mesh.visible = false;
          },
        });
      }
    }
  }

  onMouseEnterLink() {
    if (this.template !== "/") return;
    this.emit("vibrate particles start");
    this.vibrateAnimation = GSAP.to(this.material.uniforms.uShake, {
      value: 1,
      duration: 3,
      onComplete: () => {
        this.emit("goToEplore");
        this.emit("vibrate particles end");
      },
    });
  }

  onMouseExitLink() {
    this.emit("vibrate particles end");
    this.vibrateAnimation?.kill();
    if (this.template !== "/") return;
    GSAP.to(this.material.uniforms.uShake, {
      value: 0,
      duration: 1,
    });
  }

  update(time: number) {
    if (this.mesh.visible) {
      this.material && (this.material.uniforms.uTime.value = time);
      if (this.mesh && this.template !== "/") {
        this.mesh.rotation.z += 0.0001;
      }
      if (this.mesh) {
        this.rotation.current.lerp(this.rotation.target, 0.004);
        this.mesh.rotation.x = this.rotation.current.x;
        this.mesh.rotation.y = this.rotation.current.y;
      }
    }
  }
}
