import { MeshoptDecoder, MeshoptDecoderType } from 'libs/MeshoptDecoder'
import { DRACOLoader } from 'loaders/DRACOLoader'
import { KTX2Loader } from 'loaders/KTX2Loader'
import { GLTFParser } from './tmp/GLTFParser'
import {
  AnimationClip,
  Bone,
  Box3,
  BufferAttribute,
  BufferGeometry,
  ClampToEdgeWrapping,
  Color,
  DirectionalLight,
  DoubleSide,
  FileLoader,
  FrontSide,
  Group,
  ImageBitmapLoader,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  Interpolant,
  InterpolateDiscrete,
  InterpolateLinear,
  Line,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  LinearFilter,
  LinearMipmapLinearFilter,
  LinearMipmapNearestFilter,
  Loader,
  LoaderUtils,
  Material,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  NearestFilter,
  NearestMipmapLinearFilter,
  NearestMipmapNearestFilter,
  NumberKeyframeTrack,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  PropertyBinding,
  Quaternion,
  QuaternionKeyframeTrack,
  RepeatWrapping,
  Skeleton,
  SkinnedMesh,
  Sphere,
  SpotLight,
  TangentSpaceNormalMap,
  Texture,
  TextureLoader,
  TriangleFanDrawMode,
  TriangleStripDrawMode,
  Vector2,
  Vector3,
  VectorKeyframeTrack,
  sRGBEncoding,
  LoadingManager,
} from 'three'
import { GLTFMeshStandardSGMaterial } from './tmp/GLTFMeshStandardSGMaterial'
import { ATTRIBUTES, WEBGL_COMPONENT_TYPES } from './tmp/constants'
import { GLTFObject } from './tmp'

type Plugins =
  | GLTFMaterialsClearcoatExtension
  | GLTFTextureBasisUExtension
  | GLTFTextureWebPExtension
  | GLTFMaterialsSheenExtension
  | GLTFMaterialsTransmissionExtension
  | GLTFMaterialsVolumeExtension
  | GLTFMaterialsIorExtension
  | GLTFMaterialsEmissiveStrengthExtension
  | GLTFMaterialsSpecularExtension
  | GLTFMaterialsIridescenceExtension
  | GLTFLightsExtension
  | GLTFMeshoptCompression

type PluginFunc = (parser: GLTFParser) => Plugins

class GLTFLoader extends Loader {
  dracoLoader: DRACOLoader | null
  ktx2Loader: KTX2Loader | null
  meshoptDecoder: MeshoptDecoderType | null
  pluginCallbacks: PluginFunc[]

  constructor(manager?: LoadingManager) {
    super(manager)

    this.dracoLoader = null
    this.ktx2Loader = null
    this.meshoptDecoder = null

    this.pluginCallbacks = []

    this.register(function (parser: GLTFParser) {
      return new GLTFMaterialsClearcoatExtension(parser)
    })

    this.register(function (parser: GLTFParser) {
      return new GLTFTextureBasisUExtension(parser)
    })

    this.register(function (parser: GLTFParser) {
      return new GLTFTextureWebPExtension(parser)
    })

    this.register(function (parser: GLTFParser) {
      return new GLTFMaterialsSheenExtension(parser)
    })

    this.register(function (parser: GLTFParser) {
      return new GLTFMaterialsTransmissionExtension(parser)
    })

    this.register(function (parser: GLTFParser) {
      return new GLTFMaterialsVolumeExtension(parser)
    })

    this.register(function (parser: GLTFParser) {
      return new GLTFMaterialsIorExtension(parser)
    })

    this.register(function (parser: GLTFParser) {
      return new GLTFMaterialsEmissiveStrengthExtension(parser)
    })

    this.register(function (parser: GLTFParser) {
      return new GLTFMaterialsSpecularExtension(parser)
    })

    this.register(function (parser: GLTFParser) {
      return new GLTFMaterialsIridescenceExtension(parser)
    })

    this.register(function (parser: GLTFParser) {
      return new GLTFLightsExtension(parser)
    })

    this.register(function (parser: GLTFParser) {
      return new GLTFMeshoptCompression(parser)
    })
  }

