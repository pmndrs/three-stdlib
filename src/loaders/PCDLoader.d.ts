import { Loader, Points, LoadingManager } from 'three'

export class PCDLoader extends Loader {
  constructor(manager?: LoadingManager)
  littleEndian: boolean

  load(
    url: string,
    onLoad: (points: Points) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void,
  ): void
  loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<Points>
  parse(data: ArrayBuffer | string, url: string): Points
}
