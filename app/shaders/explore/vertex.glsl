uniform float uTime;
uniform float uSpeed;
uniform float uAdjusting;
uniform float uDirection;

varying vec2 vUv;

void main() {
    vec3 pos = position;
    // pos.x += sin(uv.y * 3.14 * 6.) * 0.1 * uSpeed;

    // pos.y *= 1. - uSpeed * 0.3 * (1. - uAdjusting);

    float dist = distance(uv, vec2(0.5));
    pos.z += 20. * sin(dist * 10. + uTime);

    // pos.z -= 150. * (sin((pos.x) * 3.14 + 3.14 * 0.5) + sin((pos.y) * 3.14 + 3.14 * 0.5)) * uSpeed * uDirection - 150.*uDirection*uSpeed*2.; // +600.;


    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    vUv = uv;
}