  load(
    url: string,
    onLoad: (geometry: BufferGeometry) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void,
  ): void {
    const scope = this

    let resourcePath: string

    if (this.resourcePath !== '') {
      resourcePath = this.resourcePath
    } else if (this.path !== '') {
      resourcePath = this.path
    } else {
      resourcePath = LoaderUtils.extractUrlBase(url)
    }

    // Tells the LoadingManager to track an extra item, which resolves after
    // the model is fully loaded. This means the count of items loaded will
    // be incorrect, but ensures manager.onLoad() does not fire early.
    this.manager.itemStart(url)

    const _onError = function (e): void {
      if (onError) {
        onError(e)
      } else {
        console.error(e)
      }

      scope.manager.itemError(url)
      scope.manager.itemEnd(url)
    }

    const loader = new FileLoader(this.manager)

    loader.setPath(this.path)
    loader.setResponseType('arraybuffer')
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)

    loader.load(
      url,
      function (data) {
        try {
          scope.parse(
            data as ArrayBuffer,
            resourcePath,
            function (gltf) {
              onLoad(gltf)

              scope.manager.itemEnd(url)
            },
            _onError,
          )
        } catch (e) {
          _onError(e)
        }
      },
      onProgress,
      _onError,
    )
  }

  setDRACOLoader(dracoLoader: DRACOLoader): GLTFLoader {
    this.dracoLoader = dracoLoader
    return this
  }

  setDDSLoader(): void {
    throw new Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".')
  }

  setKTX2Loader(ktx2Loader: KTX2Loader): GLTFLoader {
    this.ktx2Loader = ktx2Loader
    return this
  }

  setMeshoptDecoder(meshoptDecoder: MeshoptDecoderType): GLTFLoader {
    this.meshoptDecoder = meshoptDecoder
    return this
  }

  register(callback: PluginFunc): GLTFLoader {
    if (this.pluginCallbacks.indexOf(callback) === -1) {
      this.pluginCallbacks.push(callback)
    }

    return this
  }

  unregister(callback: PluginFunc): GLTFLoader {
    if (this.pluginCallbacks.indexOf(callback) !== -1) {
      this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(callback), 1)
    }

    return this
  }

  parse(
    data: ArrayBuffer,
    path: string,
    onLoad: (geometry: BufferGeometry) => void,
    onError?: (event: ErrorEvent | Error) => void,
  ): void {
    let content
    const extensions: {
      [name in ExtensionNames]?:
        | boolean
        | GLTFBinaryExtension
        | GLTFMaterialsUnlitExtension
        | GLTFMaterialsPbrSpecularGlossinessExtension
        | GLTFDracoMeshCompressionExtension
        | GLTFTextureTransformExtension
        | GLTFMeshQuantizationExtension
    } = {}
    const plugins = {}

    if (typeof data === 'string') {
      content = data
    } else {
      const magic = LoaderUtils.decodeText(new Uint8Array(data, 0, 4))

      if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
        try {
          extensions[EXTENSIONS.KHR_BINARY_GLTF as ExtensionNames] = new GLTFBinaryExtension(data)
        } catch (error) {
          if (onError) onError(error as ErrorEvent)
          return
        }

        content = (extensions[EXTENSIONS.KHR_BINARY_GLTF as ExtensionNames] as GLTFBinaryExtension).content
      } else {
        content = LoaderUtils.decodeText(new Uint8Array(data))
      }
    }

    const json: GLTFObject = JSON.parse(content)

    // version is a pattern of ^[0-9]+\.[0-9]+$
    // This means the first character is the major version number
    if (json.asset === undefined || (json.asset.version[0] as unknown as number) < 2) {
      if (onError) onError(new Error('THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.'))
      return
    }

    console.log(json)

    const parser = new GLTFParser(json, {
      path: path || this.resourcePath || '',
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder,
    })

    parser.fileLoader.setRequestHeader(this.requestHeader)

    for (let i = 0; i < this.pluginCallbacks.length; i++) {
      const plugin = this.pluginCallbacks[i](parser)
      plugins[plugin.name] = plugin

      // Workaround to avoid determining as unknown extension
      // in addUnknownExtensionsToUserData().
      // Remove this workaround if we move all the existing
      // extension handlers to plugin system
      extensions[plugin.name as ExtensionNames] = true
    }

    if (json.extensionsUsed) {
      for (let i = 0; i < json.extensionsUsed.length; ++i) {
        const extensionName = json.extensionsUsed[i] as ExtensionNames
        const extensionsRequired = json.extensionsRequired || []

        switch (extensionName) {
          case EXTENSIONS.KHR_MATERIALS_UNLIT:
            extensions[extensionName] = new GLTFMaterialsUnlitExtension()
            break

          case EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS:
            extensions[extensionName] = new GLTFMaterialsPbrSpecularGlossinessExtension()
            break

          case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
            extensions[extensionName] = new GLTFDracoMeshCompressionExtension(json, this.dracoLoader!)
            break

          case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
            extensions[extensionName] = new GLTFTextureTransformExtension()
            break

          case EXTENSIONS.KHR_MESH_QUANTIZATION:
            extensions[extensionName] = new GLTFMeshQuantizationExtension()
            break

          default:
            if (extensionsRequired.indexOf(extensionName) >= 0 && plugins[extensionName] === undefined) {
              console.warn('THREE.GLTFLoader: Unknown extension "' + extensionName + '".')
            }
        }
      }
    }

    parser.setExtensions(extensions)
    parser.setPlugins(plugins)
    parser.parse(onLoad, onError)
  }

  parseAsync(data: ArrayBuffer, path: string): Promise<BufferGeometry> {
    const scope = this

    return new Promise(function (resolve, reject) {
      scope.parse(data, path, resolve, reject)
    })
  }
}

