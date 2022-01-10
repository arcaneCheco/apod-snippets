import { TextureLoader, Texture } from "three";
import EventEmitter from "events";

declare global {
  interface Window {
    TEXTURES: { [key: string]: Texture };
  }
}

export default class Assets extends EventEmitter {
  textureLoader;
  length;
  constructor() {
    super();
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
    if (percent === 1) {
      this.onLoaded();
    }
  }

  onLoaded() {
    return new Promise((resolve) => {
      this.emit("completed");
    });
  }
}
