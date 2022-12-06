import { Extra, Result } from './types'
import { Bone, BufferGeometry, Group, Material, Object3D, OrthographicCamera, PerspectiveCamera } from 'three'

/**
 * @param {Object3D|Material|BufferGeometry} object
 * @param {GLTF.definition} gltfDef
 */
export function assignExtrasToUserData(
  object: Group | Object3D | Bone | Material | BufferGeometry | PerspectiveCamera | OrthographicCamera | Result,
  gltfDef: Extra,
): void {
  if (gltfDef.extras !== undefined) {
    if (typeof gltfDef.extras === 'object') {
      Object.assign(object.userData, gltfDef.extras)
    } else {
      console.warn('THREE.GLTFLoader: Ignoring primitive type .extras, ' + gltfDef.extras)
    }
  }
}
