import { Bone, Group, Material, Object3D } from 'three'
import { Extension, Extensions, Result } from './types'

export function addUnknownExtensionsToUserData(
  knownExtensions: Extension,
  object: Group | Object3D | Bone | Material | Result,
  objectDef: Extensions,
): void {
  // Add unknown glTF extensions to an object's userData.

  for (const name in objectDef.extensions) {
    if (knownExtensions[name] === undefined) {
      object.userData.gltfExtensions = object.userData.gltfExtensions || {}
      object.userData.gltfExtensions[name] = objectDef.extensions[name]
    }
  }
}
