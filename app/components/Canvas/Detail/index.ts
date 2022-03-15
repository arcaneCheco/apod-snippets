import {
  Scene,
  Group,
  PerspectiveCamera,
  Vector2,
  Vector3,
  Raycaster,
  BoxGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  Mesh,
  Quaternion,
  Euler,
} from "three";
import GSAP from "gsap";
import fragmentShaderDef from "../../../shaders/detail/fragmentDef.glsl";
import vertexShader from "../../../shaders/detail/vertex.glsl";
import fragmentShader from "../../../shaders/detail/fragment.glsl";
import DetailDom from "./DetailDom";
import Mirror from "./Mirror";
import Detection from "../../../classes/Detection";
import EventEmitter from "events";

export default class Detail extends EventEmitter {
  scene: Scene;
  template: string;
  camera: PerspectiveCamera;
  width = window.innerWidth;
  height = window.innerHeight;
  group = new Group();
  mouse = new Vector2();
  raycaster = new Raycaster();
  orbitControl = {
    current: new Vector2(),
    target: new Vector2(),
    diff: new Vector2(),
    sensitivity: 0.003,
    lerp: 0.05,
  };
  defaultRotation = new Vector3(0.002, 0.008, 0.005);
  faceMap = [
    new Vector3(0, -Math.PI / 2, 0),
    new Vector3(0, Math.PI / 2, 0),
    new Vector3(Math.PI / 2, 0, 0),
    new Vector3(-Math.PI / 2, 0, 0),
    new Vector3(0, 0, 0),
    new Vector3(0, Math.PI, 0),
  ];
  meshRotationOffset = -0.6;
  geometry: BoxGeometry;
  imageElement: HTMLImageElement = document.querySelector(
    ".detail__explanation__media__image"
  )!;
  detailElements: NodeListOf<HTMLDivElement> =
    document.querySelectorAll(".detail");
  details: { [key: string]: DetailDom } = {};
  defaultMaterial: ShaderMaterial;
  textureMaterials: ShaderMaterial[];
  materials: ShaderMaterial[] = [];
  mesh: Mesh;
  mirror: Mirror;
  active: any;
  sliceFigure: any;
  textures: any;
  textureArray: any;
  material: any;
  block: any;
  wrapperOffset: number;
  wrapperHeight: number;
  scroll: number;
  previousScroll: number;
  triggerHeights: number[];
  medias: number;
  isFullscreen: boolean;
  isTransitioning: boolean;
  touchStart = new Vector2();
  touchStartTime: number;
  time: number;
  orbitControlEnabled = false;
  snippetRefElement = document.querySelector(".snippets__gallery")!;
  transitionStartPosition: number;
  transitionStartPositionDepth: number;
  fullscreenTransitionDebounce;
  constructor({ scene, template, camera }: any) {
    super();
    this.scene = scene;
    this.template = template;
    this.camera = camera;

    this.isFullscreen = false; //not used atm
    this.isTransitioning = false; //not used atm

    this.setGeometry();
    this.setDetails();
    this.setDefaultMaterial();
    this.setTextureMaterials();
    this.setMesh();
    Detection.isDesktop() && this.setMirror();

    this.onResize({ width: this.width, height: this.height });

    this.fullscreenTransitionDebounce = this.debounce(
      this.fullscreenTransition
    );
  }

  fromSnippetsTransition(time: number) {
    this.isTransitioning = true;
    this.group.rotation.set(0, 0, 0);
    this.materials.forEach((mat) => {
      mat.uniforms.uProgress.value = 0;
    });
    const faceDirection =
      this.faceMap[Math.max(this.active.scrollIndex - 1, 0)];
    this.mesh.rotation.set(faceDirection.x, faceDirection.y, faceDirection.z);
    const scale = this.snippetRefElement.clientWidth;
    this.group.scale.set(scale, scale, scale);
    this.group.position.z = -scale / 2 + this.transitionStartPositionDepth;
    this.group.position.x = this.transitionStartPosition;

    const duration = 1.5;
    const ease = "power2.inOut";
    const delay = 0.3;
    const imgSize = this.imageElement.clientWidth;
    GSAP.to(this.group.scale, {
      duration,
      delay,
      ease,
      x: imgSize,
      y: imgSize,
      z: imgSize,
    });
    GSAP.to(this.group.position, {
      duration,
      delay,
      ease,
      x: this.active.imagePositions[this.active.scrollIndex],
      y: 0,
      z: -imgSize / 2,
    });
    GSAP.to(this.group.rotation, {
      duration,
      delay,
      ease,
      y:
        this.active.scrollIndex % 2 === 0
          ? this.meshRotationOffset
          : -this.meshRotationOffset,
    });
    GSAP.to(this.mesh.position, {
      duration,
      delay,
      ease,
      y: Math.sin(Math.PI * (((time + duration) * 0.4) % 1)) * 0.1,
    });
    const targetProgress = this.active.scrollIndex === 0 ? 1 : 0.4;
    this.materials.forEach((mat) => {
      GSAP.to(mat.uniforms.uProgress, {
        duration: duration * 0.5,
        delay,
        ease,
        value: targetProgress,
      });
    });
    GSAP.delayedCall(duration, () => {
      this.isTransitioning = false;
    });
  }

