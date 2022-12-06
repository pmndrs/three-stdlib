import { Box3, BufferGeometry, Sphere, Vector3 } from 'three'
import { Primitive } from 'types/gltf'
import { ATTRIBUTES, assignExtrasToUserData, getNormalizedComponentScale, GLTFParser } from './'

/**
 * @param {BufferGeometry} geometry
 * @param {GLTF.Primitive} primitiveDef
 * @param {GLTFParser} parser
 * @return {Promise<BufferGeometry>}
 */
export function addPrimitiveAttributes(
  geometry: BufferGeometry,
  primitiveDef: Primitive,
  parser: GLTFParser,
): Promise<BufferGeometry> {
  const attributes = primitiveDef.attributes

  const pending = []

  function assignAttributeAccessor(accessorIndex, attributeName) {
    return parser.getDependency('accessor', accessorIndex).then(function (accessor) {
      geometry.setAttribute(attributeName, accessor)
    })
  }

  for (const gltfAttributeName in attributes) {
    const threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase()

    // Skip attributes already provided by e.g. Draco extension.
    if (threeAttributeName in geometry.attributes) continue

    pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName))
  }

  if (primitiveDef.indices !== undefined && !geometry.index) {
    const accessor = parser.getDependency('accessor', primitiveDef.indices).then(function (accessor) {
      geometry.setIndex(accessor)
    })

    pending.push(accessor)
  }

  assignExtrasToUserData(geometry, primitiveDef)

  computeBounds(geometry, primitiveDef, parser)

  return Promise.all(pending).then(function () {
    return primitiveDef.targets !== undefined ? addMorphTargets(geometry, primitiveDef.targets, parser) : geometry
  })
}

/**
 * @param {BufferGeometry} geometry
 * @param {GLTF.Primitive} primitiveDef
 * @param {GLTFParser} parser
 */
function computeBounds(geometry: BufferGeometry, primitiveDef: Primitive, parser: GLTFParser) {
  const attributes = primitiveDef.attributes

  const box = new Box3()

  if (attributes.POSITION !== undefined) {
    const accessor = parser.json.accessors[attributes.POSITION]

    const min = accessor.min
    const max = accessor.max

    // glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

    if (min !== undefined && max !== undefined) {
      box.set(new Vector3(min[0], min[1], min[2]), new Vector3(max[0], max[1], max[2]))

      if (accessor.normalized) {
        const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType])
        box.min.multiplyScalar(boxScale)
        box.max.multiplyScalar(boxScale)
      }
    } else {
      console.warn('THREE.GLTFLoader: Missing min/max properties for accessor POSITION.')

      return
    }
  } else {
    return
  }

  const targets = primitiveDef.targets

  if (targets !== undefined) {
    const maxDisplacement = new Vector3()
    const vector = new Vector3()

    for (let i = 0, il = targets.length; i < il; i++) {
      const target = targets[i]

      if (target.POSITION !== undefined) {
        const accessor = parser.json.accessors[target.POSITION]
        const min = accessor.min
        const max = accessor.max

        // glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

        if (min !== undefined && max !== undefined) {
          // we need to get max of absolute components because target weight is [-1,1]
          vector.setX(Math.max(Math.abs(min[0]), Math.abs(max[0])))
          vector.setY(Math.max(Math.abs(min[1]), Math.abs(max[1])))
          vector.setZ(Math.max(Math.abs(min[2]), Math.abs(max[2])))

          if (accessor.normalized) {
            const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType])
            vector.multiplyScalar(boxScale)
          }

          // Note: this assumes that the sum of all weights is at most 1. This isn't quite correct - it's more conservative
          // to assume that each target can have a max weight of 1. However, for some use cases - notably, when morph targets
          // are used to implement key-frame animations and as such only two are active at a time - this results in very large
          // boxes. So for now we make a box that's sometimes a touch too small but is hopefully mostly of reasonable size.
          maxDisplacement.max(vector)
        } else {
          console.warn('THREE.GLTFLoader: Missing min/max properties for accessor POSITION.')
        }
      }
    }

    // As per comment above this box isn't conservative, but has a reasonable size for a very large number of morph targets.
    box.expandByVector(maxDisplacement)
  }

  geometry.boundingBox = box

  const sphere = new Sphere()

  box.getCenter(sphere.center)
  sphere.radius = box.min.distanceTo(box.max) / 2

  geometry.boundingSphere = sphere
}

/**
 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#morph-targets
 *
 * @param {BufferGeometry} geometry
 * @param {Array<GLTF.Target>} targets
 * @param {GLTFParser} parser
 * @return {Promise<BufferGeometry>}
 */
function addMorphTargets(geometry: BufferGeometry, targets, parser: GLTFParser): Promise<BufferGeometry> {
  let hasMorphPosition = false
  let hasMorphNormal = false
  let hasMorphColor = false

  for (let i = 0, il = targets.length; i < il; i++) {
    const target = targets[i]

    if (target.POSITION !== undefined) hasMorphPosition = true
    if (target.NORMAL !== undefined) hasMorphNormal = true
    if (target.COLOR_0 !== undefined) hasMorphColor = true

    if (hasMorphPosition && hasMorphNormal && hasMorphColor) break
  }

  if (!hasMorphPosition && !hasMorphNormal && !hasMorphColor) return Promise.resolve(geometry)

  const pendingPositionAccessors = []
  const pendingNormalAccessors = []
  const pendingColorAccessors = []

  for (let i = 0, il = targets.length; i < il; i++) {
    const target = targets[i]

    if (hasMorphPosition) {
      const pendingAccessor =
        target.POSITION !== undefined ? parser.getDependency('accessor', target.POSITION) : geometry.attributes.position

      pendingPositionAccessors.push(pendingAccessor)
    }

    if (hasMorphNormal) {
      const pendingAccessor =
        target.NORMAL !== undefined ? parser.getDependency('accessor', target.NORMAL) : geometry.attributes.normal

      pendingNormalAccessors.push(pendingAccessor)
    }

    if (hasMorphColor) {
      const pendingAccessor =
        target.COLOR_0 !== undefined ? parser.getDependency('accessor', target.COLOR_0) : geometry.attributes.color

      pendingColorAccessors.push(pendingAccessor)
    }
  }

  return Promise.all([
    Promise.all(pendingPositionAccessors),
    Promise.all(pendingNormalAccessors),
    Promise.all(pendingColorAccessors),
  ]).then(function (accessors) {
    const morphPositions = accessors[0]
    const morphNormals = accessors[1]
    const morphColors = accessors[2]

    if (hasMorphPosition) geometry.morphAttributes.position = morphPositions
    if (hasMorphNormal) geometry.morphAttributes.normal = morphNormals
    if (hasMorphColor) geometry.morphAttributes.color = morphColors
    geometry.morphTargetsRelative = true

    return geometry
  })
}
