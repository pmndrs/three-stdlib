import { Pass, FullScreenQuad } from './Pass'
import {
  DataTexture,
  FloatType,
  MathUtils,
  RedFormat,
  LuminanceFormat,
  ShaderMaterial,
  UniformsUtils,
  WebGLRenderTarget,
  WebGLRenderer,
} from 'three'
import { DigitalGlitch } from '../shaders/DigitalGlitch'

class GlitchPass extends Pass {
  public material: ShaderMaterial
  public fsQuad: FullScreenQuad
  public goWild: boolean
  public curF: number
  public randX!: number

  public uniforms

  constructor(dt_size = 64) {
    super()
    this.uniforms = UniformsUtils.clone(DigitalGlitch.uniforms)
    this.uniforms['tDisp'].value = this.generateHeightmap(dt_size)

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: DigitalGlitch.vertexShader,
      fragmentShader: DigitalGlitch.fragmentShader,
    })

    this.fsQuad = new FullScreenQuad(this.material)
    this.goWild = false
    this.curF = 0
    this.generateTrigger()
  }

  public render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget,
    /*, deltaTime, maskActive */
  ): void {
    if (renderer.capabilities.isWebGL2 === false) this.uniforms['tDisp'].value.format = LuminanceFormat

    this.uniforms['tDiffuse'].value = readBuffer.texture
    this.uniforms['seed'].value = Math.random() //default seeding
    this.uniforms['byp'].value = 0

    if (this.curF % this.randX == 0 || this.goWild == true) {
      this.uniforms['amount'].value = Math.random() / 30
      this.uniforms['angle'].value = MathUtils.randFloat(-Math.PI, Math.PI)
      this.uniforms['seed_x'].value = MathUtils.randFloat(-1, 1)
      this.uniforms['seed_y'].value = MathUtils.randFloat(-1, 1)
      this.uniforms['distortion_x'].value = MathUtils.randFloat(0, 1)
      this.uniforms['distortion_y'].value = MathUtils.randFloat(0, 1)
      this.curF = 0
      this.generateTrigger()
    } else if (this.curF % this.randX < this.randX / 5) {
      this.uniforms['amount'].value = Math.random() / 90
      this.uniforms['angle'].value = MathUtils.randFloat(-Math.PI, Math.PI)
      this.uniforms['distortion_x'].value = MathUtils.randFloat(0, 1)
      this.uniforms['distortion_y'].value = MathUtils.randFloat(0, 1)
      this.uniforms['seed_x'].value = MathUtils.randFloat(-0.3, 0.3)
      this.uniforms['seed_y'].value = MathUtils.randFloat(-0.3, 0.3)
    } else if (this.goWild == false) {
      this.uniforms['byp'].value = 1
    }

    this.curF++

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.fsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)
      if (this.clear) renderer.clear()
      this.fsQuad.render(renderer)
    }
  }

  generateTrigger(): void {
    this.randX = MathUtils.randInt(120, 240)
  }

  generateHeightmap(dt_size: number): DataTexture {
    const data_arr = new Float32Array(dt_size * dt_size)
    const length = dt_size * dt_size

    for (let i = 0; i < length; i++) {
      const val = MathUtils.randFloat(0, 1)
      data_arr[i] = val
    }

    const texture = new DataTexture(data_arr, dt_size, dt_size, RedFormat, FloatType)
    texture.needsUpdate = true
    return texture
  }
}

export { GlitchPass }
