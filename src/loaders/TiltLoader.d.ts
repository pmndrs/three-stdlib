import { LoadingManager, Group } from 'three'
import { Loader } from '../types/Loader'

export class TiltLoader extends Loader {
  constructor(manager?: LoadingManager)

  load(
    url: string,
    onLoad: (object: Group) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void,
  ): void
  loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<Group>
  parse(data: ArrayBuffer): Group
}
