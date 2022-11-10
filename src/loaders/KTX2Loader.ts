/**
 * Loader for KTX 2.0 GPU Texture containers.
 *
 * KTX 2.0 is a container format for various GPU texture formats. The loader
 * supports Basis Universal GPU textures, which can be quickly transcoded to
 * a wide variety of GPU texture compression formats, as well as some
 * uncompressed DataTexture and Data3DTexture formats.
 *
 * References:
 * - KTX: http://github.khronos.org/KTX-Specification/
 * - DFD: https://www.khronos.org/registry/DataFormat/specs/1.3/dataformat.1.3.html#basicdescriptor
 */

import {
  CompressedTexture,
  CompressedArrayTexture,
  Data3DTexture,
  DataTexture,
  FileLoader,
  FloatType,
  HalfFloatType,
  LinearEncoding,
  LinearFilter,
  LinearMipmapLinearFilter,
  Loader,
  RedFormat,
  RGB_ETC1_Format,
  RGB_ETC2_Format,
  RGB_PVRTC_4BPPV1_Format,
  RGB_S3TC_DXT1_Format,
  RGBA_ASTC_4x4_Format,
  RGBA_BPTC_Format,
  RGBA_ETC2_EAC_Format,
  RGBA_PVRTC_4BPPV1_Format,
  RGBA_S3TC_DXT5_Format,
  RGBAFormat,
  RGFormat,
  sRGBEncoding,
  UnsignedByteType,
  LoadingManager,
  WebGLRenderer,
  PixelFormat,
  CompressedPixelFormat,
} from 'three'
import { WorkerPool } from '../utils/WorkerPool'
import {
  read,
  KHR_DF_FLAG_ALPHA_PREMULTIPLIED,
  KHR_DF_TRANSFER_SRGB,
  KHR_SUPERCOMPRESSION_NONE,
  KHR_SUPERCOMPRESSION_ZSTD,
  VK_FORMAT_UNDEFINED,
  VK_FORMAT_R16_SFLOAT,
  VK_FORMAT_R16G16_SFLOAT,
  VK_FORMAT_R16G16B16A16_SFLOAT,
  VK_FORMAT_R32_SFLOAT,
  VK_FORMAT_R32G32_SFLOAT,
  VK_FORMAT_R32G32B32A32_SFLOAT,
  VK_FORMAT_R8_SRGB,
  VK_FORMAT_R8_UNORM,
  VK_FORMAT_R8G8_SRGB,
  VK_FORMAT_R8G8_UNORM,
  VK_FORMAT_R8G8B8A8_SRGB,
  VK_FORMAT_R8G8B8A8_UNORM,
  KTX2Container,
} from 'ktx-parse'
import { ZSTDDecoder } from 'zstddec'

const _taskCache = new WeakMap()

let _activeLoaders = 0

let _zstd: Promise<ZSTDDecoder>

type WorkerConfig = {
  astcSupported: boolean
  etc1Supported: boolean
  etc2Supported: boolean
  dxtSupported: boolean
  bptcSupported: boolean
  pvrtcSupported: boolean
}

type TextureTypes = CompressedTexture | CompressedArrayTexture | DataTexture | Data3DTexture

type BasisFormat = {
  ETC1S: number
  UASTC_4x4: number
}

type BasisModule = {
  wasmBinary: ArrayBuffer
  onRuntimeInitialized: (value: unknown) => void
  initializeBasis?: () => void
  KTX2File?: new (buffer: Uint8Array) => KTX2File
}

type KTX2File = {
  close: () => void
  delete: () => void
  isValid: () => boolean
  isUASTC: () => boolean
  getWidth: () => number
  getHeight: () => number
  getLayers: () => number
  getLevels: () => number
  getHasAlpha: () => boolean
  getDFDTransferFunc: () => number
  getDFDFlags: () => number
  startTranscoding: () => boolean
  getImageLevelInfo: (level_index: number, layer_index: number, face_index: number) => LevelInfo
  getImageTranscodedSizeInBytes: (
    level_index: number,
    layer_index: number,
    face_index: number,
    format: number,
  ) => number
  transcodeImage: (
    dst: Uint8Array,
    image_index: number,
    level_index: number,
    face_index: number,
    format: number,
    get_alpha_for_opaque_formats: number,
    channel0: number,
    channel1: number,
  ) => boolean
}

