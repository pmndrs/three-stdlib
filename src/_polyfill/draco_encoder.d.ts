// Type definitions for draco3d 1.4
// Project: https://github.com/google/draco#readme
// Definitions by: Don McCurdy <https://github.com/donmccurdy>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

type TypedArray = Float32Array | Uint32Array | Uint16Array | Uint8Array | Int16Array | Int8Array

export function DracoEncoderModule(DracoEncoderModule?: EncoderModule): EncoderModule

export interface BaseModule {
  Mesh: new () => Mesh

  DracoFloat32Array: new () => DracoFloat32Array
  DracoInt8Array: new () => DracoInt8Array
  DracoInt16Array: new () => DracoInt16Array
  DracoInt32Array: new () => DracoInt32Array
  DracoUInt8Array: new () => DracoUInt8Array
  DracoUInt16Array: new () => DracoUInt16Array
  DracoUInt32Array: new () => DracoUInt32Array

  _malloc: (ptr: number) => number
  _free: (ptr: number) => void
  destroy: (object: unknown) => void

  // Heap.
  HEAPF32: Float32Array
  HEAP32: Int32Array
  HEAP16: Int16Array
  HEAP8: Int8Array
  HEAPU32: Uint32Array
  HEAPU16: Uint16Array
  HEAPU8: Uint8Array
}

export interface EncoderModule extends BaseModule {
  Encoder: new () => Encoder
  MeshBuilder: new () => MeshBuilder

  POSITION: number
  NORMAL: number
  TEX_COORD: number
  COLOR: number
  GENERIC: number

  MESH_SEQUENTIAL_ENCODING: number
  MESH_EDGEBREAKER_ENCODING: number
}

export interface Encoder {
  SetAttributeQuantization(attribute: number, bits: number): void
  SetAttributeExplicitQuantization(
    attribute: number,
    bits: number,
    itemSize: number,
    origin: [number, number, number],
    range: number,
  ): void
  SetSpeedOptions(encodeSpeed: number, decodeSpeed: number): void
  SetEncodingMethod(method: number): void
  SetTrackEncodedProperties(track: boolean): void
  EncodeMeshToDracoBuffer(mesh: Mesh, array: DracoInt8Array): number
  GetNumberOfEncodedPoints(): number
  GetNumberOfEncodedFaces(): number
}

export interface DracoArray {
  GetValue: (index: number) => number
}

// tslint:disable-next-line:no-empty-interface
export interface DracoFloat32Array extends DracoArray {}
// tslint:disable-next-line:no-empty-interface
export interface DracoInt8Array extends DracoArray {}
// tslint:disable-next-line:no-empty-interface
export interface DracoInt16Array extends DracoArray {}
// tslint:disable-next-line:no-empty-interface
export interface DracoInt32Array extends DracoArray {}
// tslint:disable-next-line:no-empty-interface
export interface DracoUInt8Array extends DracoArray {}
// tslint:disable-next-line:no-empty-interface
export interface DracoUInt16Array extends DracoArray {}
// tslint:disable-next-line:no-empty-interface
export interface DracoUInt32Array extends DracoArray {}

export interface Attribute {
  num_components: () => number
}

export interface Mesh {
  ptr: number
  num_faces: () => number
  num_points: () => number
}

export interface MeshBuilder {
  AddFacesToMesh(mesh: Mesh, numFaces: number, faces: Uint16Array | Uint32Array): void
  AddUInt8Attribute(mesh: Mesh, attribute: number, count: number, itemSize: number, array: TypedArray): number
  AddInt8Attribute(mesh: Mesh, attribute: number, count: number, itemSize: number, array: TypedArray): number
  AddUInt16Attribute(mesh: Mesh, attribute: number, count: number, itemSize: number, array: TypedArray): number
  AddInt16Attribute(mesh: Mesh, attribute: number, count: number, itemSize: number, array: TypedArray): number
  AddUInt32Attribute(mesh: Mesh, attribute: number, count: number, itemSize: number, array: TypedArray): number
  AddFloatAttribute(mesh: Mesh, attribute: number, count: number, itemSize: number, array: TypedArray): number
}
