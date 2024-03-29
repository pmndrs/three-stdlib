import { Loader, LoadingManager } from 'three'

export class TTFLoader extends Loader {
  constructor(manager?: LoadingManager)
  reversed: boolean

  load(
    url: string,
    onLoad: (json: object) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void,
  ): void
  loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<object>
  parse(arraybuffer: ArrayBuffer): object
}
