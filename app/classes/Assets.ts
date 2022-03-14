import { CompressedTexture } from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import EventEmitter from "events";

declare global {
  interface Window {
    TEXTURES: { [key: string]: CompressedTexture };
    SOUNDS: { [key: string]: HTMLAudioElement };
    TEXTURE_ASSETS: { [key: string]: string };
    SOUND_ASSETS: { [key: string]: string };
  }
}

export default class Assets extends EventEmitter {
  length = 0;
  progress: any;
  numAssets: any;
  loader = new KTX2Loader();
  constructor(renderer: any) {
    super();

    this.loader.setTranscoderPath("./basis/");
    this.loader.detectSupport(renderer);

    this.numAssets =
      Object.keys(window.TEXTURE_ASSETS).length +
      Object.keys(window.SOUND_ASSETS).length;

    this.load();
  }

  load() {
    window.TEXTURES = {};
    window.SOUNDS = {};

    Object.entries(window.TEXTURE_ASSETS).forEach(([name, url]) => {
      this.loader.load(url, (texture) => {
        window.TEXTURES[name] = texture;
        this.onAssetLoaded(name);
      });
    });
    Object.entries(window.SOUND_ASSETS).forEach(([name, url]) => {
      const sound = new Audio(url);
      window.SOUNDS[name] = sound;
      sound.addEventListener("progress", () => this.onAssetLoaded(name), {
        once: true,
      });
    });
  }

  onAssetLoaded(name: string) {
    this.length += 1;
    const progress = this.length / this.numAssets;
    this.emit("asset loaded", progress, name);
    if (progress === 1) {
      this.emit("all assets loaded");
    }
  }
}
