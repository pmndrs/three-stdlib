import { BufferAttribute, Camera, InterleavedBufferAttribute, Material, Scene, Texture, Vector3Tuple } from 'three'
import { WEBGL_EXPORTER_CONSTANTS } from 'loaders/tmp/constants'

export type Primitive = {
  mode: number
  attributes: {
    [key: string]: BufferAttribute | InterleavedBufferAttribute | number
  }
  targets?: {
    [key: string]: BufferAttribute | InterleavedBufferAttribute | number
  }[]
  indices?: BufferAttribute | InterleavedBufferAttribute | number
  material?: number
}

export type BufferViewDef = {
  buffer: number
  byteOffset: number
  byteLength: number
  target?: number
  byteStride?: number
}

export type AccessorDef = {
  bufferView: unknown
  byteOffset: unknown
  componentType: unknown
  count: unknown
  max: unknown
  min: unknown
  type: unknown
  normalized?: boolean
}

export type TextureDef = {
  sampler: number
  source: number
  name?: string
}

export type OcclusionMapDef = {
  index: number
  texCoord: number
  strength?: number
}

export type MeshDef = {
  weights?: number[]
  extras?: {
    [key: string]: string[]
  }
  primitives?: Primitive[]
}

export type MaterialDef = {
  pbrMetallicRoughness: {
    baseColorFactor?: number[]
    metallicFactor?: number
    roughnessFactor?: number
    metallicRoughnessTexture?: {
      index: number
    }
    baseColorTexture?: {
      index: number
    }
  }
  emissiveFactor?: number[]
  emissiveTexture?: {
    index: number
  }
  normalTexture?: {
    index: number
    scale?: number | undefined
  }
  occlusionTexture?: OcclusionMapDef
  alphaMode?: string
  alphaCutoff?: number
  doubleSided?: boolean
  name?: string
  extensions?: {
    [key: string]: unknown
  }
}

export type CameraDef = {
  type: string
  orthographic?: {
    xmag: number
    ymag: number
    zfar: number
    znear: number
  }
  perspective?: {
    aspectRatio: number
    yfov: number
    zfar: number
    znear: number
  }
  name?: string
}

export type NodeDef = {
  rotation?: number[]
  translation?: Vector3Tuple
  scale?: Vector3Tuple
  matrix?: number[]
  name?: string
  mesh?: number
  camera?: number
  children?: number[]
  extensions?: { [key: string]: number | { light?: number } }
}

export type SceneDef = {
  name?: string
  nodes?: number[]
}

export type LightDef = {
  name?: string
  color?: number[]
  intensity?: number
  type?: string
  spot?: {
    innerConeAngle?: number
    outerConeAngle?: number
  }
  range?: number
}

export type ImageDef = {
  mimeType: string
  bufferView?: number
  uri?: string
}

export type ImageRepresentation = HTMLImageElement | HTMLCanvasElement | OffscreenCanvas | ImageBitmap

export type SamplerDef = {
  magFilter: typeof WEBGL_EXPORTER_CONSTANTS[keyof typeof WEBGL_EXPORTER_CONSTANTS]
  minFilter: typeof WEBGL_EXPORTER_CONSTANTS[keyof typeof WEBGL_EXPORTER_CONSTANTS]
  wrapS: typeof WEBGL_EXPORTER_CONSTANTS[keyof typeof WEBGL_EXPORTER_CONSTANTS]
  wrapT: typeof WEBGL_EXPORTER_CONSTANTS[keyof typeof WEBGL_EXPORTER_CONSTANTS]
}

type Asset = {
  version: string
  generator: string
}

type GLTFJson = {
  buffers?: {
    uri?: ArrayBuffer | string
    byteLength: number
  }[]
  extensionsUsed?: string[]
  bufferViews?: BufferViewDef[]
  images?: ImageRepresentation[] & ImageDef[]
  accessors?: AccessorDef[]
  samplers?: SamplerDef[]
  textures?: Texture[] & TextureDef[]
  materials?: Material[] & MaterialDef[]
  meshes?: unknown[]
  cameras?: (Camera | CameraDef)[]
  animations?: unknown[]
  nodes?: {
    [key: string]: unknown
  }[]
  skins?: {}[]
  scenes?: (Scene | SceneDef)[]
  scene?: number
  extensions?: {
    [key: string]: {
      lights: unknown[]
    }
  }
}

export type GLTFExportJson = {
  asset: Asset
} & GLTFJson

export type GLTFLoaderJson = {
  asset?: Asset
} & GLTFJson
