import * as THREE from 'three'
import { resolvePath } from '../scripts/utils'
import { gl } from './core/WebGL'
import { Assets, loadAssets } from './utils/assetLoader'
import { controls } from './utils/OrbitControls'
import { Reflector } from 'three/examples/jsm/objects/Reflector'
import { shaders } from './shaders'
import gsap from 'gsap'

export class TCanvas {
  private groundMirror!: Reflector
  private matcaps: THREE.Texture[] = []
  private isSwapping = false
  private delayCounter = 1

  private assets: Assets = {
    model: { path: resolvePath('resources/deer.glb') },
    matcap1: { path: resolvePath('resources/matcap1.jpg') },
    matcap2: { path: resolvePath('resources/matcap2.jpg') },
    matcap3: { path: resolvePath('resources/matcap3.jpg') },
    matcap4: { path: resolvePath('resources/matcap4.jpg') },
    matcap5: { path: resolvePath('resources/matcap5.jpg') },
    matcap6: { path: resolvePath('resources/matcap6.jpg') },
    matcap7: { path: resolvePath('resources/matcap7.jpg') },
    matcap8: { path: resolvePath('resources/matcap8.jpg') },
    matcap9: { path: resolvePath('resources/matcap9.jpg') },
  }

  constructor(private parentNode: ParentNode) {
    loadAssets(this.assets).then(() => {
      this.init()
      this.createObjects()
      gl.requestAnimationFrame(this.anime)
    })
  }

  private init() {
    gl.setup(this.parentNode.querySelector('.three-container')!)
    gl.scene.background = new THREE.Color('#000')
    gl.camera.position.set(1.79, 1.81, 1.96)

    controls.primitive.target.set(0, 0.3, 0)
    controls.primitive.maxPolarAngle = Math.PI / 2.5
    controls.primitive.enablePan = false

    Object.keys(this.assets).forEach((key) => {
      if (key.includes('matcap')) {
        this.matcaps.push(this.assets[key].data as THREE.Texture)
      }
    })
  }

  private createObjects() {
    const model = (this.assets.model.data as any).scene.children[0] as THREE.Mesh
    model.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -0.05, 0))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        tMatcap: { value: this.matcaps[0] },
        tMatcap2: { value: null },
        uProgress: { value: 0 },
      },
      vertexShader: shaders.deer.vertex,
      fragmentShader: shaders.deer.fragment,
    })
    model.material = material
    model.name = 'deer'
    gl.scene.add(model)

    // ------------------------
    const groundGeometry = new THREE.PlaneGeometry(8, 8, 300, 300)
    this.groundMirror = new Reflector(groundGeometry, {
      clipBias: 0.003,
      textureWidth: gl.size.width * window.devicePixelRatio,
      textureHeight: gl.size.height * window.devicePixelRatio,
      color: '#111',
    })
    this.groundMirror.rotateX(-Math.PI / 2.0)
    gl.scene.add(this.groundMirror)

    const groundMaterial = this.groundMirror.material as THREE.ShaderMaterial
    groundMaterial.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, { uTime: { value: 0 } })
      shader.vertexShader = shaders.ground.vertex
      shader.fragmentShader = shaders.ground.fragment
      this.groundMirror.userData.shader = shader
    }
  }

  // ----------------------------------
  // animation
  private swap() {
    this.isSwapping = true

    const uniforms = gl.getMesh<THREE.ShaderMaterial>('deer').material.uniforms
    const currentMatcap = uniforms.tMatcap.value
    const otherMatcaps = this.matcaps.filter((m) => m !== currentMatcap)
    const r = ~~(Math.random() * otherMatcaps.length)
    const nextMatcap = otherMatcaps[r]

    const tl = gsap.timeline({
      onComplete: () => {
        this.isSwapping = false
        this.delayCounter = 1
      },
    })
    tl.set(uniforms.tMatcap2, { value: nextMatcap })
    tl.to(uniforms.uProgress, { value: 1, duration: 4, ease: 'power2.out' })
    tl.call(() => {
      uniforms.tMatcap.value = uniforms.tMatcap2.value
      uniforms.uProgress.value = 0
    })
  }

  private anime = () => {
    const dt = gl.time.getDelta()
    if (this.groundMirror.userData.shader) {
      this.groundMirror.userData.shader.uniforms.uTime.value += dt
    }

    if (!this.isSwapping && this.delayCounter % 200 === 0) {
      this.swap()
    }
    this.delayCounter++

    controls.update()
    gl.render()
  }

  // ----------------------------------
  // dispose
  dispose() {
    gl.dispose()
  }
}
