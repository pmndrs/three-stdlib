import { LoadingManager, Scene } from 'three'
import { Loader } from '../types/Loader'

export interface Collada {
  kinematics: object
  library: object
  scene: Scene
}

export class ColladaLoader extends Loader {
  constructor(manager?: LoadingManager)

  load(
    url: string,
    onLoad: (collada: Collada) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void,
  ): void
  loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<Collada>
  parse(text: string, path: string): Collada
}
