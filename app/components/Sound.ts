export default class Sound {
  medias: { [key: string]: HTMLAudioElement };
  isDisabled = true;
  constructor() {
    this.medias = window.SOUNDS;
    this.medias["backtrack"].loop = true;
    this.medias["particleVibration"].loop = true;

    document.addEventListener(
      "visibilitychange",
      this.onVisibilityChange.bind(this)
    );
  }

  enableSound() {
    this.medias["backtrack"].play();
    this.isDisabled = false;
  }

  disableSound() {
    this.medias["backtrack"].pause();
    this.isDisabled = true;
  }

  onVisibilityChange(event: any) {
    if (this.isDisabled) return;
    if (document.hidden) {
      this.medias["backtrack"].pause();
    } else {
      this.medias["backtrack"].play();
    }
    console.log(document.hidden);
    console.log(event);
  }

  onChange({ from, to }: { from: string; to: string }) {
    if (this.isDisabled) return;
    if (from === "/" && to === "/snippets") {
      this.medias["homeToSnippets"].currentTime = 0;
      this.medias["homeToSnippets"].play();
    }
    if (from === "/snippets" && to === "/") {
      this.medias["snippetsToHome"].currentTime = 0;
      this.medias["snippetsToHome"].play();
    }
    if (from === "/snippets" && to.includes("/detail/")) {
      this.medias["openPod"].currentTime = 0;
      this.medias["openPod"].play();
    }
    if (from.includes("/detail/") && to === "/snippets") {
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
    this.medias["fullscreen"].currentTime = 0;
    this.medias["fullscreen"].play();
  }

  onExitFullscreen() {
    if (this.isDisabled) return;
    this.medias["fullscreen"].currentTime = 0;
    this.medias["fullscreen"].play();
  }
}
