import { LineSegments2 } from './LineSegments2'
import { LineGeometry } from './LineGeometry'
import { LineMaterial } from './LineMaterial'

class Line2 extends LineSegments2 {
  public type = 'Line2'
  public readonly isLine2 = true

  constructor(geometry = new LineGeometry(), material = new LineMaterial({ color: Math.random() * 0xffffff })) {
    super(geometry, material)
  }
}

export { Line2 }
