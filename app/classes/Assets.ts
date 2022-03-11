import { CompressedTexture } from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import EventEmitter from "events";

declare global {
  interface Window {
    TEXTURES: { [key: string]: CompressedTexture };
    TEXTURE_ASSETS: { [key: string]: string };
  }
}

export default class Assets extends EventEmitter {
  length = 0;
  progress: any;
  numAssets: any;
  loader = new KTX2Loader();
  constructor(renderer: any) {
    super();

    this.loader.setTranscoderPath("./basis/"); //new URL("../sounds/backtrack loop/final_boss_atrium_pt_1.wav", import.meta.url);
    // this.loader.setTranscoderPath(
    //   "../node_modules/three/examples/js/libs/basis/"
    // );

    this.loader.detectSupport(renderer);

    this.numAssets = Object.keys(window.TEXTURE_ASSETS).length;

    this.load();
  }

  load() {
    window.TEXTURES = {};

    Object.entries(window.TEXTURE_ASSETS).forEach(([name, url]) => {
      this.loader.load(url, (texture) => {
        window.TEXTURES[name] = texture;
        this.onAssetLoaded(name);
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
