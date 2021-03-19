import { Shader, ShaderMaterial, UniformsUtils, WebGLRenderer, WebGLRenderTarget } from 'three'
import { Pass, FullScreenQuad } from './Pass'

class ShaderPass extends Pass {
  public textureID: string
  public uniforms: Shader['uniforms']
  public material: ShaderMaterial
  public fsQuad: FullScreenQuad

  constructor(shader: ShaderMaterial | (Shader & { defines?: Object }), textureID = 'tDiffuse') {
    super()

    this.textureID = textureID

    if (shader instanceof ShaderMaterial) {
      this.uniforms = shader.uniforms

      this.material = shader
    } else {
      this.uniforms = UniformsUtils.clone(shader.uniforms)

      this.material = new ShaderMaterial({
        defines: Object.assign({}, shader.defines),
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
      })
    }

    this.fsQuad = new FullScreenQuad(this.material)
  }

  public render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget /*, deltaTime, maskActive */,
  ): void {
    if (this.uniforms[this.textureID]) {
      this.uniforms[this.textureID].value = readBuffer.texture
    }

    this.fsQuad.material = this.material

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.fsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)
      // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
      if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil)
      this.fsQuad.render(renderer)
    }
  }
}

export { ShaderPass }