  fromAboutTransition() {
    GSAP.from(this.group.scale, {
      delay: 0.3,
      x: 0,
      y: 0,
      z: 0,
      duration: 1.5,
    });
  }

  show({ from, to, time }: { from: string; to: string; time: number }) {
    this.orbitControlEnabled = false;
    this.onChange(to);
    const delay = 0.3;
    GSAP.delayedCall(delay, () => {
      this.scene.add(this.group);
    });
    if (from === "/snippets") {
      this.fromSnippetsTransition(time);
    } else if (from === "/about") {
      this.fromAboutTransition();
    }
  }

  toSnippetsTransition() {
    const targetScale = this.snippetRefElement.clientWidth;
    const duration = 1;
    GSAP.to(this.group.scale, {
      duration,
      x: targetScale,
      y: targetScale,
      z: targetScale,
    });
    GSAP.to(this.group.position, {
      duration,
      x: 0,
      z: -targetScale / 2,
    });
    GSAP.to(this.mesh.position, {
      duration,
      y: 0,
    });
    GSAP.to(this.group.rotation, {
      duration,
      y: 0,
    });
    this.materials.forEach((mat) => {
      GSAP.to(mat.uniforms.uProgress, {
        duration: duration,
        value: 0,
      });
    });
    const meshRotationTarget =
      this.active.scrollIndex > 0
        ? this.faceMap[this.active.scrollIndex - 1]
        : this.faceMap[0];
    GSAP.to(this.mesh.rotation, {
      duration,
      ...meshRotationTarget,
    });

    GSAP.delayedCall(duration, () => {
      this.scene.remove(this.group);
    });
  }

  hide(template: string) {
    this.isFullscreen = false;
    this.orbitControlEnabled = false;
    this.exitFullscreen();
    this.emit(
      "leavingDetail",
      this.active.textures[Math.max(this.active.scrollIndex - 1, 0)],
      this.active.index
    );
    if (template === "/snippets") {
      this.toSnippetsTransition();
    } else {
      this.scene.remove(this.group);
    }
  }

  setGeometry() {
    this.geometry = new BoxGeometry(1, 1, 1, 20, 20, 20);
    const unitR = (0.5 * Math.sqrt(3) + 0.5) * 0.5; //0.68301270189
    const count = this.geometry.attributes.position.count;
    const sphereArray = new Float32Array(count * 3);
    const v = new Vector3();
    for (let i = 0; i < count; i++) {
      v.fromBufferAttribute(this.geometry.attributes.position, i).setLength(
        unitR
      );
      sphereArray[i * 3] = v.x;
      sphereArray[i * 3 + 1] = v.y;
      sphereArray[i * 3 + 2] = v.z;
    }
    this.geometry.setAttribute(
      "aSphere",
      new Float32BufferAttribute(sphereArray, 3)
    );
  }

  setDetails() {
    [...this.detailElements].forEach((element) => {
      this.details[element.id] = new DetailDom({ element });
    });
  }

  setDefaultMaterial() {
    const noiseTexture = window.TEXTURES.noise;
    this.defaultMaterial = new ShaderMaterial({
      vertexShader,
      fragmentShader: fragmentShaderDef,
      depthTest: false,
      transparent: true,
      uniforms: {
        uProgress: { value: 1 },
        uTime: { value: 0 },
        uC: { value: 0 },
        uTexture: { value: noiseTexture },
      },
    });
  }

