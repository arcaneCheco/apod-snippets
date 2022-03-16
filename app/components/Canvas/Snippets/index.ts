import { Group, PlaneGeometry, Scene, CompressedTexture } from "three";
import { clamp } from "three/src/math/MathUtils";
import Media from "./Media";
import GSAP from "gsap";
import EventEmitter from "events";

export default class Snippets extends EventEmitter {
  scene: Scene;
  width: number;
  height: number;
  group = new Group();
  index = 4;
  galleryElement = document.querySelector(".snippets__gallery")!;
  gap = document.querySelector(".snippets__gap")!;
  mediaSize = 0;
  gapSize = 0;
  unitSize = 0;
  zMagnitude = 0;
  mediaLinks: NodeListOf<HTMLElement>;
  galleryWidth = 0;
  mediaElements = document.querySelectorAll(".snippets__gallery__media");
  scroll = {
    ease: 0.07,
    current: 0,
    target: 0,
    start: 0,
    previous: 0,
  };
  touchStart: number;
  geometry = new PlaneGeometry(1, 1, 50, 50);
  medias: Media[];
  time = 0;
  direction = 1;
  isTransitioning = false;
  speed: number;
  detailIndex = 2;
  activePodIndex = 0;
  podTexture: CompressedTexture;
  numMedias: number;
  constructor({
    scene,
    width,
    height,
  }: {
    scene: Scene;
    width: number;
    height: number;
  }) {
    super();
    this.scene = scene;
    this.width = width;
    this.height = height;

    this.mediaLinks = this.galleryElement.querySelectorAll(
      ".snippets__gallery__link"
    );

    this.numMedias = this.mediaLinks.length;

    this.setGallery();

    this.onResize({ width: this.width, height: this.height });
  }

  setGallery() {
    this.medias = [...this.mediaLinks].map((element, index) => {
      const media = new Media({
        element,
        geometry: this.geometry,
        position: index,
        scene: this.group,
      });
      return media;
    });
  }

