import Component from "../../../classes/Component";
import { CompressedTexture } from "three";

export default class DetailDom extends Component {
  index: number;
  height: number;
  width = window.innerWidth;
  scrollIndex = 0;
  imagePositions: number[] = [];
  textures: CompressedTexture[] = [];
  count: number;
  triggerHeights: number[];
  constructor({ element }: { element: HTMLElement }) {
    super({
      element,
      elements: {
        wrapper: ".detail__wrapper",
        images: ".detail__explanation__media__image",
      },
    });
    this.index = Number(this.element.getAttribute("data-index"));
    this.height = this.elements.wrapper.clientHeight;

    this.setTextures();
    this.setTriggerHeights();
    this.setMeshPositions();
  }

  setTextures() {
    this.elements.images.forEach((img) =>
      this.textures.push(window.TEXTURES[img.getAttribute("data-src")!])
    );
    this.count = this.textures.length;
  }

  setTriggerHeights() {
    this.triggerHeights = Array(this.textures.length)
      .fill(0)
      .map((_, index) => {
        return (index * 2 + 1) * this.height * 0.5;
      });
  }

  setMeshPositions() {
    this.imagePositions = Array.from(
      this.elements.images as NodeListOf<HTMLElement>
    ).map((img) => {
      const bounds = img.getBoundingClientRect();
      return bounds.left + bounds.width / 2 - this.width / 2;
    });
    this.imagePositions.unshift(this.width * 0.8 - this.width / 2);
  }

  onResize() {
    this.height = this.elements.wrapper.clientHeight;
    this.width = window.innerWidth;
    this.setTriggerHeights();
    this.setMeshPositions();
  }
}
