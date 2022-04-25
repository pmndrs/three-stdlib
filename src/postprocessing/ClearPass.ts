import { Pass } from './Pass'
import { Color, ColorRepresentation, WebGLRenderer, WebGLRenderTarget } from 'three'

class ClearPass extends Pass {
  public clearColor: ColorRepresentation
  public clearAlpha: number

  private _oldClearColor: Color

  constructor(clearColor?: ColorRepresentation, clearAlpha?: number) {
    super()
    this.needsSwap = false
    this.clearColor = clearColor !== undefined ? clearColor : 0x000000
    this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0
    this._oldClearColor = new Color()
  }

  public render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget,
    /*, deltaTime, maskActive */
  ): void {
    let oldClearAlpha

    if (this.clearColor) {
      renderer.getClearColor(this._oldClearColor)
      oldClearAlpha = renderer.getClearAlpha()
      renderer.setClearColor(this.clearColor, this.clearAlpha)
    }

    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer)
    renderer.clear()

    if (this.clearColor) {
      renderer.setClearColor(this._oldClearColor, oldClearAlpha)
    }
  }
}

export { ClearPass }
