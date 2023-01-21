uniform vec3 color;
uniform sampler2D tDiffuse;
varying vec4 vUv;
varying vec3 vNormal;
varying float vPosZ;

#include <logdepthbuf_pars_fragment>

float blendOverlay( float base, float blend ) {
  return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );
}

vec3 blendOverlay( vec3 base, vec3 blend ) {
  return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );
}

void main() {
  #include <logdepthbuf_fragment>

  vec4 distortion = vec4(vNormal, 0.0) * 0.03;
  vec4 base = texture2DProj( tDiffuse, vUv - distortion );

  vec3 finalColor = blendOverlay( base.rgb, color );
  // float light = smoothstep(-0.05, 0.1, vPosZ);
  // finalColor += light;

  gl_FragColor = vec4( finalColor, 1.0 );

  #include <tonemapping_fragment>
  #include <encodings_fragment>
}