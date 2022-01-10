#define MAX_STEPS 64
#define MAX_DIST 5.
#define SURF_DIST 0.001
#define PI 3.1415

uniform float uTime;
uniform float uAspect;
uniform vec2 uMouse;

varying vec2 vUv;

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}

float sphere(vec3 p) {
    return length(p) - 0.5;
}

float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sinCrazy(vec3 p) {
    return 1. - (sin(p.x) + sin(p.y) + sin(p.z))/3.;
}

float scene(vec3 p) {

    vec3 p1 = rotate(p, vec3(1., .1, .1), uTime);
    float box = sdBox(p1, vec3(0.4));
    float sphere = sphere(p);
    float scale = 5. + 5.*sin(uTime*1.);
    return max(sphere, (0.85 - sinCrazy(p1*scale))/scale);
}

vec3 GetColorAmount(vec3 p) {
    float amount = clamp((1.5-length(p))/2., 0.,1.);
    vec3 col = 0.5 + 0.5 * cos(2.*PI * (vec3(0.30, 0.20, 0.20) + amount * vec3(1., 1., 0.5)));
    return col * amount;
}

vec3 GetNormal(vec3 p) {
	float d = scene(p);
    vec2 e = vec2(.001, 0.);
    
    vec3 n = d - vec3(
        scene(p-e.xyy),
        scene(p-e.yxy),
        scene(p-e.yyx));
    
    return normalize(n);
}

void main() {
    vec2 nUv = (vUv - vec2(0.5));
    nUv.x *= uAspect;

    vec3 ro = vec3(0., 0., 2.);
    vec3 rd = normalize(vec3(nUv, -1));

    vec3 light = vec3(1.,1.,1.);

    vec3 col =  vec3(0.);

    float dO = 0.;

    for(int i=0; i<MAX_STEPS; i++) {
        vec3 p = ro + rd*dO;
        float dS = scene(p);
        dO += dS;
        p = ro + rd*dO;
        if(abs(dS)<SURF_DIST || dO>MAX_DIST) {
            break;
        }
        col += 0.08*GetColorAmount(p);
    }
    gl_FragColor = vec4(col, 1.);
    gl_FragColor.r -= 0.6*abs(uMouse.x);
}