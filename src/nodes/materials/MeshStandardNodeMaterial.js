import { MeshStandardNode } from './nodes/MeshStandardNode'
import { NodeMaterial } from './NodeMaterial'
import { NodeUtils } from '../core/NodeUtils'

function MeshStandardNodeMaterial() {
  var node = new MeshStandardNode()

  NodeMaterial.call(this, node, node)

  this.type = 'MeshStandardNodeMaterial'
}

MeshStandardNodeMaterial.prototype = Object.create(NodeMaterial.prototype)
MeshStandardNodeMaterial.prototype.constructor = MeshStandardNodeMaterial

NodeUtils.addShortcuts(MeshStandardNodeMaterial.prototype, 'properties', [
  'color',
  'roughness',
  'metalness',
  'map',
  'normalMap',
  'normalScale',
  'metalnessMap',
  'roughnessMap',
  'envMap',
])

export { MeshStandardNodeMaterial }
