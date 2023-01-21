uniform sampler2D tMatcap;
uniform sampler2D tMatcap2;
uniform float uProgress;
varying vec3 vEye;
varying vec3 vNormal;
varying vec3 vPos;

#include '../glsl/matcap.glsl'
#include '../glsl/noise.glsl'

float luma(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

float parabola(float x, float k) {
  return pow(4. * x * (1. - x), k);
}

void main() {
  vec2 mUv = matcap(vEye, vNormal);
  vec3 m1 = texture2D(tMatcap, mUv).rgb;
  vec3 m2 = texture2D(tMatcap2, mUv).rgb;

  float progress = uProgress * 2.0 - 1.0;
  progress *= 0.7;

  float thresold = smoothstep(-0.2 + progress, 0.2 + progress, vPos.z);

  float pt = parabola(thresold, 2.0);
  float n = cnoise(vPos * 30.0);
  float t = smoothstep(-0.01 + progress, 0.01 + progress, vPos.z + n * pt);

  vec3 color = mix(m2, m1, t);

  gl_FragColor = vec4(color, 1.0);
}