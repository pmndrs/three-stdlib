import { FileLoader, Loader, ShapePath } from 'three'

import type { LoadingManager, Shape } from 'three'

export class FontLoader extends Loader {
  constructor(manager?: LoadingManager) {
    super(manager)
  }

  public load(
    url: string,
    onLoad?: (responseFont: Font) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void,
  ): void {
    const loader = new FileLoader(this.manager)

    loader.setPath(this.path)
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)

    loader.load(
      url,
      (response) => {
        if (typeof response !== 'string') throw new Error('unsupported data type')

        const json = JSON.parse(response)

        const font = this.parse(json)

        if (onLoad) onLoad(font)
      },
      onProgress,
      onError,
    )
  }

  public parse(json: FontData): Font {
    return new Font(json)
  }
}

type Glyph = {
  _cachedOutline: string[]
  ha: number
  o: string
}

type FontData = {
  boundingBox: { yMax: number; yMin: number }
  familyName: string
  glyphs: { [k: string]: Glyph }
  resolution: number
  underlineThickness: number
}

export class Font {
  public data: FontData
  public static isFont: true
  public static type: 'Font'

  constructor(data: FontData) {
    this.data = data
  }

  public generateShapes(text: string, size = 100): Shape[] {
    const shapes: Shape[] = []
    const paths = createPaths(text, size, this.data)

    for (let p = 0, pl = paths.length; p < pl; p++) {
      Array.prototype.push.apply(shapes, paths[p].toShapes(false))
    }

    return shapes
  }
}

function createPaths(text: string, size: number, data: FontData): ShapePath[] {
  const chars = Array.from(text)
  const scale = size / data.resolution
  const line_height = (data.boundingBox.yMax - data.boundingBox.yMin + data.underlineThickness) * scale

  const paths: ShapePath[] = []

  let offsetX = 0,
    offsetY = 0

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]

    if (char === '\n') {
      offsetX = 0
      offsetY -= line_height
    } else {
      const ret = createPath(char, scale, offsetX, offsetY, data)
      if (ret) {
        offsetX += ret.offsetX
        paths.push(ret.path)
      }
    }
  }

  return paths
}

function createPath(
  char: string,
  scale: number,
  offsetX: number,
  offsetY: number,
  data: FontData,
): { offsetX: number; path: ShapePath } | undefined {
  const glyph = data.glyphs[char] || data.glyphs['?']

  if (!glyph) {
    console.error('THREE.Font: character "' + char + '" does not exists in font family ' + data.familyName + '.')
    return
  }

  const path = new ShapePath()

  let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2

  if (glyph.o) {
    const outline = glyph._cachedOutline || (glyph._cachedOutline = glyph.o.split(' '))

    for (let i = 0, l = outline.length; i < l; ) {
      const action = outline[i++]

      switch (action) {
        case 'm': // moveTo
          x = parseInt(outline[i++]) * scale + offsetX
          y = parseInt(outline[i++]) * scale + offsetY

          path.moveTo(x, y)

          break

        case 'l': // lineTo
          x = parseInt(outline[i++]) * scale + offsetX
          y = parseInt(outline[i++]) * scale + offsetY

          path.lineTo(x, y)

          break

        case 'q': // quadraticCurveTo
          cpx = parseInt(outline[i++]) * scale + offsetX
          cpy = parseInt(outline[i++]) * scale + offsetY
          cpx1 = parseInt(outline[i++]) * scale + offsetX
          cpy1 = parseInt(outline[i++]) * scale + offsetY

          path.quadraticCurveTo(cpx1, cpy1, cpx, cpy)

          break

        case 'b': // bezierCurveTo
          cpx = parseInt(outline[i++]) * scale + offsetX
          cpy = parseInt(outline[i++]) * scale + offsetY
          cpx1 = parseInt(outline[i++]) * scale + offsetX
          cpy1 = parseInt(outline[i++]) * scale + offsetY
          cpx2 = parseInt(outline[i++]) * scale + offsetX
          cpy2 = parseInt(outline[i++]) * scale + offsetY

          path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, cpx, cpy)

          break
      }
    }
  }

  return { offsetX: glyph.ha * scale, path }
}
