import * as THREE from "three";

import vertexShader from "../../shaders/background/vertex.glsl";
import fragmentShader from "../../shaders/background/fragment.glsl";

interface Props {
  scene: THREE.Scene;
  width: number;
  height: number;
}

export default class Background {
  scene: THREE.Scene;
  width: number;
  height: number;
  geometry: THREE.PlaneGeometry;
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  constructor({ scene, width, height }: Props) {
    this.scene = scene;
    this.width = width;
    this.height = height;

    this.geometry = new THREE.PlaneGeometry(1, 1);

    this.setMaterial();
    this.setMesh();
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: this.width / this.height },
      },
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.scale.set(this.width, this.height, 1);
    this.scene.add(this.mesh);
  }

  update(time: any) {
    this.material.uniforms.uTime.value = time;
  }
}
