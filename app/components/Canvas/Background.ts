import {
  Scene,
  Group,
  Texture,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
} from "three";
import GSAP from "gsap";

// @ts-ignore
import vertexShader from "../../shaders/background/vertex.glsl";
// @ts-ignore
import fragmentShader from "../../shaders/background/fragment.glsl";

export default class Background {
  template: string;
  fov: number;
  aspect: number;
  width: number;
  height: number;
  group = new Group();
  trail: Texture;
  fogTexture = window.TEXTURES.fog;
  nebulaTexture = window.TEXTURES.nebula;
  colorPaletteTexture = window.TEXTURES.palette;
  geometry: PlaneGeometry;
  material: ShaderMaterial;
  meshes: any;
  color: any;
  backgroundColor: any;
  mesh: any;
  constructor({
    scene,
    trail,
    fov,
    aspect,
    template,
  }: {
    scene: Scene;
    trail: Texture;
    fov: number;
    aspect: number;
    template: string;
  }) {
    this.template = template;
    this.fov = fov;
    this.aspect = aspect;
    this.height = 7000 * Math.tan((fov * Math.PI) / 360);
    this.width = this.height * aspect;
    scene.add(this.group);

    this.trail = trail;

    this.setMesh();
  }

  setMesh() {
    this.geometry = new PlaneGeometry(1, 1);
    this.material = new ShaderMaterial({
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
        uMultiplier: { value: 1 },
        uBlack: { value: 0.26 },
        uBlackGradient: { value: 0.7 },
        uWhite: { value: 0 },
      },
      transparent: true,
    });
    this.mesh = new Mesh(this.geometry, this.material);
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
      if (this.material.uniforms.uBlackGradient.value < 0) {
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
      } else {
        GSAP.to(this.material.uniforms.uBlack, {
          value: 0.22,
          duration: 1.5,
        });
        GSAP.to(this.material.uniforms.uBlackGradient, {
          value: 0.8,
          duration: 1.5,
        });
      }
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
    if (template === "/snippets") {
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
