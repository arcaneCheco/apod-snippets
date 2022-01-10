import Component from "../classes/Component";
import { TextureLoader, Texture } from "three";
import EventEmitter from "events";

declare global {
  interface Window {
    TEXTURES: { [key: string]: Texture };
  }
}

export default class Preloader extends Component {
  textureLoader;
  length;
  constructor() {
    super({
      element: ".preloader",
      elements: {
        title: ".preloader__title",
        progressFill: ".preloader__progressfill",
      },
    });

    this.textureLoader = new TextureLoader();
    this.length = 0;
    this.load();
  }

  load() {
    window.TEXTURES = {};

    window.ASSETS.forEach((image: string) => {
      this.textureLoader.load(image, (texture) => {
        this.onAssetLoaded(texture, image);
      });
    });
  }

  onAssetLoaded(texture: Texture, image: string) {
    texture.generateMipmaps = false;
    window.TEXTURES[image] = texture;
    this.length += 1;
    const percent = this.length / window.ASSETS.length;
    this.elements.progressFill.innerHTML = `${Math.round(100 * percent)}%`;
    if (percent === 1) {
      this.onLoaded();
    }
  }

  onLoaded() {
    return new Promise((resolve) => {
      this.emit("completed");

      this.destroy();
    });
  }

  destroy() {
    this.element.parentNode.removeChild(this.element);
  }
}
