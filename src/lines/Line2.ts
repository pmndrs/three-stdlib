import { LineSegments2 } from './LineSegments2'
import { LineGeometry } from './LineGeometry'
import { LineMaterial } from './LineMaterial'

class Line2 extends LineSegments2 {
  type = 'Line2'
  isLine2 = true

  constructor(geometry = new LineGeometry(), material = new LineMaterial({ color: Math.random() * 0xffffff })) {
    super(geometry, material)
  }
}

export { Line2 }
