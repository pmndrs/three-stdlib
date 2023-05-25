import { WebGLRenderer } from 'three'

export class RoughnessMipmapper {
  constructor(renderer: WebGLRenderer)

  generateMipmaps(material: THREE.Material): void
  dispose(): void
}