type LevelInfo = {
  origWidth: number
  origHeight: number
}

type TranscoderFormat = {
  ETC1: number
  ETC2: number
  BC1: number
  BC3: number
  BC4: number
  BC5: number
  BC7_M6_OPAQUE_ONLY: number
  BC7_M5: number
  PVRTC1_4_RGB: number
  PVRTC1_4_RGBA: number
  ASTC_4x4: number
  ATC_RGB: number
  ATC_RGBA_INTERPOLATED_ALPHA: number
  RGBA32: number
  RGB565: number
  BGR565: number
  RGBA4444: number
}

type EngineFormat = {
  RGBAFormat: PixelFormat
  RGBA_ASTC_4x4_Format: CompressedPixelFormat
  RGBA_BPTC_Format: CompressedPixelFormat
  RGBA_ETC2_EAC_Format: CompressedPixelFormat
  RGBA_PVRTC_4BPPV1_Format: CompressedPixelFormat
  RGBA_S3TC_DXT5_Format: CompressedPixelFormat
  RGB_ETC1_Format: CompressedPixelFormat
  RGB_ETC2_Format: CompressedPixelFormat
  RGB_PVRTC_4BPPV1_Format: CompressedPixelFormat
  RGB_S3TC_DXT1_Format: CompressedPixelFormat
}

declare const MSC_TRANSCODER: any
declare let _BasisFormat: BasisFormat
declare let _TranscoderFormat: TranscoderFormat
declare let _EngineFormat: EngineFormat
declare const BASIS: (basisModule: BasisModule) => void

type TranscodeMessage = {
  type: 'transcode' | 'error'
  id: undefined
  error?: Error
} & Transcode

type Transcode = {
  width: number
  height: number
  hasAlpha: boolean
  mipmaps: Mipmap[]
  format: number
  dfdTransferFn: number
  dfdFlags: number
}

type Mipmap = {
  data: Uint8Array
  width: number
  height: number
}

type Formats = {
  transcoderFormat: number
  engineFormat: number
}

class KTX2Loader extends Loader {
  static BasisFormat = {
    ETC1S: 0,
    UASTC_4x4: 1,
  }

  static TranscoderFormat = {
    ETC1: 0,
    ETC2: 1,
    BC1: 2,
    BC3: 3,
    BC4: 4,
    BC5: 5,
    BC7_M6_OPAQUE_ONLY: 6,
    BC7_M5: 7,
    PVRTC1_4_RGB: 8,
    PVRTC1_4_RGBA: 9,
    ASTC_4x4: 10,
    ATC_RGB: 11,
    ATC_RGBA_INTERPOLATED_ALPHA: 12,
    RGBA32: 13,
    RGB565: 14,
    BGR565: 15,
    RGBA4444: 16,
  }

  static EngineFormat = {
    RGBAFormat: RGBAFormat,
    RGBA_ASTC_4x4_Format: RGBA_ASTC_4x4_Format,
    RGBA_BPTC_Format: RGBA_BPTC_Format,
    RGBA_ETC2_EAC_Format: RGBA_ETC2_EAC_Format,
    RGBA_PVRTC_4BPPV1_Format: RGBA_PVRTC_4BPPV1_Format,
    RGBA_S3TC_DXT5_Format: RGBA_S3TC_DXT5_Format,
    RGB_ETC1_Format: RGB_ETC1_Format,
    RGB_ETC2_Format: RGB_ETC2_Format,
    RGB_PVRTC_4BPPV1_Format: RGB_PVRTC_4BPPV1_Format,
    RGB_S3TC_DXT1_Format: RGB_S3TC_DXT1_Format,
  }

  transcoderPath
  transcoderBinary: ArrayBuffer | null
  transcoderPending: Promise<void | [string, ArrayBuffer]> | null
  workerPool
  workerSourceURL
  workerConfig: WorkerConfig | null

