import { Pass, FullScreenQuad } from './Pass'
import { IUniform, ShaderMaterial, UniformsUtils, Vector2, WebGLRenderer, WebGLRenderTarget } from 'three'
import { DotScreenShader } from '../shaders/DotScreenShader'

class DotScreenPass extends Pass {
  public material: ShaderMaterial
  public fsQuad: FullScreenQuad

  public uniforms: Record<keyof typeof DotScreenShader['uniforms'], IUniform<any>>

  constructor(center?: Vector2, angle?: number, scale?: number) {
    super()
    if (DotScreenShader === undefined) console.error('THREE.DotScreenPass relies on THREE.DotScreenShader')
    const shader = DotScreenShader
    this.uniforms = UniformsUtils.clone(shader.uniforms)
    if (center !== undefined) this.uniforms['center'].value.copy(center)
    if (angle !== undefined) this.uniforms['angle'].value = angle
    if (scale !== undefined) this.uniforms['scale'].value = scale
    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
    })
    this.fsQuad = new FullScreenQuad(this.material)
  }

  public render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget,
    /*, deltaTime, maskActive */
  ): void {
    this.uniforms['tDiffuse'].value = readBuffer.texture
    this.uniforms['tSize'].value.set(readBuffer.width, readBuffer.height)

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.fsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)
      if (this.clear) renderer.clear()
      this.fsQuad.render(renderer)
    }
  }
}

export { DotScreenPass }
