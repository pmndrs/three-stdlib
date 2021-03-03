import WebGPUNodeBuilder from './WebGPUNodeBuilder'
import NodeFrame from '../../nodes/core/NodeFrame'

class WebGPUNodes {
  constructor(renderer) {
    this.renderer = renderer

    this.nodeFrame = new NodeFrame()

    this.builders = new WeakMap()
  }

  get(material) {
    let nodeBuilder = this.builders.get(material)

    if (nodeBuilder === undefined) {
      nodeBuilder = new WebGPUNodeBuilder(material, this.renderer).build()

      this.builders.set(material, nodeBuilder)
    }

    return nodeBuilder
  }

  remove(material) {
    this.builders.delete(material)
  }

  updateFrame() {
    this.nodeFrame.update()
  }

  update(object, camera) {
    const material = object.material

    const nodeBuilder = this.get(material)
    const nodeFrame = this.nodeFrame

    nodeFrame.material = material
    nodeFrame.camera = camera
    nodeFrame.object = object

    for (let node of nodeBuilder.updateNodes) {
      nodeFrame.updateNode(node)
    }
  }

  dispose() {
    this.builders = new WeakMap()
  }
}

export default WebGPUNodes
