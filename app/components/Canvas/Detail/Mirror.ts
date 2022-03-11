import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector";
import GSAP from "gsap";

export default class Mirror {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  width: number;
  height: number;
  parent: THREE.Group;
  timeline: GSAPTimeline;
  origin: THREE.Vector3;
  dummy: THREE.Object3D;
  progress: number;
  constructor({
    width,
    height,
    parent,
  }: {
    width: number;
    height: number;
    parent: THREE.Group;
  }) {
    this.width = width;
    this.height = height;
    this.parent = parent;
    this.timeline = GSAP.timeline();
    this.setMesh();
    this.modifyMaterial();
    this.setAnimation();
  }

  setMesh() {
    this.mesh = new Reflector(new THREE.PlaneGeometry(1, 1), {
      textureWidth: this.width,
      textureHeight: this.height,
      clipBias: 0.1,
      encoding: THREE.sRGBEncoding,
      color: 0xffffff,
    }) as unknown as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
    this.mesh.renderOrder = -10000000000;
    this.parent.add(this.mesh);
  }

  modifyMaterial() {
    this.mesh.material.transparent = true;

    this.mesh.material.onBeforeCompile = (shader: THREE.Shader) => {
      shader.uniforms.uOpacity = { value: 1 };
      shader.fragmentShader = shader.fragmentShader.replace(
        "gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );",
        `
        gl_FragColor = vec4( blendOverlay( base.rgb, color ), uOpacity * base.g );
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "varying vec4 vUv;",
        `
        varying vec4 vUv;
        uniform float uOpacity;
        `
      );
    };
  }

  setAnimation() {
    this.mesh.scale.set(2, 2, 2);
    this.mesh.position.y = -0.8196;

    this.origin = new THREE.Vector3();
    this.dummy = new THREE.Object3D();
    this.progress = 0;

    this.timeline.to(this, {
      progress: 1,
      duration: 12,
      onStart: () => {
        this.progress = 0;
      },
      repeat: -1,
      ease: "none",
      onUpdate: this.update.bind(this),
    });
  }

  update() {
    const pp = Math.min(2 * this.progress, 2 * (1 - this.progress));
    this.mesh.position.x = 0.683 * Math.cos(Math.PI * pp);
    this.mesh.position.z = -0.683 * (Math.sin(Math.PI * pp) * 0.5 + 1);
    this.dummy.position.copy(this.mesh.position);
    this.dummy.lookAt(this.origin);
    this.mesh.rotation.copy(this.dummy.rotation);
  }

  resume() {
    this.timeline.resume();
  }

  pause() {
    this.timeline.pause();
  }
}
