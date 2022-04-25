import { Pass, FullScreenQuad } from './Pass'
import { AdditiveBlending, ShaderMaterial, UniformsUtils, Vector2, WebGLRenderer, WebGLRenderTarget } from 'three'
import { ConvolutionShader } from '../shaders/ConvolutionShader'

class BloomPass extends Pass {
  public renderTargetX: WebGLRenderTarget
  public renderTargetY: WebGLRenderTarget
  public materialCombine: ShaderMaterial
  public materialConvolution: ShaderMaterial
  public fsQuad: FullScreenQuad
  public combineUniforms
  public convolutionUniforms

  public blurX = new Vector2(0.001953125, 0.0)
  public blurY = new Vector2(0.0, 0.001953125)

  constructor(strength = 1, kernelSize = 25, sigma = 4, resolution = 256) {
    super() // render targets

    this.renderTargetX = new WebGLRenderTarget(resolution, resolution)
    this.renderTargetX.texture.name = 'BloomPass.x'
    this.renderTargetY = new WebGLRenderTarget(resolution, resolution)
    this.renderTargetY.texture.name = 'BloomPass.y' // combine material

    this.combineUniforms = UniformsUtils.clone(CombineShader.uniforms)
    this.combineUniforms['strength'].value = strength
    this.materialCombine = new ShaderMaterial({
      uniforms: this.combineUniforms,
      vertexShader: CombineShader.vertexShader,
      fragmentShader: CombineShader.fragmentShader,
      blending: AdditiveBlending,
      transparent: true,
    }) // convolution material

    if (ConvolutionShader === undefined) console.error('BloomPass relies on ConvolutionShader')
    const convolutionShader = ConvolutionShader
    this.convolutionUniforms = UniformsUtils.clone(convolutionShader.uniforms)
    this.convolutionUniforms['uImageIncrement'].value = this.blurX
    this.convolutionUniforms['cKernel'].value = ConvolutionShader.buildKernel(sigma)
    this.materialConvolution = new ShaderMaterial({
      uniforms: this.convolutionUniforms,
      vertexShader: convolutionShader.vertexShader,
      fragmentShader: convolutionShader.fragmentShader,
      defines: {
        KERNEL_SIZE_FLOAT: kernelSize.toFixed(1),
        KERNEL_SIZE_INT: kernelSize.toFixed(0),
      },
    })
    this.needsSwap = false
    this.fsQuad = new FullScreenQuad(this.materialConvolution)
  }

  public render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget,
    deltaTime: number,
    maskActive: boolean,
  ): void {
    if (maskActive) renderer.state.buffers.stencil.setTest(false) // Render quad with blured scene into texture (convolution pass 1)

    this.fsQuad.material = this.materialConvolution
    this.convolutionUniforms['tDiffuse'].value = readBuffer.texture
    this.convolutionUniforms['uImageIncrement'].value = this.blurX
    renderer.setRenderTarget(this.renderTargetX)
    renderer.clear()
    this.fsQuad.render(renderer) // Render quad with blured scene into texture (convolution pass 2)

    this.convolutionUniforms['tDiffuse'].value = this.renderTargetX.texture
    this.convolutionUniforms['uImageIncrement'].value = this.blurY
    renderer.setRenderTarget(this.renderTargetY)
    renderer.clear()
    this.fsQuad.render(renderer) // Render original scene with superimposed blur to texture

    this.fsQuad.material = this.materialCombine
    this.combineUniforms['tDiffuse'].value = this.renderTargetY.texture
    if (maskActive) renderer.state.buffers.stencil.setTest(true)
    renderer.setRenderTarget(readBuffer)
    if (this.clear) renderer.clear()
    this.fsQuad.render(renderer)
  }
}

const CombineShader = {
  uniforms: {
    tDiffuse: {
      value: null,
    },
    strength: {
      value: 1.0,
    },
  },
  vertexShader:
    /* glsl */
    `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`,
  fragmentShader:
    /* glsl */
    `
  uniform float strength;
  uniform sampler2D tDiffuse;
  varying vec2 vUv;
  void main() {
    vec4 texel = texture2D( tDiffuse, vUv );
    gl_FragColor = strength * texel;
  }`,
}

export { BloomPass }
