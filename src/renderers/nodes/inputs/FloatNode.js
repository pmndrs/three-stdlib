import InputNode from '../core/InputNode'

class FloatNode extends InputNode {
  constructor(value = 0) {
    super('float')

    this.value = value

    Object.defineProperty(this, 'isFloatNode', { value: true })
  }
}

export default FloatNode
