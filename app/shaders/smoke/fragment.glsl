#define PI2 6.28318530

uniform float uTime;
uniform float uAspect;
uniform sampler2D uTrail;
uniform float uDistortion;
uniform sampler2D uTextureN;
uniform float uSpeedXneb;
uniform float uSpeedYneb;
uniform sampler2D uTextureC;
uniform float uColorSpeed;
uniform float uMultiplier;
uniform sampler2D uTexture;
uniform float uSpeedXsmoke;
uniform float uSpeedYsmoke;


varying vec2 vUv;

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main()
{
	vec2 nUv = vUv - vec2(0.5);
	nUv.x *= uAspect;

	// trail
	float trail = texture2D(uTrail, vUv).r;
	float a = trail*PI2;
    vec2 distortion = uDistortion * trail * vec2(sin(a), cos(a));
    nUv += distortion;

	// colors
	vec4 neb = texture2D(uTextureN, mod(nUv+uTime*vec2(uSpeedXneb, uSpeedYneb), 1.));
	vec3 color = neb.rbg;

	float offset = -0.5;

	vec3 col = texture2D(uTextureC, vec2(fract(uTime*uColorSpeed), 0.5)).rgb;
	color += offset * col;
	color += vec3(1., 0.8, 0.8) * trail;
	// color += vec3(1., 0.8, 0.8) * sqrt(trail);

	color = color * uMultiplier;



	// smoke
	float strength = texture2D(uTexture, mod(nUv + uTime * vec2(uSpeedXsmoke, uSpeedYsmoke), 1.)).r * 0.9;

	strength -= trail*0.1;

	gl_FragColor = vec4(color, strength);

	gl_FragColor -= smoothstep(0.4, 0.5, abs(nUv.y));
}


// vec2 rotate(vec2 v, float a) {
// 	float s = sin(a);
// 	float c = cos(a);
// 	mat2 m = mat2(c, -s, s, c);
// 	return m * v;
// }
// cool pattern:
// float random = texture2D(uTextureR, vUv).r;
// float lighIntensity = 0.01/distance(vec2(0.5), mod(10.*random*vUv, 1.));
// vec3 light = vec3(2., 0.4, 0.4) * lighIntensity;
// float v = 1. -texture2D(uTextureV, aUv).r;
// v *= step(distance(vec2(0.), nUv), 0.5);

// centre and rotate image
// vec2 aUv = vUv;
// aUv.x *= uAspect;
// aUv.x -= (uAspect - 1.) * 0.5;
// aUv = rotate(aUv-vec2(0.5), uTime*0.9)+vec2(0.5);
// float v = 1. -texture2D(uTextureV, aUv).r;
// v *= step(distance(vec2(0.), nUv), 0.5);


