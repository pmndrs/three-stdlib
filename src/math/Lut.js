import { Color, MathUtils } from 'three'

class Lut {
  constructor(colormap, count = 32) {
    this.isLut = true

    this.lut = []
    this.map = []
    this.n = 0
    this.minV = 0
    this.maxV = 1

    this.setColorMap(colormap, count)
  }

  set(value) {
    if (value.isLut === true) {
      this.copy(value)
    }

    return this
  }

  setMin(min) {
    this.minV = min

    return this
  }

  setMax(max) {
    this.maxV = max

    return this
  }

  setColorMap(colormap, count = 32) {
    this.map = ColorMapKeywords[colormap] || ColorMapKeywords.rainbow
    this.n = count

    const step = 1.0 / this.n
    const minColor = new Color()
    const maxColor = new Color()

    this.lut.length = 0

    // sample at 0

    this.lut.push(new Color(this.map[0][1]))

    // sample at 1/n, ..., (n-1)/n

    for (let i = 1; i < count; i++) {
      const alpha = i * step

      for (let j = 0; j < this.map.length - 1; j++) {
        if (alpha > this.map[j][0] && alpha <= this.map[j + 1][0]) {
          const min = this.map[j][0]
          const max = this.map[j + 1][0]

          minColor.setHex(this.map[j][1], 'linear-srgb')
          maxColor.setHex(this.map[j + 1][1], 'linear-srgb')

          const color = new Color().lerpColors(minColor, maxColor, (alpha - min) / (max - min))

          this.lut.push(color)
        }
      }
    }

    // sample at 1

    this.lut.push(new Color(this.map[this.map.length - 1][1]))

    return this
  }

  copy(lut) {
    this.lut = lut.lut
    this.map = lut.map
    this.n = lut.n
    this.minV = lut.minV
    this.maxV = lut.maxV

    return this
  }

  getColor(alpha) {
    alpha = MathUtils.clamp(alpha, this.minV, this.maxV)

    alpha = (alpha - this.minV) / (this.maxV - this.minV)

    const colorPosition = Math.round(alpha * this.n)

    return this.lut[colorPosition]
  }

  addColorMap(name, arrayOfColors) {
    ColorMapKeywords[name] = arrayOfColors

    return this
  }

  createCanvas() {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = this.n

    this.updateCanvas(canvas)

    return canvas
  }

  updateCanvas(canvas) {
    const ctx = canvas.getContext('2d', { alpha: false })

    const imageData = ctx.getImageData(0, 0, 1, this.n)

    const data = imageData.data

    let k = 0

    const step = 1.0 / this.n

    const minColor = new Color()
    const maxColor = new Color()
    const finalColor = new Color()

    for (let i = 1; i >= 0; i -= step) {
      for (let j = this.map.length - 1; j >= 0; j--) {
        if (i < this.map[j][0] && i >= this.map[j - 1][0]) {
          const min = this.map[j - 1][0]
          const max = this.map[j][0]

          minColor.setHex(this.map[j - 1][1], 'linear-srgb')
          maxColor.setHex(this.map[j][1], 'linear-srgb')

          finalColor.lerpColors(minColor, maxColor, (i - min) / (max - min))

          data[k * 4] = Math.round(finalColor.r * 255)
          data[k * 4 + 1] = Math.round(finalColor.g * 255)
          data[k * 4 + 2] = Math.round(finalColor.b * 255)
          data[k * 4 + 3] = 255

          k += 1
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)

    return canvas
  }
}

const ColorMapKeywords = {
  rainbow: [
    [0.0, 0x0000ff],
    [0.2, 0x00ffff],
    [0.5, 0x00ff00],
    [0.8, 0xffff00],
    [1.0, 0xff0000],
  ],
  cooltowarm: [
    [0.0, 0x3c4ec2],
    [0.2, 0x9bbcff],
    [0.5, 0xdcdcdc],
    [0.8, 0xf6a385],
    [1.0, 0xb40426],
  ],
  blackbody: [
    [0.0, 0x000000],
    [0.2, 0x780000],
    [0.5, 0xe63200],
    [0.8, 0xffff00],
    [1.0, 0xffffff],
  ],
  grayscale: [
    [0.0, 0x000000],
    [0.2, 0x404040],
    [0.5, 0x7f7f80],
    [0.8, 0xbfbfbf],
    [1.0, 0xffffff],
  ],
}

export { Lut, ColorMapKeywords }
