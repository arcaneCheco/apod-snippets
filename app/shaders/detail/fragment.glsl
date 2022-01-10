uniform sampler2D uTextureCurrent;
uniform sampler2D uTextureBefore;
uniform sampler2D uTextureNext;
uniform float uProgress;
uniform float uIntensity;
uniform float uAspect;

varying vec2 vUv;

void main() {
    // vec4 image = texture2D(uTexture, vUv);
    // vec4 finalColor = mix(image, vec4(1., 0., 0., 1.), 0.1);
    // gl_FragColor = finalColor;

    // vec2 newUv = (vUv - vec2(0.5)) * vec2(uAspect, 1.) + vec2(0.5);
    vec2 newUv = vUv;
    // newUv.y *= uAspect;

    vec4 dCurrent = texture2D(uTextureCurrent, newUv);
    vec4 dNext = texture2D(uTextureNext, newUv);
    float displaceCurrent = (dCurrent.r + dCurrent.g + dCurrent.b)*0.33;
    float displaceNext = (dNext.r + dNext.g + dNext.b)*0.33;

    vec4 tCurrent = texture2D(uTextureCurrent, vec2(newUv.x, newUv.y + uProgress * (displaceNext * uIntensity)));
    vec4 tNext = texture2D(uTextureNext, vec2(newUv.x, newUv.y + (1.0 - uProgress) * (displaceCurrent * uIntensity)));

    gl_FragColor = mix(tCurrent, tNext, uProgress);

}