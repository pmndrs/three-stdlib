import { BasicNode } from './nodes/BasicNode'
import { NodeMaterial } from './NodeMaterial'
import { NodeUtils } from '../core/NodeUtils'

function BasicNodeMaterial() {
  var node = new BasicNode()

  NodeMaterial.call(this, node, node)

  this.type = 'BasicNodeMaterial'
}

BasicNodeMaterial.prototype = Object.create(NodeMaterial.prototype)
BasicNodeMaterial.prototype.constructor = BasicNodeMaterial

NodeUtils.addShortcuts(BasicNodeMaterial.prototype, 'fragment', ['color', 'alpha', 'mask', 'position'])

export { BasicNodeMaterial }
