import Node from '../core/Node'
import CameraNode from '../accessors/CameraNode'
import ModelNode from '../accessors/ModelNode'
import OperatorNode from '../math/OperatorNode'
import PositionNode from '../accessors/PositionNode'

class ModelViewProjectionNode extends Node {
  constructor(position = new PositionNode()) {
    super('vec4')

    this.position = position

    this._mvpMatrix = new OperatorNode('*', new CameraNode(CameraNode.PROJECTION), new ModelNode(ModelNode.VIEW))
  }

  generate(builder, output) {
    const type = this.getType(builder)

    const mvpSnipped = this._mvpMatrix.build(builder)
    const positionSnipped = this.position.build(builder, 'vec3')

    return builder.format(`( ${mvpSnipped} * vec4( ${positionSnipped}, 1.0 ) )`, type, output)
  }
}

export default ModelViewProjectionNode