  constructor(manager?: LoadingManager) {
    super(manager)

    this.transcoderPath = ''
    this.transcoderBinary = null
    this.transcoderPending = null

    this.workerPool = new WorkerPool()
    this.workerSourceURL = ''
    this.workerConfig = null

    if (typeof MSC_TRANSCODER !== 'undefined') {
      console.warn(
        'THREE.KTX2Loader: Please update to latest "basis_transcoder".' +
          ' "msc_basis_transcoder" is no longer supported in three.js r125+.',
      )
    }
  }

  setTranscoderPath(path: string): KTX2Loader {
    this.transcoderPath = path

    return this
  }

  setWorkerLimit(num: number): KTX2Loader {
    this.workerPool.setWorkerLimit(num)

    return this
  }

  detectSupport(renderer: WebGLRenderer): KTX2Loader {
    this.workerConfig = {
      astcSupported: renderer.extensions.has('WEBGL_compressed_texture_astc'),
      etc1Supported: renderer.extensions.has('WEBGL_compressed_texture_etc1'),
      etc2Supported: renderer.extensions.has('WEBGL_compressed_texture_etc'),
      dxtSupported: renderer.extensions.has('WEBGL_compressed_texture_s3tc'),
      bptcSupported: renderer.extensions.has('EXT_texture_compression_bptc'),
      pvrtcSupported:
        renderer.extensions.has('WEBGL_compressed_texture_pvrtc') ||
        renderer.extensions.has('WEBKIT_WEBGL_compressed_texture_pvrtc'),
    }

    if (renderer.capabilities.isWebGL2) {
      // https://github.com/mrdoob/three.js/pull/22928
      this.workerConfig.etc1Supported = false
    }

    return this
  }

  init(): Promise<void | [string, ArrayBuffer]> {
    if (!this.transcoderPending) {
      // Load transcoder wrapper.
      const jsLoader = new FileLoader(this.manager)
      jsLoader.setPath(this.transcoderPath)
      jsLoader.setWithCredentials(this.withCredentials)
      const jsContent = jsLoader.loadAsync('basis_transcoder.js')

      // Load transcoder WASM binary.
      const binaryLoader = new FileLoader(this.manager)
      binaryLoader.setPath(this.transcoderPath)
      binaryLoader.setResponseType('arraybuffer')
      binaryLoader.setWithCredentials(this.withCredentials)
      const binaryContent = binaryLoader.loadAsync('basis_transcoder.wasm')

      this.transcoderPending = Promise.all([jsContent, binaryContent]).then(([jsContent, binaryContent]) => {
        const fn = KTX2Loader.BasisWorker.toString()

        const body = [
          '/* constants */',
          'let _EngineFormat = ' + JSON.stringify(KTX2Loader.EngineFormat),
          'let _TranscoderFormat = ' + JSON.stringify(KTX2Loader.TranscoderFormat),
          'let _BasisFormat = ' + JSON.stringify(KTX2Loader.BasisFormat),
          '/* basis_transcoder.js */',
          jsContent,
          '/* worker */',
          fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}')),
        ].join('\n')

        this.workerSourceURL = URL.createObjectURL(new Blob([body]))
        this.transcoderBinary = binaryContent as ArrayBuffer

        this.workerPool.setWorkerCreator(() => {
          const worker = new Worker(this.workerSourceURL)
          const transcoderBinary = this.transcoderBinary!.slice(0)

          worker.postMessage({ type: 'init', config: this.workerConfig, transcoderBinary }, [transcoderBinary])

          return worker
        })
      })

      if (_activeLoaders > 0) {
        // Each instance loads a transcoder and allocates workers, increasing network and memory cost.

        console.warn(
          'THREE.KTX2Loader: Multiple active KTX2 loaders may cause performance issues.' +
            ' Use a single KTX2Loader instance, or call .dispose() on old instances.',
        )
      }

      _activeLoaders++
    }

