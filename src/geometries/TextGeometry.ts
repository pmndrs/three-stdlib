import { ExtrudeGeometry } from 'three'

import type { Font } from '../loaders/FontLoader'

export type TextGeometryParameters = {
  bevelEnabled?: boolean
  bevelOffset?: number
  bevelSize?: number
  bevelThickness?: number
  curveSegments?: number
  font: Font
  height?: number
  size?: number
  lineHeight?: number
  letterSpacing?: number
}

export class TextGeometry extends ExtrudeGeometry {
  constructor(text: string, parameters: TextGeometryParameters = {} as TextGeometryParameters) {
    const {
      bevelEnabled = false,
      bevelSize = 8,
      bevelThickness = 10,
      font,
      height = 50,
      size = 100,
      lineHeight = 1,
      letterSpacing = 0,
      ...rest
    } = parameters

    const shapes = font.generateShapes(text, size, { lineHeight, letterSpacing })
    super(shapes, { ...rest, bevelEnabled, bevelSize, bevelThickness, depth: height })
    this.type = 'TextGeometry'
  }
}

export { TextGeometry as TextBufferGeometry }
