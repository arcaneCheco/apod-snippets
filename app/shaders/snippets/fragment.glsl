uniform sampler2D uTexture;
uniform sampler2D uDisplacementMap;
uniform sampler2D uDisplacementMap2;
uniform float uSpeed;
uniform float uDirection;
uniform float uTransition;
uniform float uOpacity;
uniform float uZ;

varying vec2 vUv;

void main() {
    float dR = texture2D(uDisplacementMap, vUv).r;
    float dL = texture2D(uDisplacementMap2, vUv).r;
    vec2 dUv = vUv;
    dUv.x = mix(vUv.x, dR * uDirection + (1.-uDirection) * (1. - dL), abs(uSpeed) * 4.5);

    vec4 image = texture2D(uTexture, dUv);
    vec3 colorDistortion = vec3(texture2D(uTexture, dUv + vec2(0.12*uSpeed, 0.)).r, texture2D(uTexture, dUv + vec2(0.34*uSpeed, 0.)).g, texture2D(uTexture, dUv + vec2(0.56*uSpeed, 0.)).b);
    image.rgb = mix(image.rgb, colorDistortion, uTransition);

    float gray = 0.21 * image.r + 0.71 * image.g + 0.07 * image.b;

    vec4 notCurrent = vec4(vec3(gray), 0.6);

    gl_FragColor =  mix(notCurrent, image, 1. - abs(uZ));
    gl_FragColor.a *= uOpacity;
    

}