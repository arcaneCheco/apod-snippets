#define PI2 6.28318530

uniform float uTime;
uniform float uAspect;
uniform sampler2D uTrail;
uniform sampler2D uTextureN;
uniform sampler2D uTextureC;
uniform float uMultiplier;
uniform sampler2D uTexture;
uniform float uBlack;
uniform float uBlackGradient;
uniform float uWhite;
uniform vec2 uMouse;

varying vec2 vUv;

void main()
{
	vec2 nUv = vUv - vec2(0.5);
	nUv.x *= uAspect;

	float trail = texture2D(uTrail, vUv).r;
	float a = trail*PI2;
    vec2 distortion = 0.9 * trail * vec2(sin(a), cos(a));
    nUv -= distortion*2.*nUv;

	vec3 color = texture2D(uTextureN, mod(nUv+uTime*vec2(0.05, 0.05), 1.)).rbg;

	float offset = -0.45;

	vec3 pColor = texture2D(uTextureC, vec2(fract(uTime*0.1), 0.5)).rgb * 0.45;
	color -= pColor;



	color = color * uMultiplier;


	float strength = texture2D(uTexture, mod(nUv + uTime * vec2(0.08, 0.04), 1.)).r * 0.2;

	gl_FragColor = vec4(color, strength);

	float dist = abs(nUv.y);
	dist = smoothstep(uBlack, uBlackGradient + uBlack, dist);
	gl_FragColor += clamp(dist*3., 0. ,1.);
	gl_FragColor += vec4(1., 0.2,0.2, 1.5) * trail * 0.3;

	gl_FragColor = mix(gl_FragColor, vec4(1.), uWhite);
}


