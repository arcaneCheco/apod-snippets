import * as THREE from "three";

interface Props {
  scene: THREE.Scene;
  width: number;
  height: number;
}

export default class Home {
  constructor({ scene, width, height }: Props) {}

  show() {}

  hide() {}

  onWheel() {}

  onResize() {}

  onTouchMove() {}

  destroy() {}

  update() {}
}