/*********************************/
/********** EXTENSIONS ***********/
/*********************************/

type ExtensionNames =
  | 'KHR_binary_glTF'
  | 'KHR_draco_mesh_compression'
  | 'KHR_lights_punctual'
  | 'KHR_materials_clearcoat'
  | 'KHR_materials_ior'
  | 'KHR_materials_pbrSpecularGlossiness'
  | 'KHR_materials_sheen'
  | 'KHR_materials_specular'
  | 'KHR_materials_transmission'
  | 'KHR_materials_iridescence'
  | 'KHR_materials_unlit'
  | 'KHR_materials_volume'
  | 'KHR_texture_basisu'
  | 'KHR_texture_transform'
  | 'KHR_mesh_quantization'
  | 'KHR_materials_emissive_strength'
  | 'EXT_texture_webp'
  | 'EXT_meshopt_compression'

const EXTENSIONS = {
  KHR_BINARY_GLTF: 'KHR_binary_glTF',
  KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
  KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
  KHR_MATERIALS_CLEARCOAT: 'KHR_materials_clearcoat',
  KHR_MATERIALS_IOR: 'KHR_materials_ior',
  KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
  KHR_MATERIALS_SHEEN: 'KHR_materials_sheen',
  KHR_MATERIALS_SPECULAR: 'KHR_materials_specular',
  KHR_MATERIALS_TRANSMISSION: 'KHR_materials_transmission',
  KHR_MATERIALS_IRIDESCENCE: 'KHR_materials_iridescence',
  KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
  KHR_MATERIALS_VOLUME: 'KHR_materials_volume',
  KHR_TEXTURE_BASISU: 'KHR_texture_basisu',
  KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
  KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization',
  KHR_MATERIALS_EMISSIVE_STRENGTH: 'KHR_materials_emissive_strength',
  EXT_TEXTURE_WEBP: 'EXT_texture_webp',
  EXT_MESHOPT_COMPRESSION: 'EXT_meshopt_compression',
}

/**
 * Punctual Lights Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
 */
class GLTFLightsExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL

    // Object3D instance caches
    this.cache = { refs: {}, uses: {} }
  }

  _markDefs(): void {
    const parser = this.parser
    const nodeDefs = this.parser.json.nodes || []

    for (let nodeIndex = 0, nodeLength = nodeDefs.length; nodeIndex < nodeLength; nodeIndex++) {
      const nodeDef = nodeDefs[nodeIndex]

      if (nodeDef.extensions && nodeDef.extensions[this.name] && nodeDef.extensions[this.name].light !== undefined) {
        parser._addNodeRef(this.cache, nodeDef.extensions[this.name].light)
      }
    }
  }

  _loadLight(lightIndex) {
    const parser = this.parser
    const cacheKey = 'light:' + lightIndex
    let dependency = parser.cache.get(cacheKey)

    if (dependency) return dependency

    const json = parser.json
    const extensions = (json.extensions && json.extensions[this.name]) || {}
    const lightDefs = extensions.lights || []
    const lightDef = lightDefs[lightIndex]
    let lightNode

    const color = new Color(0xffffff)

    if (lightDef.color !== undefined) color.fromArray(lightDef.color)

    const range = lightDef.range !== undefined ? lightDef.range : 0

    switch (lightDef.type) {
      case 'directional':
        lightNode = new DirectionalLight(color)
        lightNode.target.position.set(0, 0, -1)
        lightNode.add(lightNode.target)
        break

      case 'point':
        lightNode = new PointLight(color)
        lightNode.distance = range
        break

      case 'spot':
        lightNode = new SpotLight(color)
        lightNode.distance = range
        // Handle spotlight properties.
        lightDef.spot = lightDef.spot || {}
        lightDef.spot.innerConeAngle = lightDef.spot.innerConeAngle !== undefined ? lightDef.spot.innerConeAngle : 0
        lightDef.spot.outerConeAngle =
          lightDef.spot.outerConeAngle !== undefined ? lightDef.spot.outerConeAngle : Math.PI / 4.0
        lightNode.angle = lightDef.spot.outerConeAngle
        lightNode.penumbra = 1.0 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle
        lightNode.target.position.set(0, 0, -1)
        lightNode.add(lightNode.target)
        break

      default:
        throw new Error('THREE.GLTFLoader: Unexpected light type: ' + lightDef.type)
    }

    // Some lights (e.g. spot) default to a position other than the origin. Reset the position
    // here, because node-level parsing will only override position if explicitly specified.
    lightNode.position.set(0, 0, 0)

    lightNode.decay = 2

    if (lightDef.intensity !== undefined) lightNode.intensity = lightDef.intensity

    lightNode.name = parser.createUniqueName(lightDef.name || 'light_' + lightIndex)

    dependency = Promise.resolve(lightNode)

    parser.cache.add(cacheKey, dependency)

    return dependency
  }

  createNodeAttachment(nodeIndex) {
    const self = this
    const parser = this.parser
    const json = parser.json
    const nodeDef = json.nodes[nodeIndex]
    const lightDef = (nodeDef.extensions && nodeDef.extensions[this.name]) || {}
    const lightIndex = lightDef.light

    if (lightIndex === undefined) return null

    return this._loadLight(lightIndex).then(function (light) {
      return parser._getNodeRef(self.cache, lightIndex, light)
    })
  }
}

/**
 * Unlit Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
 */
class GLTFMaterialsUnlitExtension {
  constructor() {
    this.name = EXTENSIONS.KHR_MATERIALS_UNLIT
  }

  getMaterialType(): typeof MeshBasicMaterial {
    return MeshBasicMaterial
  }

  extendParams(materialParams, materialDef, parser) {
    const pending = []

    materialParams.color = new Color(1.0, 1.0, 1.0)
    materialParams.opacity = 1.0

    const metallicRoughness = materialDef.pbrMetallicRoughness

    if (metallicRoughness) {
      if (Array.isArray(metallicRoughness.baseColorFactor)) {
        const array = metallicRoughness.baseColorFactor

        materialParams.color.fromArray(array)
        materialParams.opacity = array[3]
      }

      if (metallicRoughness.baseColorTexture !== undefined) {
        pending.push(parser.assignTexture(materialParams, 'map', metallicRoughness.baseColorTexture, sRGBEncoding))
      }
    }

    return Promise.all(pending)
  }
}

/**
 * Materials Emissive Strength Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/blob/5768b3ce0ef32bc39cdf1bef10b948586635ead3/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md
 */
class GLTFMaterialsEmissiveStrengthExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const emissiveStrength = materialDef.extensions[this.name].emissiveStrength

    if (emissiveStrength !== undefined) {
      materialParams.emissiveIntensity = emissiveStrength
    }

    return Promise.resolve()
  }
}

/**
 * Clearcoat Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
 */
class GLTFMaterialsClearcoatExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    const extension = materialDef.extensions[this.name]

    if (extension.clearcoatFactor !== undefined) {
      materialParams.clearcoat = extension.clearcoatFactor
    }

    if (extension.clearcoatTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'clearcoatMap', extension.clearcoatTexture))
    }

    if (extension.clearcoatRoughnessFactor !== undefined) {
      materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor
    }

    if (extension.clearcoatRoughnessTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'clearcoatRoughnessMap', extension.clearcoatRoughnessTexture))
    }

    if (extension.clearcoatNormalTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'clearcoatNormalMap', extension.clearcoatNormalTexture))

      if (extension.clearcoatNormalTexture.scale !== undefined) {
        const scale = extension.clearcoatNormalTexture.scale

        materialParams.clearcoatNormalScale = new Vector2(scale, scale)
      }
    }

    return Promise.all(pending)
  }
}

/**
 * Iridescence Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_iridescence
 */
class GLTFMaterialsIridescenceExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_IRIDESCENCE
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    const extension = materialDef.extensions[this.name]

    if (extension.iridescenceFactor !== undefined) {
      materialParams.iridescence = extension.iridescenceFactor
    }

    if (extension.iridescenceTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'iridescenceMap', extension.iridescenceTexture))
    }

    if (extension.iridescenceIor !== undefined) {
      materialParams.iridescenceIOR = extension.iridescenceIor
    }

    if (materialParams.iridescenceThicknessRange === undefined) {
      materialParams.iridescenceThicknessRange = [100, 400]
    }

    if (extension.iridescenceThicknessMinimum !== undefined) {
      materialParams.iridescenceThicknessRange[0] = extension.iridescenceThicknessMinimum
    }

    if (extension.iridescenceThicknessMaximum !== undefined) {
      materialParams.iridescenceThicknessRange[1] = extension.iridescenceThicknessMaximum
    }

    if (extension.iridescenceThicknessTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, 'iridescenceThicknessMap', extension.iridescenceThicknessTexture),
      )
    }

    return Promise.all(pending)
  }
}

/**
 * Sheen Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_sheen
 */
class GLTFMaterialsSheenExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_SHEEN
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    materialParams.sheenColor = new Color(0, 0, 0)
    materialParams.sheenRoughness = 0
    materialParams.sheen = 1

    const extension = materialDef.extensions[this.name]

    if (extension.sheenColorFactor !== undefined) {
      materialParams.sheenColor.fromArray(extension.sheenColorFactor)
    }

    if (extension.sheenRoughnessFactor !== undefined) {
      materialParams.sheenRoughness = extension.sheenRoughnessFactor
    }

    if (extension.sheenColorTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'sheenColorMap', extension.sheenColorTexture, sRGBEncoding))
    }

    if (extension.sheenRoughnessTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'sheenRoughnessMap', extension.sheenRoughnessTexture))
    }

    return Promise.all(pending)
  }
}

/**
 * Transmission Materials Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
 * Draft: https://github.com/KhronosGroup/glTF/pull/1698
 */
class GLTFMaterialsTransmissionExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    const extension = materialDef.extensions[this.name]

    if (extension.transmissionFactor !== undefined) {
      materialParams.transmission = extension.transmissionFactor
    }

    if (extension.transmissionTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'transmissionMap', extension.transmissionTexture))
    }

    return Promise.all(pending)
  }
}

/**
 * Materials Volume Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
 */
class GLTFMaterialsVolumeExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_VOLUME
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    const extension = materialDef.extensions[this.name]

    materialParams.thickness = extension.thicknessFactor !== undefined ? extension.thicknessFactor : 0

    if (extension.thicknessTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'thicknessMap', extension.thicknessTexture))
    }

    materialParams.attenuationDistance = extension.attenuationDistance || Infinity

    const colorArray = extension.attenuationColor || [1, 1, 1]
    materialParams.attenuationColor = new Color(colorArray[0], colorArray[1], colorArray[2])

    return Promise.all(pending)
  }
}

/**
 * Materials ior Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior
 */
class GLTFMaterialsIorExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_IOR
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const extension = materialDef.extensions[this.name]

    materialParams.ior = extension.ior !== undefined ? extension.ior : 1.5

    return Promise.resolve()
  }
}

/**
 * Materials specular Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular
 */
class GLTFMaterialsSpecularExtension {
  constructor(parser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_MATERIALS_SPECULAR
  }

  getMaterialType(materialIndex) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) return null

    return MeshPhysicalMaterial
  }

  extendMaterialParams(materialIndex, materialParams) {
    const parser = this.parser
    const materialDef = parser.json.materials[materialIndex]

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve()
    }

    const pending = []

    const extension = materialDef.extensions[this.name]

    materialParams.specularIntensity = extension.specularFactor !== undefined ? extension.specularFactor : 1.0

    if (extension.specularTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'specularIntensityMap', extension.specularTexture))
    }

    const colorArray = extension.specularColorFactor || [1, 1, 1]
    materialParams.specularColor = new Color(colorArray[0], colorArray[1], colorArray[2])

    if (extension.specularColorTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, 'specularColorMap', extension.specularColorTexture, sRGBEncoding),
      )
    }

    return Promise.all(pending)
  }
}

/**
 * BasisU Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_basisu
 */
class GLTFTextureBasisUExtension {
  parser
  name

