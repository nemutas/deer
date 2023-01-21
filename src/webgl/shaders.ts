import deerVert from './shaders/deerVert.glsl'
import deerFrag from './shaders/deerFrag.glsl'
import groundVert from './shaders/groundVert.glsl'
import groundFrag from './shaders/groundFrag.glsl'

export const shaders = {
  deer: {
    vertex: deerVert,
    fragment: deerFrag,
  },
  ground: {
    vertex: groundVert,
    fragment: groundFrag,
  },
}
