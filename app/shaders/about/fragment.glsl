#define PI 3.1415

uniform sampler2D uTexture;
uniform sampler2D uTouch;

varying vec2 vUv;

void main() {
    // vec4 tex = texture2D(tDiffuse, vUv);
    // gl_FragColor = vec4(1., 0., 0., 1.);
    // gl_FragColor =tex;
    // gl_FragColor.r += 0.1;

    vec4 displacement = texture2D(uTouch, vUv);

    float theta = displacement.r*2.*3.1415;
    vec2 dir = vec2(sin(theta), cos(theta));

    vec2 dUv = vUv + displacement.r*0.25*dir;
    vec4 tex = texture2D(uTexture, dUv);
    gl_FragColor = vec4(tex);
    // gl_FragColor = displacement;
    // if(gl_FragColor.r<0.01) discard;


}