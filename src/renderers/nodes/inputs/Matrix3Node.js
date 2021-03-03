import InputNode from '../core/InputNode'
import { Matrix3 } from 'three'

class Matrix3Node extends InputNode {
  constructor(value = new Matrix3()) {
    super('mat3')

    this.value = value

    Object.defineProperty(this, 'isMatrix3Node', { value: true })
  }
}

export default Matrix3Node
