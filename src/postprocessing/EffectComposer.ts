import { Clock, LinearFilter, RGBAFormat, NoBlending, Vector2, WebGLRenderer, WebGLRenderTarget } from 'three'
import { CopyShader } from '../shaders/CopyShader'
import { ShaderPass } from './ShaderPass'
import { MaskPass, ClearMaskPass } from './MaskPass'
import { Pass } from './Pass'

class EffectComposer<TRenderTarget extends WebGLRenderTarget = WebGLRenderTarget> {
  public renderer: WebGLRenderer
  private _pixelRatio: number
  private _width: number
  private _height: number
  public renderTarget1: WebGLRenderTarget
  public renderTarget2: WebGLRenderTarget
  public writeBuffer: WebGLRenderTarget
  public readBuffer: WebGLRenderTarget
  public renderToScreen: boolean
  public passes: Pass[] = []
  public copyPass: Pass
  public clock: Clock

  constructor(renderer: WebGLRenderer, renderTarget?: TRenderTarget) {
    this.renderer = renderer

    if (renderTarget === undefined) {
      const parameters = {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
      }

      const size = renderer.getSize(new Vector2())
      this._pixelRatio = renderer.getPixelRatio()
      this._width = size.width
      this._height = size.height

      renderTarget = new WebGLRenderTarget(
        this._width * this._pixelRatio,
        this._height * this._pixelRatio,
        parameters,
      ) as TRenderTarget
      renderTarget.texture.name = 'EffectComposer.rt1'
    } else {
      this._pixelRatio = 1
      this._width = renderTarget.width
      this._height = renderTarget.height
    }

    this.renderTarget1 = renderTarget
    this.renderTarget2 = renderTarget.clone()
    this.renderTarget2.texture.name = 'EffectComposer.rt2'

    this.writeBuffer = this.renderTarget1
    this.readBuffer = this.renderTarget2

    this.renderToScreen = true

    // dependencies

    if (CopyShader === undefined) {
      console.error('THREE.EffectComposer relies on CopyShader')
    }

    if (ShaderPass === undefined) {
      console.error('THREE.EffectComposer relies on ShaderPass')
    }

    this.copyPass = new ShaderPass(CopyShader)
    // @ts-ignore
    this.copyPass.material.blending = NoBlending

    this.clock = new Clock()
  }

  public swapBuffers(): void {
    const tmp = this.readBuffer
    this.readBuffer = this.writeBuffer
    this.writeBuffer = tmp
  }

  public addPass(pass: Pass): void {
    this.passes.push(pass)
    pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio)
  }

  public insertPass(pass: Pass, index: number): void {
    this.passes.splice(index, 0, pass)
    pass.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio)
  }

  public removePass(pass: Pass): void {
    const index = this.passes.indexOf(pass)

    if (index !== -1) {
      this.passes.splice(index, 1)
    }
  }

  public isLastEnabledPass(passIndex: number): boolean {
    for (let i = passIndex + 1; i < this.passes.length; i++) {
      if (this.passes[i].enabled) {
        return false
      }
    }

    return true
  }

  public render(deltaTime?: number): void {
    // deltaTime value is in seconds

    if (deltaTime === undefined) {
      deltaTime = this.clock.getDelta()
    }

    const currentRenderTarget = this.renderer.getRenderTarget()

    let maskActive = false

    const il = this.passes.length

    for (let i = 0; i < il; i++) {
      const pass = this.passes[i]

      if (pass.enabled === false) continue

      pass.renderToScreen = this.renderToScreen && this.isLastEnabledPass(i)
      pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive)

      if (pass.needsSwap) {
        if (maskActive) {
          const context = this.renderer.getContext()
          const stencil = this.renderer.state.buffers.stencil

          //context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
          stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff)

          this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime)

          //context.stencilFunc( context.EQUAL, 1, 0xffffffff );
          stencil.setFunc(context.EQUAL, 1, 0xffffffff)
        }

        this.swapBuffers()
      }

      if (MaskPass !== undefined) {
        if (pass instanceof MaskPass) {
          maskActive = true
        } else if (pass instanceof ClearMaskPass) {
          maskActive = false
        }
      }
    }

    this.renderer.setRenderTarget(currentRenderTarget)
  }

  public reset(renderTarget: WebGLRenderTarget): void {
    if (renderTarget === undefined) {
      const size = this.renderer.getSize(new Vector2())
      this._pixelRatio = this.renderer.getPixelRatio()
      this._width = size.width
      this._height = size.height

      renderTarget = this.renderTarget1.clone()
      renderTarget.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio)
    }

    this.renderTarget1.dispose()
    this.renderTarget2.dispose()
    this.renderTarget1 = renderTarget
    this.renderTarget2 = renderTarget.clone()

    this.writeBuffer = this.renderTarget1
    this.readBuffer = this.renderTarget2
  }

  public setSize(width: number, height: number): void {
    this._width = width
    this._height = height

    const effectiveWidth = this._width * this._pixelRatio
    const effectiveHeight = this._height * this._pixelRatio

    this.renderTarget1.setSize(effectiveWidth, effectiveHeight)
    this.renderTarget2.setSize(effectiveWidth, effectiveHeight)

    for (let i = 0; i < this.passes.length; i++) {
      this.passes[i].setSize(effectiveWidth, effectiveHeight)
    }
  }

  public setPixelRatio(pixelRatio: number): void {
    this._pixelRatio = pixelRatio

    this.setSize(this._width, this._height)
  }
}

export { EffectComposer }
