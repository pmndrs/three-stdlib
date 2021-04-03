import {
  LinearFilter,
  MeshBasicMaterial,
  NearestFilter,
  RGBAFormat,
  WebGLRenderer,
  ShaderMaterial,
  UniformsUtils,
  WebGLRenderTarget,
} from 'three'
import { Pass, FullScreenQuad } from './Pass'
import { AfterimageShader } from '../shaders/AfterimageShader'

class AfterimagePass extends Pass {
  public shader
  public uniforms
  public textureComp: WebGLRenderTarget
  public textureOld: WebGLRenderTarget
  public shaderMaterial: ShaderMaterial
  public compFsQuad: FullScreenQuad<ShaderMaterial>
  public copyFsQuad: FullScreenQuad<MeshBasicMaterial>

  constructor(damp = 0.96, shader = AfterimageShader) {
    super()

    this.shader = shader
    this.uniforms = UniformsUtils.clone(shader.uniforms)
    this.uniforms['damp'].value = damp

    this.textureComp = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: LinearFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
    })

    this.textureOld = new WebGLRenderTarget(window.innerWidth, window.innerHeight, {
      minFilter: LinearFilter,
      magFilter: NearestFilter,
      format: RGBAFormat,
    })

    this.shaderMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.shader.vertexShader,
      fragmentShader: this.shader.fragmentShader,
    })

    this.compFsQuad = new FullScreenQuad(this.shaderMaterial)

    let material = new MeshBasicMaterial()
    this.copyFsQuad = new FullScreenQuad(material)
  }

  public render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget): void {
    this.uniforms['tOld'].value = this.textureOld.texture
    this.uniforms['tNew'].value = readBuffer.texture

    renderer.setRenderTarget(this.textureComp)
    this.compFsQuad.render(renderer)

    this.copyFsQuad.material.map = this.textureComp.texture

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.copyFsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)

      if (this.clear) renderer.clear()

      this.copyFsQuad.render(renderer)
    }

    // Swap buffers.
    let temp = this.textureOld
    this.textureOld = this.textureComp
    this.textureComp = temp
    // Now textureOld contains the latest image, ready for the next frame.
  }

  public setSize(width: number, height: number): void {
    this.textureComp.setSize(width, height)
    this.textureOld.setSize(width, height)
  }
}

export { AfterimagePass }