    return this.transcoderPending!
  }

  load(
    url: string,
    onLoad: (texture: TextureTypes) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void,
  ): void {
    if (this.workerConfig === null) {
      throw new Error('THREE.KTX2Loader: Missing initialization with `.detectSupport( renderer )`.')
    }

    const loader = new FileLoader(this.manager)

    loader.setResponseType('arraybuffer')
    loader.setWithCredentials(this.withCredentials)

    loader.load(
      url,
      (buffer) => {
        // Check for an existing task using this buffer. A transferred buffer cannot be transferred
        // again from this thread.
        if (_taskCache.has(buffer as ArrayBuffer)) {
          const cachedTask = _taskCache.get(buffer as ArrayBuffer)

          return cachedTask.promise.then(onLoad).catch(onError)
        }

        this._createTexture(buffer as ArrayBuffer)
          .then((texture: TextureTypes) => (onLoad ? onLoad(texture) : null))
          .catch(onError)
      },
      onProgress,
      onError,
    )
  }

  private _createTextureFrom(
    transcodeResult: TranscodeMessage,
    container: KTX2Container,
  ): TextureTypes | Promise<Error> {
    const { mipmaps, width, height, format, type, error, dfdTransferFn, dfdFlags } = transcodeResult

    if (type === 'error') return Promise.reject(error)

    const texture =
      container.layerCount > 1
        ? new CompressedArrayTexture(
            (mipmaps as unknown) as ImageData[],
            width,
            height,
            container.layerCount,
            format,
            UnsignedByteType,
          )
        : new CompressedTexture((mipmaps as unknown) as ImageData[], width, height, format, UnsignedByteType)

    texture.minFilter = mipmaps.length === 1 ? LinearFilter : LinearMipmapLinearFilter
    texture.magFilter = LinearFilter
    texture.generateMipmaps = false

    texture.needsUpdate = true
    texture.encoding = dfdTransferFn === KHR_DF_TRANSFER_SRGB ? sRGBEncoding : LinearEncoding
    texture.premultiplyAlpha = !!(dfdFlags & KHR_DF_FLAG_ALPHA_PREMULTIPLIED)

    return texture
  }

  async _createTexture(buffer: ArrayBuffer, config = {}): Promise<TextureTypes> {
    const container = read(new Uint8Array(buffer))

    if (container.vkFormat !== VK_FORMAT_UNDEFINED) {
      return createDataTexture(container)
    }

    //
    const taskConfig = config
    const texturePending = this.init()
      .then(() => {
        return this.workerPool.postMessage({ type: 'transcode', buffer, taskConfig: taskConfig }, [buffer])
      })
      .then((e): any => this._createTextureFrom(e.data, container))

    // Cache the task result.
    _taskCache.set(buffer, { promise: texturePending })

    return texturePending
  }

  dispose(): KTX2Loader {
    this.workerPool.dispose()
    if (this.workerSourceURL) URL.revokeObjectURL(this.workerSourceURL)

    _activeLoaders--

    return this
  }

  /* WEB WORKER */

  static BasisWorker = function (): void {
    let config: WorkerConfig
    let transcoderPending: Promise<void>
    let BasisModule: BasisModule

    const EngineFormat = _EngineFormat // eslint-disable-line no-undef
    const TranscoderFormat = _TranscoderFormat // eslint-disable-line no-undef
    const BasisFormat = _BasisFormat // eslint-disable-line no-undef

    self.addEventListener('message', function (e) {
      const message = e.data

      switch (message.type) {
        case 'init':
          config = message.config
          init(message.transcoderBinary)
          break

        case 'transcode':
          transcoderPending.then(() => {
            try {
              const { width, height, hasAlpha, mipmaps, format, dfdTransferFn, dfdFlags } = transcode(message.buffer)

              const buffers = []

              for (let i = 0; i < mipmaps.length; ++i) {
                buffers.push(mipmaps[i].data.buffer)
              }

              self.postMessage(
                {
                  type: 'transcode',
                  id: message.id,
                  width,
                  height,
                  hasAlpha,
                  mipmaps,
                  format,
                  dfdTransferFn,
                  dfdFlags,
                },
                buffers,
              )
            } catch (error) {
              console.error(error)

              self.postMessage({ type: 'error', id: message.id, error: (error as Error).message })
            }
          })
          break
      }
    })

    function init(wasmBinary: ArrayBuffer): void {
      transcoderPending = new Promise((resolve) => {
        BasisModule = { wasmBinary, onRuntimeInitialized: resolve }
        BASIS(BasisModule) // eslint-disable-line no-undef
      }).then(() => {
        BasisModule.initializeBasis!()

        if (BasisModule.KTX2File === undefined) {
          console.warn('THREE.KTX2Loader: Please update Basis Universal transcoder.')
        }
      })
    }

    function transcode(buffer: ArrayBuffer): Transcode {
      const ktx2File = new BasisModule.KTX2File!(new Uint8Array(buffer))

      function cleanup(): void {
        ktx2File.close()
        ktx2File.delete()
      }

      if (!ktx2File.isValid()) {
        cleanup()
        throw new Error('THREE.KTX2Loader:	Invalid or unsupported .ktx2 file')
      }

      const basisFormat = ktx2File.isUASTC() ? BasisFormat.UASTC_4x4 : BasisFormat.ETC1S
      const width = ktx2File.getWidth()
      const height = ktx2File.getHeight()
      const layers = ktx2File.getLayers() || 1
      const levels = ktx2File.getLevels()
      const hasAlpha = ktx2File.getHasAlpha()
      const dfdTransferFn = ktx2File.getDFDTransferFunc()

      const dfdFlags = ktx2File.getDFDFlags()

      const { transcoderFormat, engineFormat } = getTranscoderFormat(basisFormat, width, height, hasAlpha)

      if (!width || !height || !levels) {
        cleanup()
        throw new Error('THREE.KTX2Loader:	Invalid texture')
      }

      if (!ktx2File.startTranscoding()) {
        cleanup()
        throw new Error('THREE.KTX2Loader: .startTranscoding failed')
      }

      const mipmaps: Mipmap[] = []

      for (let mip = 0; mip < levels; mip++) {
        const layerMips = []

        let mipWidth: number, mipHeight: number

        for (let layer = 0; layer < layers; layer++) {
          const levelInfo = ktx2File.getImageLevelInfo(mip, layer, 0)
          mipWidth = levelInfo.origWidth
          mipHeight = levelInfo.origHeight
          const dst = new Uint8Array(ktx2File.getImageTranscodedSizeInBytes(mip, layer, 0, transcoderFormat))

          const status = ktx2File.transcodeImage(dst, mip, layer, 0, transcoderFormat, 0, -1, -1)

          if (!status) {
            cleanup()
            throw new Error('THREE.KTX2Loader: .transcodeImage failed.')
          }

          layerMips.push(dst)
        }

        mipmaps.push({ data: concat(layerMips), width: mipWidth!, height: mipHeight! })
      }

      cleanup()

      return { width, height, hasAlpha, mipmaps, format: engineFormat, dfdTransferFn, dfdFlags }
    }

    //

    // Optimal choice of a transcoder target format depends on the Basis format (ETC1S or UASTC),
    // device capabilities, and texture dimensions. The list below ranks the formats separately
    // for ETC1S and UASTC.
    //
    // In some cases, transcoding UASTC to RGBA32 might be preferred for higher quality (at
    // significant memory cost) compared to ETC1/2, BC1/3, and PVRTC. The transcoder currently
    // chooses RGBA32 only as a last resort and does not expose that option to the caller.
    const FORMAT_OPTIONS = [
      {
        if: 'astcSupported',
        basisFormat: [BasisFormat.UASTC_4x4],
        transcoderFormat: [TranscoderFormat.ASTC_4x4, TranscoderFormat.ASTC_4x4],
        engineFormat: [EngineFormat.RGBA_ASTC_4x4_Format, EngineFormat.RGBA_ASTC_4x4_Format],
        priorityETC1S: Infinity,
        priorityUASTC: 1,
        needsPowerOfTwo: false,
      },
      {
        if: 'bptcSupported',
        basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
        transcoderFormat: [TranscoderFormat.BC7_M5, TranscoderFormat.BC7_M5],
        engineFormat: [EngineFormat.RGBA_BPTC_Format, EngineFormat.RGBA_BPTC_Format],
        priorityETC1S: 3,
        priorityUASTC: 2,
        needsPowerOfTwo: false,
      },
      {
        if: 'dxtSupported',
        basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
        transcoderFormat: [TranscoderFormat.BC1, TranscoderFormat.BC3],
        engineFormat: [EngineFormat.RGB_S3TC_DXT1_Format, EngineFormat.RGBA_S3TC_DXT5_Format],
        priorityETC1S: 4,
        priorityUASTC: 5,
        needsPowerOfTwo: false,
      },
      {
        if: 'etc2Supported',
        basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
        transcoderFormat: [TranscoderFormat.ETC1, TranscoderFormat.ETC2],
        engineFormat: [EngineFormat.RGB_ETC2_Format, EngineFormat.RGBA_ETC2_EAC_Format],
        priorityETC1S: 1,
        priorityUASTC: 3,
        needsPowerOfTwo: false,
      },
      {
        if: 'etc1Supported',
        basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
        transcoderFormat: [TranscoderFormat.ETC1],
        engineFormat: [EngineFormat.RGB_ETC1_Format],
        priorityETC1S: 2,
        priorityUASTC: 4,
        needsPowerOfTwo: false,
      },
      {
        if: 'pvrtcSupported',
        basisFormat: [BasisFormat.ETC1S, BasisFormat.UASTC_4x4],
        transcoderFormat: [TranscoderFormat.PVRTC1_4_RGB, TranscoderFormat.PVRTC1_4_RGBA],
        engineFormat: [EngineFormat.RGB_PVRTC_4BPPV1_Format, EngineFormat.RGBA_PVRTC_4BPPV1_Format],
        priorityETC1S: 5,
        priorityUASTC: 6,
        needsPowerOfTwo: true,
      },
    ]

    const ETC1S_OPTIONS = FORMAT_OPTIONS.sort(function (a, b) {
      return a.priorityETC1S - b.priorityETC1S
    })
    const UASTC_OPTIONS = FORMAT_OPTIONS.sort(function (a, b) {
      return a.priorityUASTC - b.priorityUASTC
    })

    function getTranscoderFormat(basisFormat: number, width: number, height: number, hasAlpha: boolean): Formats {
      let transcoderFormat: number
      let engineFormat: number

      const options = basisFormat === BasisFormat.ETC1S ? ETC1S_OPTIONS : UASTC_OPTIONS

      for (let i = 0; i < options.length; i++) {
        const opt = options[i]

        if (!config[opt.if as keyof WorkerConfig]) continue
        if (!opt.basisFormat.includes(basisFormat)) continue
        if (hasAlpha && opt.transcoderFormat.length < 2) continue
        if (opt.needsPowerOfTwo && !(isPowerOfTwo(width) && isPowerOfTwo(height))) continue

        transcoderFormat = opt.transcoderFormat[hasAlpha ? 1 : 0]
        engineFormat = opt.engineFormat[hasAlpha ? 1 : 0]

        return { transcoderFormat, engineFormat }
      }

      console.warn('THREE.KTX2Loader: No suitable compressed texture format found. Decoding to RGBA32.')

      transcoderFormat = TranscoderFormat.RGBA32
      engineFormat = EngineFormat.RGBAFormat

      return { transcoderFormat, engineFormat }
    }

    function isPowerOfTwo(value: number): boolean {
      if (value <= 2) return true

      return (value & (value - 1)) === 0 && value !== 0
    }

    /** Concatenates N byte arrays. */
    function concat(arrays: Uint8Array[]): Uint8Array {
      let totalByteLength = 0

      // For...of has been rewriten to regular for loop
      // A, what seems to be babel, error kept throwing the following
      // ReferenceError: _createForOfIteratorHelper is not defined
      for (let i = 0; i < arrays.length; i++) {
        totalByteLength += arrays[i].byteLength
      }

      const result = new Uint8Array(totalByteLength)

      let byteOffset = 0

      for (let i = 0; i < arrays.length; i++) {
        result.set(arrays[i], byteOffset)

        byteOffset += arrays[i].byteLength
      }

      return result
    }
  }
}

