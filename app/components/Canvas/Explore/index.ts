import * as THREE from "three";
import { lerp, clamp } from "three/src/math/MathUtils";
import Media from "./Media";
// import img from "./displacement.png";
import img from "./displ.png";

interface Props {
  scene: THREE.Scene;
  width: number;
  height: number;
}

export default class Explore {
  scene;
  width;
  height;
  group;
  galleryElement;
  geometry: THREE.PlaneGeometry;
  mediaElements;
  medias: Media[];
  scroll;
  mediaLinks;
  mediaBounds;
  galleryWidth;
  index;
  titles: HTMLElement;
  time;
  titleItems;
  previous;
  isAdjusting: any;
  direction: any;
  constructor({ scene, width, height }: Props) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.group = new THREE.Group();

    this.index = 4;

    this.galleryElement = document.querySelector(".explore__gallery")!;

    this.mediaBounds = {
      width: 0,
      height: 0,
      gap: 0,
      unitSize: 0,
    };

    this.mediaLinks = this.galleryElement.querySelectorAll(
      ".explore__gallery__link"
    ) as NodeListOf<HTMLElement>;

    this.galleryWidth = 0;

    this.mediaElements = document.querySelectorAll(".explore__gallery__media");

    this.scroll = {
      ease: 0.07,
      current: 0,
      target: 0,
      start: 0,
    };

    this.titles = document.querySelector(".explore__titles")!;
    this.titleItems = document.querySelectorAll(".explore__titles__item");
    this.time = 0;
    this.previous = 0;
    this.isAdjusting = false;
    this.direction = 1;
    // this.time = -this.titles.clientWidth / 2; //to be removed

    this.setGeometry();
    this.setGallery();

    this.onResize({ width: this.width, height: this.height });
  }

  setGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 60, 60);
  }

  setGallery() {
    this.medias = [...this.mediaLinks].map((element, index) => {
      const media = new Media({
        element,
        geometry: this.geometry,
        index,
        scene: this.group,
        mediaBounds: this.mediaBounds,
        displacementMap: img,
      });
      return media;
    });
  }

  show() {
    this.scene.add(this.group);
  }

  hide() {
    this.scene.remove(this.group);
  }

  adjustPosition() {
    this.isAdjusting = true;
    const distance =
      Math.round(
        this.scroll.target / (this.mediaBounds.width + this.mediaBounds.gap)
      ) *
        (this.mediaBounds.width + this.mediaBounds.gap) -
      this.scroll.target;
    this.scroll.target += distance;
  }

  onResize({ width, height }: any) {
    this.width = width;
    this.height = height;

    this.mediaBounds = {
      width: this.galleryElement.clientWidth,
      height: this.galleryElement.clientHeight,
      gap: 90,
      unitSize: this.galleryElement.clientWidth + 90,
    };

    this.galleryWidth =
      this.mediaLinks.length * this.mediaBounds.width +
      this.mediaLinks.length * this.mediaBounds.gap;
    this.group.position.x =
      -this.galleryWidth / 2 +
      this.mediaBounds.width / 2 +
      this.mediaBounds.gap / 2;

    this.medias.forEach((media) =>
      media.onResize({ mediaBounds: this.mediaBounds })
    );

    this.scroll.current = this.scroll.target =
      (this.index - 2) * (this.mediaBounds.width + this.mediaBounds.gap);
  }

  onWheel(event: any) {
    this.direction = Math.sign(event.pixelY);
    this.scroll.target += event.pixelY;
    if (Math.abs(event.pixelY) < 3) {
      // this.adjustPosition();
    }
  }

  onTouchDown(values: any) {
    this.scroll.start = this.scroll.current;
  }

  onTouchMove(values: any) {
    if (!values.idDown) return;
    const distance = values.x.start - values.x.end;
    console.log(distance);
    if (Math.abs(distance) > 1) {
      this.mediaLinks[this.index].classList.add(
        "explore__gallery__link--dragging"
      );
    }
    this.scroll.target = this.scroll.start + distance;
  }

  onTouchUp(values: any) {
    this.mediaLinks.forEach((element) =>
      element.classList.remove("explore__gallery__link--dragging")
    );
    // this.adjustPosition();
  }

  destroy() {}

  updateTitles() {
    this.titles.style.transform = `translateX(${this.time + 100000}px)`;
  }

  updateIndex(center: number) {
    let index = (center + 2) % 5;
    if (index < 0) index += 5;

    if (this.index !== index) {
      this.mediaLinks[this.index].classList.remove(
        "explore__gallery__link--active"
      );

      this.index = index;

      this.mediaLinks[this.index].classList.add(
        "explore__gallery__link--active"
      );
    }
  }

  update({ time }: any) {
    this.time = time;
    this.updateTitles();

    const distanceFromTarget = this.scroll.target - this.scroll.current;

    this.scroll.current += distanceFromTarget * 0.11;

    const distanceFromCenter = this.scroll.current / this.mediaBounds.unitSize;

    const center = Math.round(distanceFromCenter);
    this.updateIndex(center);

    const discrepancy = center - distanceFromCenter;

    // this.scroll.target += 0.04 * discrepancy * this.mediaBounds.unitSize;

    // this.scroll.target +=
    //   clamp(discrepancy * 16, -0.4, 0.4) * this.mediaBounds.width * 0.01;

    this.scroll.target +=
      Math.abs(discrepancy) ** 0.5 *
      this.mediaBounds.width *
      0.01 *
      Math.sign(discrepancy);

    const speed = this.scroll.current - this.previous;
    const shaderspeed = clamp(speed, -120, 120) / 120;
    this.previous = this.scroll.current;

    this.medias.forEach((media) => {
      media.update({
        scroll: this.scroll.current,
        galleryWidth: this.galleryWidth,
      });

      media.material.uniforms.uTime.value = this.time;
      if (this.isAdjusting) {
        media.material.uniforms.uSpeed.value *= 0.9;
      } else {
        media.material.uniforms.uSpeed.value = shaderspeed;
      }
    });
  }
}