  constructor(parser: GLTFParser) {
    this.parser = parser
    this.name = EXTENSIONS.KHR_TEXTURE_BASISU
  }

  loadTexture(textureIndex) {
    console.log(textureIndex)

    const parser = this.parser
    const json = parser.json

    const textureDef = json.textures[textureIndex]
    console.log(textureDef)

    if (!textureDef.extensions || !textureDef.extensions[this.name]) {
      return null
    }

    const extension = textureDef.extensions[this.name]
    const loader = parser.options.ktx2Loader

    if (!loader) {
      if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {
        throw new Error('THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures')
      } else {
        // Assumes that the extension is optional and that a fallback texture is present
        return null
      }
    }

    return parser.loadTextureImage(textureIndex, extension.source, loader)
  }
}

/**
 * WebP Texture Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_webp
 */
class GLTFTextureWebPExtension {
  parser
  name
  isSupported: boolean | null
  constructor(parser: GLTFParser) {
    this.parser = parser
    this.name = EXTENSIONS.EXT_TEXTURE_WEBP
    this.isSupported = null
  }

  loadTexture(textureIndex: number) {
    console.log(textureIndex)

    const name = this.name
    const parser = this.parser
    const json = parser.json

    const textureDef = json.textures[textureIndex]

    console.log(textureDef)

    if (!textureDef.extensions || !textureDef.extensions[name]) {
      return null
    }

    const extension = textureDef.extensions[name]
    const source = json.images[extension.source]

    let loader = parser.textureLoader
    if (source.uri) {
      const handler = parser.options.manager.getHandler(source.uri)
      if (handler !== null) loader = handler
    }

    return this.detectSupport().then(function (isSupported) {
      if (isSupported) return parser.loadTextureImage(textureIndex, extension.source, loader)

      if (json.extensionsRequired && json.extensionsRequired.indexOf(name) >= 0) {
        throw new Error('THREE.GLTFLoader: WebP required by asset but unsupported.')
      }

      // Fall back to PNG or JPEG.
      return parser.loadTexture(textureIndex)
    })
  }

  detectSupport() {
    if (!this.isSupported) {
      this.isSupported = new Promise(function (resolve) {
        const image = new Image()

        // Lossy test image. Support for lossy images doesn't guarantee support for all
        // WebP images, unfortunately.
        image.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA'

        image.onload = image.onerror = function () {
          resolve(image.height === 1)
        }
      })
    }

    return this.isSupported
  }
}

/**
 * meshopt BufferView Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
 */
class GLTFMeshoptCompression {
  constructor(parser) {
    this.name = EXTENSIONS.EXT_MESHOPT_COMPRESSION
    this.parser = parser
  }

  loadBufferView(index) {
    const json = this.parser.json
    const bufferView = json.bufferViews[index]

    if (bufferView.extensions && bufferView.extensions[this.name]) {
      const extensionDef = bufferView.extensions[this.name]

      const buffer = this.parser.getDependency('buffer', extensionDef.buffer)
      const decoder = this.parser.options.meshoptDecoder

      if (!decoder || !decoder.supported) {
        if (json.extensionsRequired && json.extensionsRequired.indexOf(this.name) >= 0) {
          throw new Error('THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files')
        } else {
          // Assumes that the extension is optional and that fallback buffer data is present
          return null
        }
      }

      return buffer.then(function (res) {
        const byteOffset = extensionDef.byteOffset || 0
        const byteLength = extensionDef.byteLength || 0

        const count = extensionDef.count
        const stride = extensionDef.byteStride

        const source = new Uint8Array(res, byteOffset, byteLength)

        if (decoder.decodeGltfBufferAsync) {
          return decoder
            .decodeGltfBufferAsync(count, stride, source, extensionDef.mode, extensionDef.filter)
            .then(function (res) {
              return res.buffer
            })
        } else {
          // Support for MeshoptDecoder 0.18 or earlier, without decodeGltfBufferAsync
          return decoder.ready.then(function () {
            const result = new ArrayBuffer(count * stride)
            decoder.decodeGltfBuffer(
              new Uint8Array(result),
              count,
              stride,
              source,
              extensionDef.mode,
              extensionDef.filter,
            )
            return result
          })
        }
      })
    } else {
      return null
    }
  }
}

/* BINARY EXTENSION */
const BINARY_EXTENSION_HEADER_MAGIC = 'glTF'
const BINARY_EXTENSION_HEADER_LENGTH = 12
const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4e4f534a, BIN: 0x004e4942 }

