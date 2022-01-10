#define PI 3.1415

uniform sampler2D uTexture;
uniform sampler2D uDisplacementMap;
uniform float uAdjusting;
uniform float uSpeed;
uniform float uProgress;
uniform float uDirection;


varying vec2 vUv;

void main() {
    vec4 d = texture2D(uDisplacementMap, vUv);
    vec2 dUv = vUv;
    // dUv.x += d.r * uProgress;
    dUv.x = mix(vUv.x, d.r - 0.2, uSpeed);
    vec4 image = texture2D(uTexture, dUv);
    image.r = texture2D(uTexture, dUv + vec2(0.02*uSpeed, 0.)).r;
    image.g = texture2D(uTexture, dUv + vec2(0.04*uSpeed, 0.)).g;
    image.b = texture2D(uTexture, dUv + vec2(0.06*uSpeed, 0.)).b;
    // vec4 finalColor = mix(image, vec4(1., 0., 0., 1.), 0.1);
    gl_FragColor = image;
    // gl_FragColor = d;

    

}


// vec2 nUv = vUv - vec2(0.5);
    // float dist = distance(nUv, vec2(0.));

    // float angle = atan(nUv.x, nUv.y) / (PI * 2.0) + 0.5;
    // float radius = 0.25 + sin(angle * 100.0) * 0.02;
    // float strength = 1.0 - step(0.01, abs(dist) - radius);
    // gl_FragColor = vec4(1., 0., 0., strength);

    // vec2 wavedUv = vec2(
    // nUv.x,
    // nUv.y + sin(nUv.x * 30.0) * 0.1
    // );

    // strength = 1.0 - step(0.01, distance(wavedUv, vec2(0.)) - 0.25);

    // gl_FragColor = vec4(vec3(strength), 1.);