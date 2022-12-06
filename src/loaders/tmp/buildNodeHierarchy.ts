import { GLTFObject, GLTFParser } from './'
import { Group, Matrix4, Skeleton } from 'three'

export function buildNodeHierarchy(
  nodeId: number,
  parentObject: Group,
  json: GLTFObject,
  parser: GLTFParser,
): Promise<any> {
  const nodeDef = json.nodes![nodeId]
  console.log(json.nodes, { nodeId })

  return parser
    .getDependency('node', nodeId)
    .then(function (node) {
      console.log({ node })

      if (nodeDef.skin === undefined) return node

      // build skeleton here as well

      let skinEntry

      return parser
        .getDependency('skin', nodeDef.skin)
        .then(function (skin) {
          skinEntry = skin

          const pendingJoints = []

          for (let i = 0, il = skinEntry.joints.length; i < il; i++) {
            pendingJoints.push(parser.getDependency('node', skinEntry.joints[i]))
          }

          return Promise.all(pendingJoints)
        })
        .then(function (jointNodes) {
          node.traverse(function (mesh) {
            if (!mesh.isMesh) return

            const bones = []
            const boneInverses = []

            for (let j = 0, jl = jointNodes.length; j < jl; j++) {
              const jointNode = jointNodes[j]

              if (jointNode) {
                bones.push(jointNode)

                const mat = new Matrix4()

                if (skinEntry.inverseBindMatrices !== undefined) {
                  mat.fromArray(skinEntry.inverseBindMatrices.array, j * 16)
                }

                boneInverses.push(mat)
              } else {
                console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', skinEntry.joints[j])
              }
            }

            mesh.bind(new Skeleton(bones, boneInverses), mesh.matrixWorld)
          })

          return node
        })
    })
    .then(function (node) {
      // build node hierachy

      parentObject.add(node)

      const pending = []

      if (nodeDef.children) {
        const children = nodeDef.children

        for (let i = 0, il = children.length; i < il; i++) {
          const child = children[i]
          pending.push(buildNodeHierarchy(child, node, json, parser))
        }
      }

      return Promise.all(pending)
    })
}
