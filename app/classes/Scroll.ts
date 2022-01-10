export default class Scroll {
  scroll;
  constructor() {
    this.scroll = {
      ease: 0.07,
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
    };
  }
}