  fromHomeTransition() {
    this.scene.add(this.group);
    this.medias.forEach((media, index) => {
      media.material.uniforms.uOpacity.value = 1;
      media.material.uniforms.uTransition.value = 1;
      GSAP.fromTo(
        media.material.uniforms.uScale,
        {
          value: 0,
        },
        {
          value: 1,
          delay: index * 0.075,
          duration: 1.5,
        }
      );
    });
    this.group.scale.set(0.5, 0.8, 1);
    GSAP.to(this.group.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.5,
    });
  }

  fromDetailTransition() {
    this.isTransitioning = true;
    this.medias.forEach((media) => {
      media.material.uniforms.uOpacity.value = 0;
    });
    this.onResize({ width: this.width, height: this.height });
    this.scene.add(this.group);
    const duration = 1;
    this.medias.forEach((media, index) => {
      if (index !== this.index) {
        GSAP.to(media.material.uniforms.uOpacity, {
          value: 1,
          duration,
          onComplete: () => {
            this.medias[this.index].material.uniforms.uOpacity.value = 1;
          },
        });
      }
    });
    GSAP.to(this.medias[this.index].material.uniforms.uTransition, {
      value: 1,
      duration: 3,
      delay: duration,
    });
    GSAP.delayedCall(duration, () => {
      this.isTransitioning = false;
    });
  }

  fromAboutTransition() {
    this.scene.add(this.group);
    this.onResize({ width: this.width, height: this.height });
    this.medias.forEach((media) => {
      media.material.uniforms.uScale.value = 1;
      GSAP.fromTo(
        media.material.uniforms.uOpacity,
        {
          value: 0,
        },
        {
          value: 1,
          duration: 1.5,
        }
      );
    });
  }

  show(template: string) {
    const activeMedia = this.medias.find(
      (media) => media.snippetIndex === this.activePodIndex
    )!;
    if (this.podTexture) {
      activeMedia.material.uniforms.uTexture.value = this.podTexture;
    }
    if (template === "/") {
      this.fromHomeTransition();
    } else if (template.includes("/detail/")) {
      this.index = activeMedia.position;
      this.fromDetailTransition();
    } else if (template === "/about") {
      this.fromAboutTransition();
    } else {
      this.scene.add(this.group);
    }
  }

  toHomeTransition() {
    this.medias.forEach((media, index) => {
      GSAP.to(media.material.uniforms.uScale, {
        value: 0,
        delay: index * 0.02,
        duration: 0.6,
      });
    });
  }

  toDetailTransition() {
    this.emit(
      "toDetail",
      this.medias[this.index].mesh.position.x + this.group.position.x,
      this.medias[this.index].mesh.position.z
    );
    const duration = 1.5;
    GSAP.to(this.medias[this.index].material.uniforms.uTransition, {
      value: 0,
      duration: 0.3,
      onComplete: () => {
        this.medias[this.index].material.uniforms.uOpacity.value = 0;
      },
    });
    this.medias.forEach((media, index) => {
      if (index !== this.index) {
        GSAP.to(media.material.uniforms.uOpacity, {
          value: 0,
          duration,
        });
      }
    });
    GSAP.delayedCall(duration, () => {
      this.scene.remove(this.group);
    });
  }

  hide(template: string) {
    if (template === "/") {
      this.toHomeTransition();
    } else if (template.includes("/detail/")) {
      this.toDetailTransition();
    } else {
      this.scene.remove(this.group);
    }
  }

  onResize({ width, height }: { width: number; height: number }) {
    this.width = width;
    this.height = height;

    this.mediaSize = this.galleryElement.clientWidth;
    this.gapSize = this.gap.clientWidth;
    this.unitSize = this.mediaSize + this.gapSize;
    this.zMagnitude = Math.min(this.mediaSize, 400);

    this.galleryWidth = this.numMedias * this.unitSize;

    this.group.position.x = 0.5 * (this.unitSize - this.galleryWidth);

    this.medias.forEach((media) =>
      media.onResize({
        galleryWidth: this.galleryWidth,
        upperBound: this.galleryWidth - 0.5 * this.unitSize,
        lowerBound: -0.5 * this.unitSize,
        scale: this.mediaSize,
        unitSize: this.unitSize,
      })
    );

    this.scroll.current = this.scroll.target = (this.index - 2) * this.unitSize;

    this.update(this.time);
  }

  onWheel(scroll: number) {
    if (!this.isTransitioning) {
      this.scroll.target += scroll;
    }
  }

  onTouchDown(x: number) {
    this.touchStart = x;
    this.scroll.start = this.scroll.current;
  }

  onTouchMove(x: number) {
    const distance = this.touchStart - x;
    if (Math.abs(distance) > 1) {
      this.mediaLinks[this.index].classList.add(
        "snippets__gallery__link--dragging"
      );
    }
    this.scroll.target = this.scroll.start + distance * 3;
  }

  onTouchUp() {
    this.mediaLinks.forEach((element) =>
      element.classList.remove("snippets__gallery__link--dragging")
    );
  }

  updateIndex(center: number) {
    let index = (center + 2) % 5;
    if (index < 0) index += 5;

    if (this.index !== index) {
      this.mediaLinks[this.index].classList.remove(
        "snippets__gallery__link--active"
      );

      this.index = index;

      this.mediaLinks[this.index].classList.add(
        "snippets__gallery__link--active"
      );
    }
  }

  update(time: number) {
    this.time = time;

    const distanceFromTarget = this.scroll.target - this.scroll.current;
    this.direction = distanceFromTarget >= 0 ? 1 : 0;

    this.scroll.previous = this.scroll.current;

    const speed = distanceFromTarget * 0.11;
    this.speed = clamp(speed, -80, 80) / 80;

    this.scroll.current += speed;

    const distanceFromCenter = this.scroll.current / this.unitSize;

    const center = Math.round(distanceFromCenter);
    this.updateIndex(center);

    const discrepancy = center - distanceFromCenter;

    this.scroll.target +=
      Math.sqrt(Math.abs(discrepancy)) *
      this.mediaSize *
      0.01 *
      Math.sign(discrepancy);

    this.medias.forEach((media) => {
      media.update(this.scroll.current);

      const deltaZ = Math.cos(
        Math.PI *
          ((media.mesh.position.x - this.unitSize) / this.group.position.x)
      );

      media.mesh.position.z = deltaZ * this.zMagnitude;

      media.material.uniforms.uTime.value = this.time;
      media.material.uniforms.uSpeed.value = this.speed;
      media.material.uniforms.uDirection.value = this.direction;
      media.material.uniforms.uZ.value = deltaZ / 0.7;
    });
  }
}
