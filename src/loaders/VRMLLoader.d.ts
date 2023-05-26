import { Scene, LoadingManager } from 'three'
import { Loader } from '../types/Loader'

export class VRMLLoader extends Loader {
  constructor(manager?: LoadingManager)

  load(
    url: string,
    onLoad: (scene: Scene) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void,
  ): void
  loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<Scene>
  parse(data: string, path: string): Scene
}
