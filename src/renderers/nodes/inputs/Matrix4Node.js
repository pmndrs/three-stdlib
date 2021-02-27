import InputNode from '../core/InputNode'
import { Matrix4 } from 'three'

class Matrix4Node extends InputNode {
  constructor(value = new Matrix4()) {
    super('mat4')

    this.value = value

    Object.defineProperty(this, 'isMatrix4Node', { value: true })
  }
}

export default Matrix4Node
