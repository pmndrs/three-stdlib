import { SpriteNode } from './nodes/SpriteNode'
import { NodeMaterial } from './NodeMaterial'
import { NodeUtils } from '../core/NodeUtils'

function SpriteNodeMaterial() {
  var node = new SpriteNode()

  NodeMaterial.call(this, node, node)

  this.type = 'SpriteNodeMaterial'
}

SpriteNodeMaterial.prototype = Object.create(NodeMaterial.prototype)
SpriteNodeMaterial.prototype.constructor = SpriteNodeMaterial

NodeUtils.addShortcuts(SpriteNodeMaterial.prototype, 'fragment', ['color', 'alpha', 'mask', 'position', 'spherical'])

export { SpriteNodeMaterial }
