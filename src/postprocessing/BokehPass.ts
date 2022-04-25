/**
 * Depth-of-field post-process with bokeh shader
 */

import { Pass, FullScreenQuad } from './Pass'
import {
  Color,
  MeshDepthMaterial,
  NearestFilter,
  NoBlending,
  PerspectiveCamera,
  RGBADepthPacking,
  Scene,
  ShaderMaterial,
  UniformsUtils,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three'
import { BokehShader } from '../shaders/BokehShader'

type BokehPassParams = {
  focus?: number
  aspect?: number
  aperture?: number
  maxblur?: number
  width?: number
  height?: number
}

class BokehPass extends Pass {
  public scene: Scene
  public camera: PerspectiveCamera
  public renderTargetDepth: WebGLRenderTarget
  public materialDepth: MeshDepthMaterial
  public materialBokeh: ShaderMaterial
  public fsQuad: FullScreenQuad

  private _oldClearColor: Color

  public uniforms

  constructor(scene: Scene, camera: PerspectiveCamera, params: BokehPassParams) {
    super()
    this.scene = scene
    this.camera = camera
    const focus = params.focus !== undefined ? params.focus : 1.0
    const aspect = params.aspect !== undefined ? params.aspect : camera.aspect
    const aperture = params.aperture !== undefined ? params.aperture : 0.025
    const maxblur = params.maxblur !== undefined ? params.maxblur : 1.0 // render targets

    const width = params.width || window.innerWidth || 1
    const height = params.height || window.innerHeight || 1
    this.renderTargetDepth = new WebGLRenderTarget(width, height, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
    })
    this.renderTargetDepth.texture.name = 'BokehPass.depth' // depth material

    this.materialDepth = new MeshDepthMaterial()
    this.materialDepth.depthPacking = RGBADepthPacking
    this.materialDepth.blending = NoBlending // bokeh material

    if (BokehShader === undefined) {
      console.error('BokehPass relies on BokehShader')
    }

    const bokehShader = BokehShader
    const bokehUniforms = UniformsUtils.clone(bokehShader.uniforms)
    bokehUniforms['tDepth'].value = this.renderTargetDepth.texture
    bokehUniforms['focus'].value = focus
    bokehUniforms['aspect'].value = aspect
    bokehUniforms['aperture'].value = aperture
    bokehUniforms['maxblur'].value = maxblur
    bokehUniforms['nearClip'].value = camera.near
    bokehUniforms['farClip'].value = camera.far
    this.materialBokeh = new ShaderMaterial({
      defines: Object.assign({}, bokehShader.defines),
      uniforms: bokehUniforms,
      vertexShader: bokehShader.vertexShader,
      fragmentShader: bokehShader.fragmentShader,
    })
    this.uniforms = bokehUniforms
    this.needsSwap = false
    this.fsQuad = new FullScreenQuad(this.materialBokeh)
    this._oldClearColor = new Color()
  }

  public render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget,
    /*, deltaTime, maskActive */
  ): void {
    // Render depth into texture
    this.scene.overrideMaterial = this.materialDepth
    renderer.getClearColor(this._oldClearColor)
    const oldClearAlpha = renderer.getClearAlpha()
    const oldAutoClear = renderer.autoClear
    renderer.autoClear = false
    renderer.setClearColor(0xffffff)
    renderer.setClearAlpha(1.0)
    renderer.setRenderTarget(this.renderTargetDepth)
    renderer.clear()
    renderer.render(this.scene, this.camera) // Render bokeh composite

    this.uniforms['tColor'].value = readBuffer.texture
    this.uniforms['nearClip'].value = this.camera.near
    this.uniforms['farClip'].value = this.camera.far

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.fsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)
      renderer.clear()
      this.fsQuad.render(renderer)
    }

    this.scene.overrideMaterial = null
    renderer.setClearColor(this._oldClearColor)
    renderer.setClearAlpha(oldClearAlpha)
    renderer.autoClear = oldAutoClear
  }
}

export { BokehPass }
