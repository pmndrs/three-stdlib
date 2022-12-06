import { Vector3Tuple } from 'three'

type JSONValue = string | number | boolean | { [x: string]: JSONValue } | Array<JSONValue>

export type Extra = { extras?: any }
export type Extension = { [x: string]: JSONValue }
export type Extensions = {
  extensions?: Extension
}

type ExtensionsAndExtras = Extensions & Extra

type Asset = {
  version: string
  copyright?: string
  generator?: string
  minVersion?: string
} & ExtensionsAndExtras

export type Result = {
  scene: any
  scenes: any
  animations: any
  cameras: any
  asset: Asset
  parser: any
  userData: any
}

type Scene = {
  name?: string
  nodes?: number[]
} & ExtensionsAndExtras

type Matrix = {
  matrix: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ]
}

type TRS = {
  translation?: Vector3Tuple
  rotation?: [number, number, number, number]
  scale?: Vector3Tuple
  matrix?: never
}

type MeshWithoutWeights = {
  mesh?: number
  weights?: never
}

type MeshWithWeight = {
  mesh: number
  weights: number[]
}

type Node = {
  skin?: number
  camera?: number
  children?: number[]
  name?: string
} & (Matrix | TRS) &
  (MeshWithoutWeights | MeshWithWeight) &
  ExtensionsAndExtras

type Skin = {
  joints: number[]
  name?: string
  skeleton?: number
  inverseBindMatrices?: number
} & ExtensionsAndExtras

type Texture = {
  name?: string
  source?: number
  sampler?: number
} & ExtensionsAndExtras

type NEAREST = 9728
type LINEAR = 9729
type NEAREST_MIPMAP_NEAREST = 9984
type LINEAR_MIPMAP_NEAREST = 9985
type NEAREST_MIPMAP_LINEAR = 9986
type LINEAR_MIPMAP_LINEAR = 9987

type CLAMP_TO_EDGE = 33071
type MIRRORED_REPEAT = 33648
type REPEAT = 10497

type Wrap = CLAMP_TO_EDGE | MIRRORED_REPEAT | REPEAT

export type Sampler = {
  name?: string
  magFilter?: NEAREST | LINEAR
  minFilter?:
    | NEAREST
    | LINEAR
    | NEAREST_MIPMAP_NEAREST
    | LINEAR_MIPMAP_NEAREST
    | NEAREST_MIPMAP_LINEAR
    | LINEAR_MIPMAP_LINEAR
  wrapS?: Wrap
  wrapT?: Wrap
} & ExtensionsAndExtras

type POINTS = 0
type LINES = 1
type LINE_LOOP = 2
type LINE_STRIP = 3
type TRIANGLES = 4
type TRIANGLE_STRIP = 5
type TRIANGLE_FAN = 6

type Primitive = {
  attributes: { [x: string]: JSONValue }
  indices?: number
  material?: number
  mode?: POINTS | LINES | LINE_LOOP | LINE_STRIP | TRIANGLES | TRIANGLE_STRIP | TRIANGLE_FAN
  targets?: { [x: string]: JSONValue }
} & ExtensionsAndExtras

type Mesh = {
  primitives: Primitive[]
  name?: string
  weights?: number[]
} & ExtensionsAndExtras

type PbrMetallicRoughness = {
  baseColorFactor?: [number, number, number, number]
  baseColorTexture?: TextureInfo
  metallicFactor?: number
  roughnessFactor?: number
  metallicRoughnessTexture?: TextureInfo
} & ExtensionsAndExtras

type NormalTextureInfo = {
  index: number
  texCoord?: number
  scale?: number
} & ExtensionsAndExtras

type OcclusionTextureInfo = {
  index: number
  texCoord?: number
  strength?: number
} & ExtensionsAndExtras

type TextureInfo = {
  index: number
  texCoord?: number
} & ExtensionsAndExtras

