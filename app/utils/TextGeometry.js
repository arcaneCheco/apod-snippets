import * as THREE from "three";
import createLayout from "layout-bmfont-text";
import createIndices from "quad-indices";

var vertices = require("./vertices");
var utils = require("./utils");

class TextGeometry extends THREE.BufferGeometry {
  constructor(opt) {
    super();
    if (typeof opt === "string") {
      opt = { text: opt };
    }
    this._opt = Object.assign({}, opt);
    if (opt) this.update(opt);
  }

  update(opt) {
    if (typeof opt === "string") {
      opt = { text: opt };
    }
    // use constructor defaults
    opt = Object.assign({}, this._opt, opt);

    if (!opt.font) {
      throw new TypeError("must specify a { font } in options");
    }

    this.layout = createLayout(opt);

    // get vec2 texcoords
    let flipY = opt.flipY !== false;

    // the desired BMFont data
    let font = opt.font;

    // determine texture size from font file
    let texWidth = font.common.scaleW;
    let texHeight = font.common.scaleH;

    // get visible glyphs
    let glyphs = this.layout.glyphs.filter(function (glyph) {
      let bitmap = glyph.data;
      return bitmap.width * bitmap.height > 0;
    });

    // provide visible glyphs for convenience
    this.visibleGlyphs = glyphs;

    // get common vertex data
    let positions = vertices.positions(glyphs);
    let uvs = vertices.uvs(glyphs, texWidth, texHeight, flipY);
    let indices = createIndices([], {
      clockwise: true,
      type: "uint16",
      count: glyphs.length,
    });

    // update vertex data
    this.setIndex(indices);
    this.setAttribute("position", new THREE.BufferAttribute(positions, 2));
    this.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    // update multipage data
    if (!opt.multipage && "page" in this.attributes) {
      // disable multipage rendering
      this.deleteAttribute("page");
    } else if (opt.multipage) {
      // enable multipage rendering
      var pages = vertices.pages(glyphs);
      this.setAttribute("page", new THREE.BufferAttribute(pages, 1));
    }
  }

  computeBoundingSphere() {
    if (this.boundingSphere === null) {
      this.boundingSphere = new THREE.Sphere();
    }

    let positions = this.attributes.position.array;
    let itemSize = this.attributes.position.itemSize;
    if (!positions || !itemSize || positions.length < 2) {
      this.boundingSphere.radius = 0;
      this.boundingSphere.center.set(0, 0, 0);
      return;
    }
    utils.computeSphere(positions, this.boundingSphere);
    if (isNaN(this.boundingSphere.radius)) {
      console.error(
        "THREE.BufferGeometry.computeBoundingSphere(): " +
          "Computed radius is NaN. The " +
          '"position" attribute is likely to have NaN values.'
      );
    }
  }

  computeBoundingBox() {
    if (this.boundingBox === null) {
      this.boundingBox = new THREE.Box3();
    }

    var bbox = this.boundingBox;
    var positions = this.attributes.position.array;
    var itemSize = this.attributes.position.itemSize;
    if (!positions || !itemSize || positions.length < 2) {
      bbox.makeEmpty();
      return;
    }
    utils.computeBox(positions, bbox);
  }
}

const createTextGeometry = (opt) => {
  return new TextGeometry(opt);
};
export default createTextGeometry;
