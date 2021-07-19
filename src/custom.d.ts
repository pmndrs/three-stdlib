declare module 'mmd-parser' {
  export class CharsetEncoder {
    public s2uTable: { [key: string]: number }
  }
}

// DracoEncoderModule types
enum DracoGeometryAttributeType {
  INVALID = 'draco_GeometryAttribute::INVALID',
  POSITION = 'draco_GeometryAttribute::POSITION',
  NORMAL = 'draco_GeometryAttribute::NORMAL',
  COLOR = 'draco_GeometryAttribute::COLOR',
  TEX_COORD = 'draco_GeometryAttribute::TEX_COORD',
  GENERIC = 'draco_GeometryAttribute::GENERIC',
}
class Encoder {
  public SetSpeedOptions: (encodingSpeed: number, decodingSpeed: number) => void

  public SetEncodingMethod: (method: number) => void

  // type: number is index of DracoGeometryAttributeType
  public SetAttributeQuantization: (type: number, quantizationBits: number) => void

  public EncodeMeshToDracoBuffer: (mesh: Mesh, encodedData: DracoInt8Array) => number

  public EncodePointCloudToDracoBuffer: (
    pc: PointCloud,
    deduplicateValues: boolean,
    encodedData: DracoInt8Array,
  ) => number
}
interface IEncoder {
  new (): Encoder
}

class MeshBuilder {
  public AddFloatAttributeToMesh: (
    mesh: Mesh,
    type: DracoGeometryAttributeType,
    numVertices: number,
    numComponents: number,
    attValues: ArrayLike<number>,
  ) => void

  public AddFacesToMesh: (mesh: Mesh, numFaces: number, faces: ArrayLike<number>) => void
}
interface IMeshBuilder {
  new (): MeshBuilder
}

// Originally named Mesh, but changed the name to avoid conflicts with global.This.
class DracoMesh {}
interface IMesh {
  new (): DracoMesh
}

class PointCloudBuilder {
  public AddFloatAttribute: (
    mesh: Mesh,
    type: DracoGeometryAttributeType,
    numVertices: number,
    numComponents: number,
    attValues: ArrayLike<number>,
  ) => void
}

interface IPointCloudBuilder {
  new (): PointCloudBuilder
}

class PointCloud {}
interface IPointCloud {
  new (): PointCloud
}

class DracoInt8Array {
  public GetValue: (index: number) => number
}
interface IDracoInt8Array {
  new (): DracoInt8Array
}

type DracoEncoderModule = () => {
  Encoder: IEncoder
  MeshBuilder: IMeshBuilder
  Mesh: IMesh
  PointCloudBuilder: IPointCloudBuilder
  PointCloud: IPointCloud
  DracoInt8Array: IDracoInt8Array
  destroy: (arg: DracoInt8Array | Encoder | MeshBuilder | PointCloudBuilder | PointCloud) => void
} & typeof DracoGeometryAttributeType

declare const DracoEncoderModule: DracoEncoderModule