type Material = {
  name?: string
  pbrMetallicRoughness?: PbrMetallicRoughness
  normalTexture?: NormalTextureInfo
  occlusionTexture?: OcclusionTextureInfo
  emissiveTexture?: TextureInfo
  emissiveFactor?: [number, number, number]
  alphaMode?: 'OPAQUE' | 'MASK' | 'BLEND'
  alphaCutoff?: number
  doubleSided?: boolean
} & ExtensionsAndExtras

type Image = {
  uri?: string
  mimeType?: 'image/jpeg' | 'image/png'
  bufferView?: number
  name?: string
} & ExtensionsAndExtras

type Perspective = {
  yfov: number
  znear: number
  aspectRatio?: number
  zfar?: number
} & ExtensionsAndExtras

type Orthographic = {
  xmag: number
  ymag: number
  zfar: number
  znear: number
} & ExtensionsAndExtras

type Camera = {
  type: 'perspective' | 'orthographic'
  name?: string
  perspective?: Perspective
  orthographic?: Orthographic
} & ExtensionsAndExtras

type ARRAY_BUFFER = 34962
type ELEMENT_ARRAY_BUFFER = 34963

type BufferView = {
  buffer: number
  byteLength: number
  byteOffset?: number
  byteStride?: number
  target?: ARRAY_BUFFER | ELEMENT_ARRAY_BUFFER
  name?: string
} & ExtensionsAndExtras

type Buffer = {
  byteLength: number
  uri?: string
  name?: string
} & ExtensionsAndExtras

type Animation = {
  channels: Channel[]
  samplers: AnimationSampler[]
} & ExtensionsAndExtras

type AnimationSampler = {
  input: number
  output: number
  interpolation?: 'LINEAR' | 'STEP' | 'CUBICSPLINE'
} & ExtensionsAndExtras

type Channel = {
  sampler: number
  target: ChannelTarget
} & ExtensionsAndExtras

type ChannelTarget = {
  path: 'translation' | 'rotation' | 'scale' | 'weights'
  node?: number
} & ExtensionsAndExtras

type Indices = {
  bufferView: number
  componentType: UNSIGNED_BYTE | UNSIGNED_SHORT | UNSIGNED_INT
  byteOffset?: number
} & ExtensionsAndExtras

type SparseValues = {
  bufferView: number
  byteOffset?: number
} & ExtensionsAndExtras

type Sparse = {
  count: number
  indices: Indices
  values: SparseValues
} & ExtensionsAndExtras

type BYTE = 5120
type UNSIGNED_BYTE = 5121
type SHORT = 5122
type UNSIGNED_SHORT = 5123
type UNSIGNED_INT = 5125
type FLOAT = 5126

type Accessor = {
  componentType: BYTE | UNSIGNED_BYTE | SHORT | UNSIGNED_SHORT | UNSIGNED_INT | FLOAT
  count: number
  type: 'SCALAR' | 'VEC2' | 'VEC3' | 'VEC4' | 'MAT2' | 'MAT3' | 'MAT4'
  bufferView?: number
  byteOffset?: number
  normalized?: boolean
  max?: number[]
  min?: number[]
  sparse?: Sparse
  name?: string
} & ExtensionsAndExtras

export type GLTFObject = {
  extensionsUsed?: string[]
  extensionsRequired?: string[]
  accessors?: Accessor[]
  animations?: Animation[]
  asset: Asset
  buffers?: Buffer[]
  bufferViews?: BufferView[]
  cameras?: Camera[]
  images?: Image[]
  materials?: Material[]
  meshes?: Mesh[]
  nodes?: Node[]
  samplers?: Sampler[]
  scene?: number
  scenes?: Scene[]
  skins?: Skin[]
  textures?: Texture[]
} & ExtensionsAndExtras

const a: Node = {
  // matrix: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  // rotation: [1, 1, 1, 1],
  translation: [1, 1, 1],
  scale: [1, 1, 1],
  // mesh: 0,
  // weights: [0],
}

console.log(a)
