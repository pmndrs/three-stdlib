import { LineSegments2 } from '../lines/LineSegments2'
import { LineGeometry } from '../lines/LineGeometry'
import { LineMaterial } from '../lines/LineMaterial'

class Line2 extends LineSegments2 {
  constructor(geometry = new LineGeometry(), material = new LineMaterial({ color: Math.random() * 0xffffff })) {
    super(geometry, material)

    this.isLine2 = true

    this.type = 'Line2'
  }
}

export { Line2 }
