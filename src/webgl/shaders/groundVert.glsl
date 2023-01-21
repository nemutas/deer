uniform float uTime;
uniform mat4 textureMatrix;
varying vec4 vUv;
varying vec3 vNormal;
varying float vPosZ;

#include <common>
#include <logdepthbuf_pars_vertex>

#include '../glsl/fbm.glsl'

vec3 displace(vec3 v) {
  vec3 result = v;
  float dist = distance(v, vec3(0));
  result.z = sin(dist * 10.0 - uTime) * 0.01;
  result.z += fbm(result + dist - uTime * 0.1) * 0.2;
  return result;
} 

#include '../glsl/recalcNormal.glsl'

void main() {
  vUv = textureMatrix * vec4( position, 1.0 );

  vec3 pos = displace(position);
  vNormal = normalize(normalMatrix * recalcNormal(pos));
  vPosZ = pos.z;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

  #include <logdepthbuf_vertex>
}