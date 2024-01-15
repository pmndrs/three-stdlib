import { Pass, FullScreenQuad } from './Pass'
import { IUniform, ShaderMaterial, UniformsUtils, WebGLRenderer, WebGLRenderTarget } from 'three'
import { FilmShader } from '../shaders/FilmShader'

class FilmPass extends Pass {
  public material: ShaderMaterial
  public fsQuad: FullScreenQuad

  public uniforms: Record<keyof typeof FilmShader['uniforms'], IUniform<any>>

  constructor(noiseIntensity?: number, scanlinesIntensity?: number, scanlinesCount?: number, grayscale?: boolean) {
    super()

    if (FilmShader === undefined) console.error('THREE.FilmPass relies on FilmShader')

    const shader = FilmShader

    this.uniforms = UniformsUtils.clone(shader.uniforms)

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
    })

    if (grayscale !== undefined) this.uniforms.grayscale.value = grayscale
    if (noiseIntensity !== undefined) this.uniforms.nIntensity.value = noiseIntensity
    if (scanlinesIntensity !== undefined) this.uniforms.sIntensity.value = scanlinesIntensity
    if (scanlinesCount !== undefined) this.uniforms.sCount.value = scanlinesCount

    this.fsQuad = new FullScreenQuad(this.material)
  }

  public render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget,
    deltaTime: number,
  ): void {
    this.uniforms['tDiffuse'].value = readBuffer.texture
    this.uniforms['time'].value += deltaTime

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

export { FilmPass }
