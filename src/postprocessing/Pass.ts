import { OrthographicCamera, PlaneGeometry, Mesh, Material, Renderer } from 'three'

function Pass() {
  // if set to true, the pass is processed by the composer
  this.enabled = true

  // if set to true, the pass indicates to swap read and write buffer after rendering
  this.needsSwap = true

  // if set to true, the pass clears its buffer before rendering
  this.clear = false

  // if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
  this.renderToScreen = false
}

Object.assign(Pass.prototype, {
  setSize: function (/* width, height */) {},

  render: function (/* renderer, writeBuffer, readBuffer, deltaTime, maskActive */) {
    console.error('THREE.Pass: .render() must be implemented in derived pass.')
  },
})

// Helper for passes that need to fill the viewport with a single quad.
class FullScreenQuad {
  camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  geometry = new PlaneGeometry(2, 2)
  _mesh: Mesh

  constructor(material: Material) {
    this._mesh = new Mesh(this.geometry, material)
  }

  get material() {
    return this._mesh.material
  }

  set material(value) {
    this._mesh.material = value
  }

  dispose() {
    this._mesh.geometry.dispose()
  }

  render(renderer: Renderer) {
    renderer.render(this._mesh, this.camera)
  }
}

export { Pass, FullScreenQuad }