//
// DataTexture and Data3DTexture parsing.

const FORMAT_MAP = {
  [VK_FORMAT_R32G32B32A32_SFLOAT]: RGBAFormat,
  [VK_FORMAT_R16G16B16A16_SFLOAT]: RGBAFormat,
  [VK_FORMAT_R8G8B8A8_UNORM]: RGBAFormat,
  [VK_FORMAT_R8G8B8A8_SRGB]: RGBAFormat,

  [VK_FORMAT_R32G32_SFLOAT]: RGFormat,
  [VK_FORMAT_R16G16_SFLOAT]: RGFormat,
  [VK_FORMAT_R8G8_UNORM]: RGFormat,
  [VK_FORMAT_R8G8_SRGB]: RGFormat,

  [VK_FORMAT_R32_SFLOAT]: RedFormat,
  [VK_FORMAT_R16_SFLOAT]: RedFormat,
  [VK_FORMAT_R8_SRGB]: RedFormat,
  [VK_FORMAT_R8_UNORM]: RedFormat,
}

const TYPE_MAP = {
  [VK_FORMAT_R32G32B32A32_SFLOAT]: FloatType,
  [VK_FORMAT_R16G16B16A16_SFLOAT]: HalfFloatType,
  [VK_FORMAT_R8G8B8A8_UNORM]: UnsignedByteType,
  [VK_FORMAT_R8G8B8A8_SRGB]: UnsignedByteType,

  [VK_FORMAT_R32G32_SFLOAT]: FloatType,
  [VK_FORMAT_R16G16_SFLOAT]: HalfFloatType,
  [VK_FORMAT_R8G8_UNORM]: UnsignedByteType,
  [VK_FORMAT_R8G8_SRGB]: UnsignedByteType,

  [VK_FORMAT_R32_SFLOAT]: FloatType,
  [VK_FORMAT_R16_SFLOAT]: HalfFloatType,
  [VK_FORMAT_R8_SRGB]: UnsignedByteType,
  [VK_FORMAT_R8_UNORM]: UnsignedByteType,
}

