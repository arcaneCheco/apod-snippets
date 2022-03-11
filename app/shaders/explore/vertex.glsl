uniform float uTime;
uniform float uScale;
uniform float uIndex;
uniform float uTransition;

varying vec2 vUv;

void main() {
    vec3 pos = position;

    pos *= uScale;

    float dist = distance(uv, vec2(0.5));
    float wave = sin(dist * (10.+uIndex*2.) + uTime*1.5 + 3.1415 * uIndex) * uTransition;
    pos.z += 6. * wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    vUv = uv;
}