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
uniform float uBlack;
uniform float uBlackGradient;
uniform float uWhite;
uniform vec2 uMouse;

varying vec2 vUv;

void main()
{
	vec2 nUv = vUv - vec2(0.5);
	nUv.x *= uAspect;

	// trail
	float trail = texture2D(uTrail, vUv).r;
	float a = trail*PI2;
    vec2 distortion = uDistortion * trail * vec2(sin(a), cos(a));
    nUv -= distortion*2.*nUv;

	// colors
	vec3 color = texture2D(uTextureN, mod(nUv+uTime*vec2(uSpeedXneb, uSpeedYneb), 1.)).rbg;
	// color *= 0.; //not-original

	float offset = -0.45;

	vec3 pColor = texture2D(uTextureC, vec2(fract(uTime*uColorSpeed), 0.5)).rgb * 0.45;
	color -= pColor;



	color = color * uMultiplier;


	float strength = texture2D(uTexture, mod(nUv + uTime * vec2(uSpeedXsmoke, uSpeedYsmoke), 1.)).r * 0.2;

	gl_FragColor = vec4(color, strength);
	
	// gl_FragColor *= 2.; //not-original

	float dist = abs(nUv.y);
	dist = smoothstep(uBlack, uBlackGradient + uBlack, dist);
	gl_FragColor += clamp(dist*3., 0. ,1.);
	gl_FragColor += vec4(1., 0.2,0.2, 1.5) * trail * 0.3;

	// gl_FragColor.rgb = vec3(1.5) - gl_FragColor.rgb; //not-original
	// gl_FragColor.a = 1.; //not-original
	gl_FragColor = mix(gl_FragColor, vec4(1.), uWhite);
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