const ENCODING_MAP = {
  [VK_FORMAT_R8G8B8A8_SRGB]: sRGBEncoding,
  [VK_FORMAT_R8G8_SRGB]: sRGBEncoding,
  [VK_FORMAT_R8_SRGB]: sRGBEncoding,
}

async function createDataTexture(container: KTX2Container): Promise<DataTexture | Data3DTexture> {
  const { vkFormat, pixelWidth, pixelHeight, pixelDepth } = container

  if (FORMAT_MAP[vkFormat as keyof typeof FORMAT_MAP] === undefined) {
    throw new Error('THREE.KTX2Loader: Unsupported vkFormat.')
  }

  const level = container.levels[0]

  let levelData
  let view

  if (container.supercompressionScheme === KHR_SUPERCOMPRESSION_NONE) {
    levelData = level.levelData
  } else if (container.supercompressionScheme === KHR_SUPERCOMPRESSION_ZSTD) {
    if (!_zstd) {
      _zstd = new Promise(async (resolve) => {
        const zstd = new ZSTDDecoder()
        await zstd.init()
        resolve(zstd)
      })
    }

    levelData = (await _zstd).decode(level.levelData, level.uncompressedByteLength)
  } else {
    throw new Error('THREE.KTX2Loader: Unsupported supercompressionScheme.')
  }

  if (TYPE_MAP[vkFormat as keyof typeof TYPE_MAP] === FloatType) {
    view = new Float32Array(
      levelData.buffer,
      levelData.byteOffset,
      levelData.byteLength / Float32Array.BYTES_PER_ELEMENT,
    )
  } else if (TYPE_MAP[vkFormat as keyof typeof TYPE_MAP] === HalfFloatType) {
    view = new Uint16Array(levelData.buffer, levelData.byteOffset, levelData.byteLength / Uint16Array.BYTES_PER_ELEMENT)
  } else {
    view = levelData
  }

  const texture =
    pixelDepth === 0
      ? new DataTexture(view, pixelWidth, pixelHeight)
      : new Data3DTexture(view, pixelWidth, pixelHeight, pixelDepth)

  texture.type = TYPE_MAP[vkFormat as keyof typeof TYPE_MAP]
  texture.format = FORMAT_MAP[vkFormat as keyof typeof FORMAT_MAP]
  texture.encoding = ENCODING_MAP[vkFormat as keyof typeof ENCODING_MAP] || LinearEncoding

  texture.needsUpdate = true

  //

  return Promise.resolve(texture)
}

export { KTX2Loader }
