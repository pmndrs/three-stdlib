import { BoxGeometry, Matrix4, WebGLRenderer, Mesh, MeshBasicMaterial, Object3D } from 'three'

const geometry = /* @__PURE__ */ new BoxGeometry()
const matrix = /* @__PURE__ */ new Matrix4()

class XRPlanes extends Object3D {
  constructor(renderer: WebGLRenderer) {
    super()

    const currentPlanes = new Map()

    renderer.xr.addEventListener('planesdetected', (event) => {
      const frame = event.data
      const planes = frame.detectedPlanes

      const referenceSpace = renderer.xr.getReferenceSpace()

      for (const [plane, mesh] of currentPlanes) {
        if (planes.has(plane) === false) {
          mesh.material.dispose()
          this.remove(mesh)

          currentPlanes.delete(plane)
        }
      }

      for (const plane of planes) {
        if (currentPlanes.has(plane) === false) {
          const pose = frame.getPose(plane.planeSpace, referenceSpace)
          matrix.fromArray(pose.transform.matrix)

          const polygon = plane.polygon

          let minX = Number.MAX_SAFE_INTEGER
          let maxX = Number.MIN_SAFE_INTEGER
          let minZ = Number.MAX_SAFE_INTEGER
          let maxZ = Number.MIN_SAFE_INTEGER

          for (const point of polygon) {
            minX = Math.min(minX, point.x)
            maxX = Math.max(maxX, point.x)
            minZ = Math.min(minZ, point.z)
            maxZ = Math.max(maxZ, point.z)
          }

          const width = maxX - minX
          const height = maxZ - minZ

          const material = new MeshBasicMaterial({ color: 0xffffff * Math.random() })

          const mesh = new Mesh(geometry, material)
          mesh.position.setFromMatrixPosition(matrix)
          mesh.quaternion.setFromRotationMatrix(matrix)
          mesh.scale.set(width, 0.01, height)
          this.add(mesh)

          currentPlanes.set(plane, mesh)
        }
      }
    })
  }
}

export { XRPlanes }
