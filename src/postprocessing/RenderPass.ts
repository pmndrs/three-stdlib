import { Camera, Color, Material, Scene, WebGLRenderTarget, WebGLRenderer } from 'three'
import { Pass } from './Pass'

class RenderPass extends Pass {
  public scene: Scene
  public camera: Camera
  public overrideMaterial: Material | undefined
  public clearColor: Color | undefined
  public clearAlpha: number
  public clearDepth = false
  private _oldClearColor = new Color()

  constructor(scene: Scene, camera: Camera, overrideMaterial?: Material, clearColor?: Color, clearAlpha = 0) {
    super()

    this.scene = scene
    this.camera = camera

    this.overrideMaterial = overrideMaterial

    this.clearColor = clearColor
    this.clearAlpha = clearAlpha

    this.clear = true
    this.needsSwap = false
  }

  public render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget /*, deltaTime, maskActive */,
  ): void {
    let oldAutoClear = renderer.autoClear
    renderer.autoClear = false

    let oldClearAlpha
    let oldOverrideMaterial: Material | null = null

    if (this.overrideMaterial !== undefined) {
      oldOverrideMaterial = this.scene.overrideMaterial

      this.scene.overrideMaterial = this.overrideMaterial
    }

    if (this.clearColor) {
      renderer.getClearColor(this._oldClearColor)
      oldClearAlpha = renderer.getClearAlpha()

      renderer.setClearColor(this.clearColor, this.clearAlpha)
    }

    if (this.clearDepth) {
      renderer.clearDepth()
    }

    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer)

    // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
    if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil)
    renderer.render(this.scene, this.camera)

    if (this.clearColor) {
      renderer.setClearColor(this._oldClearColor, oldClearAlpha)
    }

    if (this.overrideMaterial !== undefined) {
      this.scene.overrideMaterial = oldOverrideMaterial
    }

    renderer.autoClear = oldAutoClear
  }
}

export { RenderPass }
