import { LoadingManager, DataTextureLoader, TextureDataType, PixelFormat } from 'three'

export interface EXR {
  header: object
  width: number
  height: number
  data: Float32Array
  format: PixelFormat
  type: TextureDataType
}

export class EXRLoader extends DataTextureLoader {
  constructor(manager?: LoadingManager)
  type: TextureDataType

  // @ts-ignore
  load(
    url: string,
    onLoad: (geometry: EXR) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void,
  ): void
  // @ts-ignore
  loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<EXR>
  parse(buffer: ArrayBuffer): EXR
  setDataType(type: TextureDataType): this
}
