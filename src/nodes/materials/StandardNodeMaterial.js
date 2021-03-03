import { StandardNode } from './nodes/StandardNode'
import { NodeMaterial } from './NodeMaterial'
import { NodeUtils } from '../core/NodeUtils'

function StandardNodeMaterial() {
  var node = new StandardNode()

  NodeMaterial.call(this, node, node)

  this.type = 'StandardNodeMaterial'
}

StandardNodeMaterial.prototype = Object.create(NodeMaterial.prototype)
StandardNodeMaterial.prototype.constructor = StandardNodeMaterial

NodeUtils.addShortcuts(StandardNodeMaterial.prototype, 'fragment', [
  'color',
  'alpha',
  'roughness',
  'metalness',
  'reflectivity',
  'clearcoat',
  'clearcoatRoughness',
  'clearcoatNormal',
  'normal',
  'emissive',
  'ambient',
  'light',
  'shadow',
  'ao',
  'environment',
  'mask',
  'position',
  'sheen',
])

export { StandardNodeMaterial }
