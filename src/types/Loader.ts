import * as THREE from 'three'

// https://github.com/pmndrs/three-stdlib/issues/237
export class Loader extends THREE.Loader {
  loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<any> {
    // @ts-ignore
    return super.loadAsync(url, onProgress)
  }
}
