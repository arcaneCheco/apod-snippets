#define PI 3.1415
uniform sampler2D uTrail;
uniform vec2 uResolution;
uniform float uTime;
uniform float uProgress;
uniform float uShake;
uniform float uScale;
varying vec2 vUv;
attribute vec3 aExplode;
attribute float aText;
varying float vText;
varying float vTrail;

void main() {
    vec2 nUv = uv;

    vec3 pos = position;

    pos += aExplode * uShake * sin(uTime*30.)*6.;

    pos *= uScale;
    vec2 resolution = uResolution * uScale;

    nUv *= resolution;
    nUv += 0.5 * (1. - resolution);


	float trail = texture2D(uTrail, nUv).r;
    trail = clamp(trail, 0., 1.);
	float a = trail*PI*2.;
    vec2 distortion = 20.1 * trail * vec2(sin(a), cos(a));

    pos.xy += distortion.xy;

    pos.z += 100.*sin(PI*uv.x);
    pos.z += 100.*sin(PI*uv.y);

    vec3 c = 500. * aExplode;
    pos = mix(pos, c, uProgress);

    vec4 viewPosition = modelViewMatrix * vec4(pos, 1.);
    gl_Position = projectionMatrix * viewPosition;
    
    gl_PointSize = 1.5;
    vUv = uv;
    vText = aText;
    vTrail = trail;
}