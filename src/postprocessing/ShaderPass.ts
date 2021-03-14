import { Shader, ShaderMaterial, UniformsUtils, WebGLRenderer, WebGLRenderTarget } from 'three'
import { Pass, FullScreenQuad } from './Pass'

class ShaderPass extends Pass {
  textureID: string
  uniforms: Shader['uniforms']
  material: ShaderMaterial
  fsQuad: FullScreenQuad

  constructor(shader: ShaderMaterial | (Shader & { defines?: Object }), textureID?: string) {
    super()

    this.textureID = textureID !== undefined ? textureID : 'tDiffuse'

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

  render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget /*, deltaTime, maskActive */,
  ) {
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
