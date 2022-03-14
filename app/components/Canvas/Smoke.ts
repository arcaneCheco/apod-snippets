import * as THREE from "three";
import GSAP from "gsap";
import vertexShader from "../../shaders/smoke/vertex.glsl";
import fragmentShader from "../../shaders/smoke/fragment.glsl";
import e from "express";

export default class Smoke {
  group;
  geometry: any;
  material: any;
  meshes: any;
  width;
  height;
  color: any;
  smokeColor: any;
  mesh: any;
  trail: any;
  fov: any;
  aspect: any;
  parentWidth: any;
  parentHeight: any;
  template: any;
  fogTexture: any;
  nebulaTexture: any;
  colorPaletteTexture: THREE.Texture;
  mouse: THREE.Vector2 = new THREE.Vector2();
  constructor({ scene, width, height, trail, fov, aspect, template }: any) {
    this.parentWidth = width;
    this.parentHeight = height;
    this.template = template;
    this.fov = fov;
    this.aspect = aspect;
    this.height = 7000 * Math.tan((fov * Math.PI) / 360);
    this.width = this.height * aspect;
    this.group = new THREE.Group();
    scene.add(this.group);

    this.trail = trail;

    this.setTextures();
    this.setMaterial();
  }

  setTextures() {
    this.fogTexture = window.TEXTURES.fog;
    this.nebulaTexture = window.TEXTURES.nebula;
    this.colorPaletteTexture = window.TEXTURES.palette;
  }

  setMaterial() {
    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: this.width / this.height },
        uTexture: { value: this.fogTexture },
        uTextureN: { value: this.nebulaTexture },
        uTextureC: { value: this.colorPaletteTexture },
        uTrail: { value: this.trail },
        uDistortion: { value: 0.9 },
        uSpeedXneb: { value: 0.05 },
        uSpeedYneb: { value: 0.05 },
        uSpeedXsmoke: { value: 0.08 },
        uSpeedYsmoke: { value: 0.04 },
        uMultiplier: { value: 1 },
        uColorSpeed: { value: 0.1 },
        uBlack: { value: 0.26 },
        uBlackGradient: { value: 0.7 },
        uWhite: { value: 0 },
      },
      transparent: true,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.renderOrder = -10;
    this.mesh.position.z = -3000;
    this.mesh.scale.set(this.width, this.height, 1);
    this.group.add(this.mesh);
  }

  onResize({ camera }: any) {
    this.height = 7000 * Math.tan((camera.fov * Math.PI) / 360);
    this.width = this.height * camera.aspect;
    this.mesh.scale.set(this.width, this.height, 1);
    this.material.uniforms.uAspect.value = this.width / this.height;
  }

  async onChange(template: string) {
    if (template === "/about") {
      GSAP.to(this.material.uniforms.uWhite, {
        value: 0.7,
        duration: 1.5,
      });
    }
    if (template === "/") {
      GSAP.to(this.material.uniforms.uWhite, {
        value: 0,
        duration: 1.5,
      });
      GSAP.to(this.material.uniforms.uMultiplier, {
        value: 0.8,
        duration: 1.5,
      });
      GSAP.to(this.material.uniforms.uBlack, {
        value: 0,
        duration: 1,
        onComplete: () => {
          this.material.uniforms.uBlackGradient.value = 1;
          this.material.uniforms.uBlack.value = 1;
        },
      });
      GSAP.to(this.material.uniforms.uBlack, {
        value: 0.22,
        duration: 1.5,
        delay: 1,
      });
      GSAP.to(this.material.uniforms.uBlackGradient, {
        value: 0.8,
        duration: 1.5,
        delay: 1,
      });
    }
    if (template.includes("/detail/")) {
      GSAP.to(this.material.uniforms.uMultiplier, {
        value: 0.25,
        duration: 1.5,
      });
      GSAP.to(this.material.uniforms.uWhite, {
        value: 0,
        duration: 1.5,
      });
      if (this.template === "/") {
        GSAP.to(this.material.uniforms.uBlack, {
          value: 1,
          duration: 1.5,
          onComplete: () => {
            this.material.uniforms.uBlackGradient.value = -1;
            this.material.uniforms.uBlack.value = 0;
          },
        });
        GSAP.to(this.material.uniforms.uBlack, {
          value: 0.3,
          duration: 1.5,
          delay: 1.5,
        });
      } else {
        this.material.uniforms.uBlackGradient.value = -1;
        GSAP.to(this.material.uniforms.uBlack, {
          value: 0.3,
          duration: 1.5,
        });
      }
    }
    if (template === "/explore") {
      GSAP.to(this.material.uniforms.uMultiplier, {
        value: 1,
        duration: 1.5,
      });
      GSAP.to(this.material.uniforms.uWhite, {
        value: 0,
        duration: 1.5,
      });
      if (this.template === "/") {
        GSAP.to(this.material.uniforms.uBlack, {
          value: 1,
          duration: 1.5,
          onComplete: () => {
            this.material.uniforms.uBlackGradient.value = -1;
            this.material.uniforms.uBlack.value = 0;
          },
        });
        GSAP.to(this.material.uniforms.uBlack, {
          value: 0.28,
          duration: 1.5,
          delay: 1.5,
        });
      } else {
        this.material.uniforms.uBlackGradient.value = -1;
        GSAP.to(this.material.uniforms.uBlack, {
          value: 0.28,
          duration: 1.5,
        });
      }
    }
    this.template = template;
  }

  update(time: number) {
    this.material.uniforms.uTime.value = time;
  }
}
