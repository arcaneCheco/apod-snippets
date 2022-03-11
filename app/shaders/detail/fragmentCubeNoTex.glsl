uniform vec3 uColor;

varying vec2 vUv;

void main() {
    vec3 col = mix(uColor, vec3(vUv, 0.5), 0.5);
    gl_FragColor = vec4(col, 1.);
}