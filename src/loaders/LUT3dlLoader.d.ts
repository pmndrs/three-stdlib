import { Loader, LoadingManager, DataTexture, Texture } from 'three'

export interface LUT3dlResult {
  size: number
  texture: DataTexture
  texture3D: Texture // Data3DTexture
}

export class LUT3dlLoader extends Loader {
  constructor(manager?: LoadingManager)

  load(
    url: string,
    onLoad: (result: LUT3dlResult) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: Error) => void,
  ): any
  loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<LUT3dlResult>
  parse(data: string): LUT3dlResult
}
