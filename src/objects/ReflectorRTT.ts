import { BufferGeometry } from 'three'
import { Reflector, ReflectorOptions } from '../objects/Reflector'

class ReflectorRTT extends Reflector {
  constructor(geometry?: BufferGeometry, options?: ReflectorOptions) {
    super(geometry, options)
    this.geometry.setDrawRange(0, 0)
  }
}

export { ReflectorRTT }
