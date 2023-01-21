varying vec2 vUv;
varying vec3 vEye;
varying vec3 vNormal;
varying vec3 vPos;

void main() {
  vUv = uv;
  vEye = normalize((modelViewMatrix * vec4( position, 1.0 )).xyz);
  vNormal = normalize(normalMatrix * normal);
  vPos = position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}