#define OCTAVES 2

uniform float uTime;
uniform float uC;
uniform sampler2D uTexture;

varying vec2 vUv;

vec2 rotUv(vec2 uv, float a) {
    float c = cos(a);
    float s = sin(a);
    mat2 m = mat2(c,s,-s,c);
    return m * uv;
}

vec2 random2(vec2 st){
      vec2 t = vec2(texture2D(uTexture, st/1023.).x, texture2D(uTexture, st/1023.+.5).x);
      return t*t*4.;
    }

// value noise: https://www.shadertoy.com/view/lsf3WH
float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);

        vec2 u = f*f*(3.0-2.0*f);

        return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                         dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                    mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                         dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
    }

float fbm(in vec2 _st) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      for (int i = 0; i < OCTAVES; ++i) {
          v += a * noise(_st);
        _st = rotUv(_st, 0.5) * 2. + shift;
        a *= 0.4;
      }
      return v;
    }

float pattern(vec2 uv, float time, inout vec2 q, inout vec2 r) {
      q = vec2(fbm(uv * .4), fbm(uv + vec2(5.2, 1.3)));

      r = vec2(fbm(uv * .1 + 4.0 * q + vec2(1.7 - time / 2.,9.2)), fbm(uv + 4.0 * q + vec2(8.3 - time / 2., 2.8)));

      vec2 s = vec2(fbm(uv + 5.0 * r + vec2(21.7 - time / 2., 90.2)), fbm( uv * .05 + 5.0 * r + vec2(80.3 - time / 2., 20.8))) * .35;

      return fbm(uv * .05 + 4.0 * s);
    }

// pattern adapted from: https://www.shadertoy.com/view/wttXz8
void main() {
    vec2 nUv = vUv - vec2(0.5);
    nUv = rotUv(nUv, 0.1 * uTime);
    nUv *= 0.9 * (sin(uTime)) + 3.;
    nUv.x -= 0.2 * uTime;

    vec2 q = vec2(0.);
    vec2 r = vec2(0.);

    float c = 3. * abs(pattern(nUv, uTime, q, r));
    vec3 col = vec3(c);
    col.r += dot(q, r) * 15. * uC;
    col.b += dot(q, r) * 10. * (1. - uC);

    float strength = smoothstep(1., 0.0, 2.5*distance(vUv, vec2(0.5)));
    col = mix(vec3(0.), col, strength);

    gl_FragColor = vec4(col, 1.);
}