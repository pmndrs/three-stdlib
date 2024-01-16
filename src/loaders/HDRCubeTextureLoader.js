import { CubeTexture, DataTexture, FileLoader, FloatType, HalfFloatType, LinearFilter, Loader } from 'three'
import { RGBELoader } from '../loaders/RGBELoader.js'

class HDRCubeTextureLoader extends Loader {
  constructor(manager) {
    super(manager)

    this.hdrLoader = new RGBELoader()
    this.type = HalfFloatType
  }

  load(urls, onLoad, onProgress, onError) {
    if (typeof urls === 'string') {
      urls = [urls]
    } else if (!Array.isArray(urls)) {
      console.warn('THREE.HDRCubeTextureLoader signature has changed. Use .setDataType() instead.')

      this.setDataType(urls)

      urls = onLoad
      onLoad = onProgress
      onProgress = onError
      onError = arguments[4]
    }

    const texture = new CubeTexture()

    texture.type = this.type

    switch (texture.type) {
      case FloatType:
      case HalfFloatType:
        if ('colorSpace' in texture) texture.colorSpace = 'srgb-linear'
        else texture.encoding = 3000 // LinearEncoding
        texture.minFilter = LinearFilter
        texture.magFilter = LinearFilter
        texture.generateMipmaps = false
        break
    }

    const scope = this

    let loaded = 0

    function loadHDRData(i, onLoad, onProgress, onError) {
      new FileLoader(scope.manager)
        .setPath(scope.path)
        .setResponseType('arraybuffer')
        .setWithCredentials(scope.withCredentials)
        .load(
          urls[i],
          function (buffer) {
            loaded++

            const texData = scope.hdrLoader.parse(buffer)

            if (!texData) return

            if (texData.data !== undefined) {
              const dataTexture = new DataTexture(texData.data, texData.width, texData.height)

              dataTexture.type = texture.type
              dataTexture.colorSpace = texture.SRGBColorSpace;
              dataTexture.format = texture.format
              dataTexture.minFilter = texture.minFilter
              dataTexture.magFilter = texture.magFilter
              dataTexture.generateMipmaps = texture.generateMipmaps

              texture.images[i] = dataTexture
            }

            if (loaded === 6) {
              texture.needsUpdate = true
              if (onLoad) onLoad(texture)
            }
          },
          onProgress,
          onError,
        )
    }

    for (let i = 0; i < urls.length; i++) {
      loadHDRData(i, onLoad, onProgress, onError)
    }

    return texture
  }

  setDataType(value) {
    this.type = value
    this.hdrLoader.setDataType(value)

    return this
  }
}

export { HDRCubeTextureLoader }