class GLTFBinaryExtension {
  name
  content
  body
  header
  constructor(data) {
    this.name = EXTENSIONS.KHR_BINARY_GLTF
    this.content = null
    this.body = null

    const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH)

    this.header = {
      magic: LoaderUtils.decodeText(new Uint8Array(data.slice(0, 4))),
      version: headerView.getUint32(4, true),
      length: headerView.getUint32(8, true),
    }

    if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
      throw new Error('THREE.GLTFLoader: Unsupported glTF-Binary header.')
    } else if (this.header.version < 2.0) {
      throw new Error('THREE.GLTFLoader: Legacy binary file detected.')
    }

    const chunkContentsLength = this.header.length - BINARY_EXTENSION_HEADER_LENGTH
    const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH)
    let chunkIndex = 0

    while (chunkIndex < chunkContentsLength) {
      const chunkLength = chunkView.getUint32(chunkIndex, true)
      chunkIndex += 4

      const chunkType = chunkView.getUint32(chunkIndex, true)
      chunkIndex += 4

      if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
        const contentArray = new Uint8Array(data, BINARY_EXTENSION_HEADER_LENGTH + chunkIndex, chunkLength)
        this.content = LoaderUtils.decodeText(contentArray)
      } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
        const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex
        this.body = data.slice(byteOffset, byteOffset + chunkLength)
      }

      // Clients must ignore chunks with unknown types.

      chunkIndex += chunkLength
    }

    if (this.content === null) {
      throw new Error('THREE.GLTFLoader: JSON content not found.')
    }
  }
}

/**
 * DRACO Mesh Compression Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
 */
class GLTFDracoMeshCompressionExtension {
  constructor(json, dracoLoader: DRACOLoader) {
    if (!dracoLoader) {
      throw new Error('THREE.GLTFLoader: No DRACOLoader instance provided.')
    }

    this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION
    this.json = json
    this.dracoLoader = dracoLoader
    this.dracoLoader.preload()
  }

  decodePrimitive(primitive, parser) {
    const json = this.json
    const dracoLoader = this.dracoLoader
    const bufferViewIndex = primitive.extensions[this.name].bufferView
    const gltfAttributeMap = primitive.extensions[this.name].attributes
    const threeAttributeMap = {}
    const attributeNormalizedMap = {}
    const attributeTypeMap = {}

    for (const attributeName in gltfAttributeMap) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase()

      threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName]
    }

    for (const attributeName in primitive.attributes) {
      const threeAttributeName = ATTRIBUTES[attributeName] || attributeName.toLowerCase()

      if (gltfAttributeMap[attributeName] !== undefined) {
        const accessorDef = json.accessors[primitive.attributes[attributeName]]
        const componentType = WEBGL_COMPONENT_TYPES[accessorDef.componentType]

        attributeTypeMap[threeAttributeName] = componentType.name
        attributeNormalizedMap[threeAttributeName] = accessorDef.normalized === true
      }
    }

    return parser.getDependency('bufferView', bufferViewIndex).then(function (bufferView) {
      return new Promise(function (resolve) {
        dracoLoader.decodeDracoFile(
          bufferView,
          function (geometry) {
            for (const attributeName in geometry.attributes) {
              const attribute = geometry.attributes[attributeName]
              const normalized = attributeNormalizedMap[attributeName]

              if (normalized !== undefined) attribute.normalized = normalized
            }

            resolve(geometry)
          },
          threeAttributeMap,
          attributeTypeMap,
        )
      })
    })
  }
}

/**
 * Texture Transform Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
 */
class GLTFTextureTransformExtension {
  constructor() {
    this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM
  }

  extendTexture(texture, transform) {
    if (transform.texCoord !== undefined) {
      console.warn('THREE.GLTFLoader: Custom UV sets in "' + this.name + '" extension not yet supported.')
    }

    if (transform.offset === undefined && transform.rotation === undefined && transform.scale === undefined) {
      // See https://github.com/mrdoob/three.js/issues/21819.
      return texture
    }

    texture = texture.clone()

    if (transform.offset !== undefined) {
      texture.offset.fromArray(transform.offset)
    }

    if (transform.rotation !== undefined) {
      texture.rotation = transform.rotation
    }

    if (transform.scale !== undefined) {
      texture.repeat.fromArray(transform.scale)
    }

    texture.needsUpdate = true

    return texture
  }
}

