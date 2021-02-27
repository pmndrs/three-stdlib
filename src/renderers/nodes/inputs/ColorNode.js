import InputNode from '../core/InputNode'

class ColorNode extends InputNode {
  constructor(value) {
    super('color')

    this.value = value

    Object.defineProperty(this, 'isColorNode', { value: true })
  }
}

export default ColorNode
