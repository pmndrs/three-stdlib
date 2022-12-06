import { FrontSide, MeshStandardMaterial } from 'three'

/**
 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
 */
export function createDefaultMaterial(cache) {
  if (cache['DefaultMaterial'] === undefined) {
    cache['DefaultMaterial'] = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x000000,
      metalness: 1,
      roughness: 1,
      transparent: false,
      depthTest: true,
      side: FrontSide,
    })
  }

  return cache['DefaultMaterial']
}
