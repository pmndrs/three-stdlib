import InputNode from '../core/InputNode'
import { Vector4 } from 'three'

class Vector4Node extends InputNode {
  constructor(value = new Vector4()) {
    super('vec4')

    this.value = value

    Object.defineProperty(this, 'isVector4Node', { value: true })
  }
}

export default Vector4Node