  setTextureMaterials() {
    const textureMaterial = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      depthTest: false,
      transparent: true,
      uniforms: {
        uProgress: { value: 1 },
        uMap: { value: null },
      },
    });
    this.textureMaterials = [
      textureMaterial,
      textureMaterial.clone(),
      textureMaterial.clone(),
      textureMaterial.clone(),
    ];
  }

  setMesh() {
    this.mesh = new Mesh(this.geometry, this.materials);
    this.mesh.renderOrder = 100000;
    this.group.renderOrder = 20000;
    this.group.add(this.mesh);
  }

  setMirror() {
    this.mirror = new Mirror({
      width: this.width,
      height: this.height,
      parent: this.group,
    });
  }

  updateMaterials() {
    for (let i = 0; i < 6; i++) {
      if (i < this.active.count) {
        this.materials[i] = this.textureMaterials[i];
        this.materials[i].uniforms.uMap.value = this.active.textures[i];
      } else {
        this.materials[i] = this.defaultMaterial;
      }
    }
  }

  onResize({ width, height }: { width?: number; height?: number }) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (this.isFullscreen) {
      this.onResizeFullScreen();
      return;
    }
    const { left: imgLeft, width: imgSize } =
      this.imageElement.getBoundingClientRect();
    this.group.scale.set(imgSize, imgSize, imgSize);

    this.group.position.z = -imgSize / 2;
    this.group.position.x =
      this.active?.scrollIndex % 2 === 1
        ? imgLeft - this.width / 2 + imgSize / 2
        : -(imgLeft - this.width / 2 + imgSize / 2);

    this.group.rotation.y =
      Math.sign(this.group.position.x) * this.meshRotationOffset;

    Object.values(this.details).forEach((detail) => detail.onResize());
  }

  onResizeFullScreen() {
    const size = Math.min(this.active.height, window.innerWidth) * 0.95;
    this.group.scale.set(size, size, size);
    this.group.position.z = -size / 2;
    Object.values(this.details).forEach((detail) => detail.onResize());
  }

  onChange(template: string) {
    const id = template.split("/").pop()!;
    this.active = this.details[id];
    this.updateMaterials();
  }

  enterFullscreen() {
    this.emit("enterFullscreen");
    const size = Math.min(this.active.height, window.innerWidth) * 0.95;
    GSAP.to(this.group.scale, {
      x: size,
      y: size,
      z: size,
      duration: 1,
    });
    GSAP.to(this.group.position, {
      x: 0,
      z: -size / 2,
      duration: 1,
    });
    GSAP.to(this.mesh.position, {
      y: 0,
      duration: 1,
    });
    GSAP.to(this.group.rotation, {
      y: 0,
      duration: 1,
    });

    this.materials.map((mat) => {
      GSAP.to(mat.uniforms.uProgress, {
        value: 0,
        duration: 1.5,
      });
    });
  }

  exitFullscreen() {
    this.emit("exitFullscreen");
    const { left: imgLeft, width: imgSize } =
      this.imageElement.getBoundingClientRect();
    GSAP.to(this.group.scale, {
      x: imgSize,
      y: imgSize,
      z: imgSize,
      duration: 1,
    });
    GSAP.to(this.group.position, {
      x:
        this.active?.scrollIndex % 2 === 1
          ? imgLeft - this.width / 2 + imgSize / 2
          : -(imgLeft - this.width / 2 + imgSize / 2),
      z: -imgSize / 2,
      duration: 1,
    });

    GSAP.to(this.group.rotation, {
      y:
        this.active?.scrollIndex % 2 === 1
          ? -this.meshRotationOffset
          : this.meshRotationOffset,
      duration: 1,
    });

    this.materials.map((mat) => {
      GSAP.to(mat.uniforms.uProgress, {
        value: this.active.scrollIndex > 0 ? 0.4 : 1,
        duration: 1.5,
      });
    });
  }

  fullscreenTransition() {
    this.emit("fullscreen sound");
    if (this.isFullscreen) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
    this.isFullscreen = !this.isFullscreen;
  }

  debounce(func, timeout = 100) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  updateRaycaster(coords: { x: number; y: number }) {
    this.raycaster.setFromCamera(coords, this.camera);
    const intersect = this.raycaster.intersectObject(this.mesh);
    if (intersect.length) {
      return true;
    } else {
      return false;
    }
  }

  getFrontFace() {
    this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
    const intersect = this.raycaster.intersectObject(this.mesh);
    return intersect[0]?.face?.materialIndex || 0;
  }

  onTouchDown({ x, y }: { x: number; y: number }) {
    const overMesh = this.updateRaycaster({
      x: 2 * (x / this.width) - 1,
      y: -2 * (y / this.height) + 1,
    });
    this.touchStart.x = x;
    this.touchStart.y = y;
    if (overMesh) {
      this.emit("orbit control enabled");
      this.orbitControlEnabled = true;
      this.orbitControl.current.set(x, y);
      this.orbitControl.target.set(x, y);

      !Detection.isDesktop() && (this.touchStartTime = this.time);
    } else {
      this.orbitControlEnabled = false;
    }
  }

  onTouchMove({ x, y }: { x: number; y: number }) {
    if (this.orbitControlEnabled) {
      this.mouse.x = 2 * (x / this.width) - 1;
      this.mouse.y = -2 * (y / this.height) + 1;
      this.orbitControl.target.set(x, y);
    }
  }

  onTouchUp({ x, y }: { x: number; y: number }) {
    if (this.orbitControlEnabled) {
      if (Detection.isDesktop()) {
        const overMesh = this.updateRaycaster({
          x: 2 * (x / this.width) - 1,
          y: -2 * (y / this.height) + 1,
        });
        if (overMesh) {
          const xx = this.touchStart.distanceTo(new Vector2(x, y));
          if (xx < 2) {
            this.fullscreenTransition();
          }
        }
      } else {
        console.log("DIFF: ", this.time - this.touchStartTime);
        if (this.time - this.touchStartTime < 0.11) {
          this.fullscreenTransition();
        }
      }
      if (this.isFullscreen) {
        const frontFaceIndex = this.getFrontFace();
        GSAP.to(this.mesh.rotation, {
          ...this.faceMap[frontFaceIndex],
          duration: 1,
          onComplete: () => {
            this.orbitControl.current.copy(this.orbitControl.target);
          },
        });
      } else {
        if (this.active.scrollIndex > 0) {
          GSAP.to(this.mesh.rotation, {
            ...this.faceMap[this.active.scrollIndex - 1],
            duration: 1,
            onComplete: () => {
              this.orbitControl.current.copy(this.orbitControl.target);
            },
          });
        }
      }
    }
    this.emit("orbit control disabled");
    this.orbitControlEnabled = false;
  }

  triggerTransition(down?: boolean) {
    GSAP.to(this.group.position, {
      x: this.active.imagePositions[this.active.scrollIndex],
      duration: 1,
    });
    GSAP.to(this.mesh.rotation, {
      ...this.faceMap[this.active.scrollIndex - 1],
      duration: 1,
    });

    GSAP.to(this.group.rotation, {
      y:
        Math.sign(this.active.imagePositions[this.active.scrollIndex]) *
        this.meshRotationOffset,
      duration: 1,
    });

    if (this.active.scrollIndex > 0) {
      this.materials.forEach((mat) => {
        GSAP.to(mat.uniforms.uProgress, {
          value: 0.4,
          duration: 1,
        });
      });
    } else {
      this.materials.forEach((mat) => {
        GSAP.to(mat.uniforms.uProgress, {
          value: 1,
          duration: 1,
        });
      });
    }
  }

  updateOrbitControl() {
    this.orbitControl.current.lerp(
      this.orbitControl.target,
      this.orbitControl.lerp
    );
    this.orbitControl.diff.subVectors(
      this.orbitControl.target,
      this.orbitControl.current
    );
    if (this.orbitControl.diff.length() > 1) {
      this.orbitControl.diff.multiplyScalar(this.orbitControl.sensitivity);
      const q = new Quaternion().setFromEuler(
        new Euler(this.orbitControl.diff.y, this.orbitControl.diff.x, 0, "XYZ")
      );
      this.mesh.quaternion.multiplyQuaternions(q, this.mesh.quaternion);
    }
  }

  defaultMotionUpdate(time: number) {
    if (this.active.scrollIndex === 0) {
      this.mesh.rotation.x += this.defaultRotation.x;
      this.mesh.rotation.y += this.defaultRotation.y;
      this.mesh.rotation.z += this.defaultRotation.z;
    }
    this.mesh.position.y = Math.sin(Math.PI * ((time * 0.4) % 1)) * 0.1;
  }

  updateDefaultMaterial(time: number) {
    this.defaultMaterial.uniforms.uTime.value = time;
    this.defaultMaterial.uniforms.uC.value = Math.sin(time);
  }

  update({ scroll, time }: any) {
    this.time = time;
    this.updateDefaultMaterial(time);

    if (!this.isTransitioning) {
      if (!this.isFullscreen) {
        this.defaultMotionUpdate(time);
      }
      this.previousScroll = this.scroll;
      this.scroll = scroll;
      const down = this.scroll > this.previousScroll;
      this.updateOrbitControl();
      if (down && this.active.scrollIndex < 4) {
        if (this.scroll > this.active.triggerHeights[this.active.scrollIndex]) {
          this.active.scrollIndex++;
          this.triggerTransition(down);
        }
      } else if (this.active.scrollIndex > 0) {
        if (
          this.scroll < this.active.triggerHeights[this.active.scrollIndex - 1]
        ) {
          this.active.scrollIndex--;
          this.triggerTransition(down);
        }
      }
    }
  }
}