/**
 * Specular-Glossiness Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Archived/KHR_materials_pbrSpecularGlossiness
 */

class GLTFMaterialsPbrSpecularGlossinessExtension {
  constructor() {
    this.name = EXTENSIONS.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS

    this.specularGlossinessParams = [
      'color',
      'map',
      'lightMap',
      'lightMapIntensity',
      'aoMap',
      'aoMapIntensity',
      'emissive',
      'emissiveIntensity',
      'emissiveMap',
      'bumpMap',
      'bumpScale',
      'normalMap',
      'normalMapType',
      'displacementMap',
      'displacementScale',
      'displacementBias',
      'specularMap',
      'specular',
      'glossinessMap',
      'glossiness',
      'alphaMap',
      'envMap',
      'envMapIntensity',
      'refractionRatio',
    ]
  }

  getMaterialType() {
    return GLTFMeshStandardSGMaterial
  }

  extendParams(materialParams, materialDef, parser) {
    const pbrSpecularGlossiness = materialDef.extensions[this.name]

    materialParams.color = new Color(1.0, 1.0, 1.0)
    materialParams.opacity = 1.0

    const pending = []

    if (Array.isArray(pbrSpecularGlossiness.diffuseFactor)) {
      const array = pbrSpecularGlossiness.diffuseFactor

      materialParams.color.fromArray(array)
      materialParams.opacity = array[3]
    }

    if (pbrSpecularGlossiness.diffuseTexture !== undefined) {
      pending.push(parser.assignTexture(materialParams, 'map', pbrSpecularGlossiness.diffuseTexture, sRGBEncoding))
    }

    materialParams.emissive = new Color(0.0, 0.0, 0.0)
    materialParams.glossiness =
      pbrSpecularGlossiness.glossinessFactor !== undefined ? pbrSpecularGlossiness.glossinessFactor : 1.0
    materialParams.specular = new Color(1.0, 1.0, 1.0)

    if (Array.isArray(pbrSpecularGlossiness.specularFactor)) {
      materialParams.specular.fromArray(pbrSpecularGlossiness.specularFactor)
    }

    if (pbrSpecularGlossiness.specularGlossinessTexture !== undefined) {
      const specGlossMapDef = pbrSpecularGlossiness.specularGlossinessTexture
      pending.push(parser.assignTexture(materialParams, 'glossinessMap', specGlossMapDef))
      pending.push(parser.assignTexture(materialParams, 'specularMap', specGlossMapDef, sRGBEncoding))
    }

    return Promise.all(pending)
  }

  createMaterial(materialParams) {
    const material = new GLTFMeshStandardSGMaterial(materialParams)
    material.fog = true

    material.color = materialParams.color

    material.map = materialParams.map === undefined ? null : materialParams.map

    material.lightMap = null
    material.lightMapIntensity = 1.0

    material.aoMap = materialParams.aoMap === undefined ? null : materialParams.aoMap
    material.aoMapIntensity = 1.0

    material.emissive = materialParams.emissive
    material.emissiveIntensity = materialParams.emissiveIntensity === undefined ? 1.0 : materialParams.emissiveIntensity
    material.emissiveMap = materialParams.emissiveMap === undefined ? null : materialParams.emissiveMap

    material.bumpMap = materialParams.bumpMap === undefined ? null : materialParams.bumpMap
    material.bumpScale = 1

    material.normalMap = materialParams.normalMap === undefined ? null : materialParams.normalMap
    material.normalMapType = TangentSpaceNormalMap

    if (materialParams.normalScale) material.normalScale = materialParams.normalScale

    material.displacementMap = null
    material.displacementScale = 1
    material.displacementBias = 0

    material.specularMap = materialParams.specularMap === undefined ? null : materialParams.specularMap
    material.specular = materialParams.specular

    material.glossinessMap = materialParams.glossinessMap === undefined ? null : materialParams.glossinessMap
    material.glossiness = materialParams.glossiness

    material.alphaMap = null

    material.envMap = materialParams.envMap === undefined ? null : materialParams.envMap
    material.envMapIntensity = 1.0

    material.refractionRatio = 0.98

    return material
  }
}

/**
 * Mesh Quantization Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization
 */
class GLTFMeshQuantizationExtension {
  name
  constructor() {
    this.name = EXTENSIONS.KHR_MESH_QUANTIZATION
  }
}

/* GLTF PARSER */

export { GLTFLoader }
