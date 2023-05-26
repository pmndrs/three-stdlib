import { BufferGeometry, LoadingManager } from 'three'
import { Loader } from '../types/Loader'

export class PRWMLoader extends Loader {
  constructor(manager?: LoadingManager)

  load(
    url: string,
    onLoad: (geometry: BufferGeometry) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void,
  ): void
  loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<BufferGeometry>
  parse(data: ArrayBuffer): BufferGeometry

  static isBigEndianPlatform(): boolean
}
