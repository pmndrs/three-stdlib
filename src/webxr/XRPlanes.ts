import { BoxGeometry, Matrix4, WebGLRenderer, Mesh, MeshBasicMaterial, Object3D } from 'three'

const geometry = /* @__PURE__ */ new BoxGeometry()
const matrix = /* @__PURE__ */ new Matrix4()

class XRPlanes extends Object3D {
  public renderer: WebGLRenderer
  readonly currentPlanes = new Map<XRPlane, Mesh<BoxGeometry, MeshBasicMaterial>>()

  constructor(renderer: WebGLRenderer) {
    super()

    this.renderer = renderer
    this._onPlanesUpdate = this._onPlanesUpdate.bind(this)
    this.renderer.xr.addEventListener('planesdetected', this._onPlanesUpdate)
  }

  private _onPlanesUpdate() {
    // @ts-ignore https://github.com/mrdoob/three.js/pull/22260
    const frame = this.renderer.xr.getFrame() as XRFrame

    // Event signature changed from XRPlaneSet => XRFRame
    // https://github.com/mrdoob/three.js/pull/24855
    // https://github.com/mrdoob/three.js/pull/26098
    this.update(frame)
  }

  update(frame: XRFrame): void {
    const planes = (frame as any).detectedPlanes as XRPlaneSet

    for (const [plane, mesh] of this.currentPlanes) {
      if (!planes.has(plane)) {
        mesh.material.dispose()
        this.remove(mesh)
        this.currentPlanes.delete(plane)
      }
    }

    const referenceSpace = this.renderer.xr.getReferenceSpace()
    for (const plane of planes) {
      if (!this.currentPlanes.has(plane)) {
        const pose = frame.getPose(plane.planeSpace, referenceSpace!)!

        matrix.fromArray(pose.transform.matrix)

        let minX = Number.MAX_SAFE_INTEGER
        let maxX = Number.MIN_SAFE_INTEGER
        let minZ = Number.MAX_SAFE_INTEGER
        let maxZ = Number.MIN_SAFE_INTEGER

        for (const point of plane.polygon) {
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
        this.currentPlanes.set(plane, mesh)
      }
    }
  }

  dispose(): void {
    geometry.dispose()

    for (const [plane, mesh] of this.currentPlanes) {
      mesh.material.dispose()
      this.remove(mesh)
      this.currentPlanes.delete(plane)
    }

    this.renderer.xr.removeEventListener('planesdetected', this._onPlanesUpdate)
  }
}

export { XRPlanes }
