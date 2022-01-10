import * as THREE from "three";
import GSAP from "gsap";

export default class ExploreDetailTransition {
  scene;
  detail;
  explore;
  constructor({ scene, detail, explore }: any) {
    this.scene = scene;
    this.detail = detail;
    this.explore = explore;
  }

  exploreToDetail() {
    const exploreMesh =
      this.explore.medias[this.explore.index].mesh.clone(false);
    exploreMesh.position.x += this.explore.group.position.x;

    const detailMesh = this.detail.mesh;

    const timeline = GSAP.timeline();

    timeline.to(
      exploreMesh.position,
      {
        ...detailMesh.position,
        duration: 1,
      },
      0
    );
    timeline.to(
      exploreMesh.scale,
      {
        ...detailMesh.scale,
        duration: 1,
      },
      0
    );

    timeline.call(() => {
      this.scene.remove(exploreMesh);
      exploreMesh.geometry.dispose();
      exploreMesh.material.dispose();
      exploreMesh.material.uniforms.uTexture.value.dispose();
    });

    this.scene.add(exploreMesh);
  }

  detailToExplore() {
    const detailMesh = this.detail.mesh.clone(false);
    this.scene.add(detailMesh);

    const exploreMesh = this.explore.medias[this.explore.index].mesh;

    const timeline = GSAP.timeline();

    timeline.to(
      detailMesh.position,
      {
        x: 0,
        y: 0,
        duration: 1,
      },
      0
    );
    timeline.to(
      detailMesh.scale,
      {
        ...exploreMesh.scale,
        duration: 1,
      },
      0
    );

    timeline.call(() => {
      this.scene.remove(detailMesh);
      detailMesh.geometry.dispose();
      detailMesh.material.dispose();
      //   exploreMesh.material.uniforms.uTexture.value.dispose();
    });
  }
}
