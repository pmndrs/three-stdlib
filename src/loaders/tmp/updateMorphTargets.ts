import { Mesh } from 'three'
import { MeshDef } from 'types/gltf'

/**
 * @param {Mesh} mesh
 * @param {GLTF.Mesh} meshDef
 */
export function updateMorphTargets(mesh: Mesh, meshDef: MeshDef) {
  mesh.updateMorphTargets()

  if (meshDef.weights !== undefined) {
    for (let i = 0, il = meshDef.weights.length; i < il; i++) {
      mesh.morphTargetInfluences[i] = meshDef.weights[i]
    }
  }

  // .extras has user-defined data, so check that .extras.targetNames is an array.
  if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {
    const targetNames = meshDef.extras.targetNames

    if (mesh.morphTargetInfluences.length === targetNames.length) {
      mesh.morphTargetDictionary = {}

      for (let i = 0, il = targetNames.length; i < il; i++) {
        mesh.morphTargetDictionary[targetNames[i]] = i
      }
    } else {
      console.warn('THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.')
    }
  }
}
