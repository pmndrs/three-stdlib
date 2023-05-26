import init from './scene'

if (typeof self !== 'undefined') {
  self.onmessage = function (message) {
    const data = message.data
    init(data.drawingSurface, data.width, data.height, data.pixelRatio, data.path)
  }
}
