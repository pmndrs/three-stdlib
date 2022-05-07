import { Pass, FullScreenQuad } from './Pass'
import { ShaderMaterial, UniformsUtils, WebGLRenderer, WebGLRenderTarget } from 'three'
import { HalftoneShader } from '../shaders/HalftoneShader'

type HalftonePassParams = {
  shape?: number
  radius?: number
  rotateR?: number
  rotateB?: number
  rotateG?: number
  scatter?: number
  blending?: number
  blendingMode?: number
  greyscale?: number
  disable?: number
}

/**
 * RGB Halftone pass for three.js effects composer. Requires HalftoneShader.
 */

class HalftonePass extends Pass {
  public material: ShaderMaterial
  public fsQuad: FullScreenQuad

  public uniforms: any

  constructor(width: number, height: number, params: HalftonePassParams) {
    super()

    if (HalftoneShader === undefined) {
      console.error('THREE.HalftonePass requires HalftoneShader')
    }

    this.uniforms = UniformsUtils.clone(HalftoneShader.uniforms)
    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      fragmentShader: HalftoneShader.fragmentShader,
      vertexShader: HalftoneShader.vertexShader,
    })

    // set params
    this.uniforms.width.value = width
    this.uniforms.height.value = height

    for (const key in params) {
      if (params.hasOwnProperty(key) && this.uniforms.hasOwnProperty(key)) {
        this.uniforms[key].value = params[key as keyof HalftonePassParams]
      }
    }

    this.fsQuad = new FullScreenQuad(this.material)
  }

  public render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget,
    /*, deltaTime, maskActive */
  ): void {
    this.material.uniforms['tDiffuse'].value = readBuffer.texture

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.fsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)
      if (this.clear) renderer.clear()
      this.fsQuad.render(renderer)
    }
  }

  public setSize(width: number, height: number): void {
    this.uniforms.width.value = width
    this.uniforms.height.value = height
  }
}

export { HalftonePass }
