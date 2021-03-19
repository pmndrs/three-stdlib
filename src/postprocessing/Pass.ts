import { OrthographicCamera, PlaneGeometry, Mesh, Material, Renderer, WebGLRenderer, WebGLRenderTarget } from 'three'

class Pass {
  // if set to true, the pass is processed by the composer
  public enabled = true

  // if set to true, the pass indicates to swap read and write buffer after rendering
  public needsSwap = true

  // if set to true, the pass clears its buffer before rendering
  public clear = false

  // if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
  public renderToScreen = false

  public setSize(
    /* eslint-disable @typescript-eslint/no-unused-vars */
    /* eslint-disable no-unused-vars */
    width: number,
    height: number,
  ): void {}

  public render(
    /* eslint-disable @typescript-eslint/no-unused-vars */
    /* eslint-disable no-unused-vars */
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget,
    deltaTime: number,
    maskActive?: unknown,
  ): void {
    console.error('THREE.Pass: .render() must be implemented in derived pass.')
  }
}

// Helper for passes that need to fill the viewport with a single quad.
class FullScreenQuad<TMaterial extends Material = Material> {
  public camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  public geometry = new PlaneGeometry(2, 2)
  private mesh: Mesh<PlaneGeometry, TMaterial>

  constructor(material: TMaterial) {
    this.mesh = new Mesh(this.geometry, material)
  }

  public get material(): TMaterial {
    return this.mesh.material
  }

  public set material(value: TMaterial) {
    this.mesh.material = value
  }

  public dispose(): void {
    this.mesh.geometry.dispose()
  }

  public render(renderer: Renderer): void {
    renderer.render(this.mesh, this.camera)
  }
}

export { Pass, FullScreenQuad }
