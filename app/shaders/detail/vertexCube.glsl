attribute vec3 aSphere;

uniform float uProgress;

varying vec2 vUv;

void main() {
    vec3 pos = position;
    pos = mix(pos, aSphere, uProgress);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    vUv = uv;
}