import backtrack from "../sounds/backtrack loop/final_boss_atrium_pt_1.wav";
// const backtrack = new URL("../sounds/backtrack loop/final_boss_atrium_pt_1.wav", import.meta.url);
import homeToSnippets from "../sounds/home-snippets transition/home-snippets1.mp3";
import openNav from "../sounds/opennav/grimm_cape_open_for_cast.wav";
import closeNav from "../sounds/closenav/grass_cut_3.wav";
import navIconEnter from "../sounds/home-snippets transition/heartbeat_B_01.wav";
import openPod from "../sounds/opening pod/final_boss_atrium_white_1.wav";
import closePod from "../sounds/closing pod/final_boss_atrium_white_2.wav";
import enterAbout from "../sounds/enter about/final_boss_atrium_white_4.wav";
import exitAbout from "../sounds/leave about/final_boss_atrium_white_3.wav";
import particleVibration from "../sounds/particle vibration/dream_orb_loop.wav";
import enterFullscreen from "../sounds/pod fullscreen (on-click probably for openning and closing)/ghost_dialogue_death_initial_white.wav";
import exitFullscreen from "../sounds/pod fullscreen (on-click probably for openning and closing)/ghost_dialogue_death_initial_white.wav";
import podScrollTransition from "../sounds/scrolling pod (scroll trnasition)/garden_zombie_projectile_impact_1.wav";
import snippetsScroll from "../sounds/scrolling pod (scroll trnasition)/geo_hit_ground_1.wav";
import snippetsToHome from "../sounds/snippets-home transition/dream_plant_emit_orbs.wav";
import trail from "../sounds/trail/grass_move_1.wav";
import trailOverParticles from "../sounds/trail/grass_move_6.wav";

export default class Sound {
  medias: { [key: string]: HTMLAudioElement } = {};
  isDisabled = true;
  constructor() {
    this.setMedias();
  }

  setMedias() {
    const data = {
      backtrack,
      homeToSnippets,
      openNav,
      closeNav,
      closePod,
      enterAbout,
      exitAbout,
      openPod,
      navIconEnter,
      particleVibration,
      enterFullscreen,
      exitFullscreen,
      podScrollTransition,
      snippetsScroll,
      snippetsToHome,
      trail,
      trailOverParticles,
    };
    Object.entries<string>(data).map(([name, audiofile]) => {
      this.medias[name] = new Audio(audiofile);
    });
    this.medias["backtrack"].loop = true;
    this.medias["particleVibration"].loop = true;
  }

  enableSound() {
    this.medias["backtrack"].play();
    this.isDisabled = false;
  }

  disableSound() {
    this.medias["backtrack"].pause();
    this.isDisabled = true;
  }

  onChange({ from, to }: { from: string; to: string }) {
    if (this.isDisabled) return;
    if (from === "/" && to === "/explore") {
      this.medias["homeToSnippets"].currentTime = 0;
      this.medias["homeToSnippets"].play();
    }
    if (from === "/explore" && to === "/") {
      this.medias["snippetsToHome"].currentTime = 0;
      this.medias["snippetsToHome"].play();
    }
    if (from === "/explore" && to.includes("/detail/")) {
      this.medias["openPod"].currentTime = 0;
      this.medias["openPod"].play();
    }
    if (from.includes("/detail/") && to === "/explore") {
      this.medias["closePod"].currentTime = 0;
      this.medias["closePod"].play();
    }
    if (to === "/about") {
      this.medias["enterAbout"].currentTime = 0;
      this.medias["enterAbout"].play();
    }
    if (from === "/about") {
      this.medias["exitAbout"].currentTime = 0;
      this.medias["exitAbout"].play();
    }
  }

  onOpenNav() {
    if (this.isDisabled) return;
    this.medias["openNav"].currentTime = 0;
    this.medias["openNav"].play();
  }

  onCloseNav() {
    if (this.isDisabled) return;
    this.medias["closeNav"].currentTime = 0;
    this.medias["closeNav"].play();
  }

  onEnterNavIcon() {
    if (this.isDisabled) return;
    this.medias["navIconEnter"].currentTime = 0;
    this.medias["navIconEnter"].play();
  }

  onVibrateParticlesStart() {
    if (this.isDisabled) return;
    this.medias["particleVibration"].currentTime = 0;
    this.medias["particleVibration"].play();
  }

  onVibrateParticlesEnd() {
    if (this.isDisabled) return;
    this.medias["particleVibration"].pause();
  }

  onEnterFullscreen() {
    if (this.isDisabled) return;
    this.medias["enterFullscreen"].currentTime = 0;
    this.medias["enterFullscreen"].play();
  }

  onExitFullscreen() {
    if (this.isDisabled) return;
    this.medias["exitFullscreen"].currentTime = 0;
    this.medias["exitFullscreen"].play();
  }

  onPodScrollTransition() {
    if (this.isDisabled) return;
    this.medias["podScrollTransition"].currentTime = 0;
    this.medias["podScrollTransition"].play();
  }

  onScrollingSnippets() {
    if (this.isDisabled) return;
    this.medias["snippetsScroll"].currentTime = 0;
    this.medias["snippetsScroll"].play();
  }

  onUpdateTrail() {
    if (this.isDisabled) return;
    this.medias["trail"].currentTime = 0;
    this.medias["trail"].play();
  }
}
