varying vec2 vUv;
varying float vText;
varying float vTrail;
uniform float uOpacity;
uniform float uProgress;

void main()
{
	float isHome = (1. - uProgress);
	gl_FragColor = vec4(vec3(1.), (0.1 * isHome + 0.5*vText) * uOpacity);
	gl_FragColor -= vTrail * vec4(0.3, vUv.x, 0.1+0.2*vText, -0.5) * isHome;
}

