uniform sampler2D uMap;

varying vec2 vUv;

void main() {
    vec4 map = texture2D(uMap, vUv);
    gl_FragColor = vec4(vUv, 1., 1.);
    gl_FragColor = map;
}