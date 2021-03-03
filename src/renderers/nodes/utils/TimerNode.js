import FloatNode from '../inputs/FloatNode'
import { NodeUpdateType } from '../core/constants'

class TimerNode extends FloatNode {
  constructor() {
    super()

    this.updateType = NodeUpdateType.Frame
  }

  update(frame) {
    this.value = frame.time
  }
}

export default TimerNode
