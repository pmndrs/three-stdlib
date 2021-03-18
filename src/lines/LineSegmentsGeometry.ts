import {
  Box3,
  BufferGeometry,
  BufferAttribute,
  Float32BufferAttribute,
  InstancedBufferGeometry,
  InstancedInterleavedBuffer,
  InterleavedBufferAttribute,
  LineSegments,
  Matrix4,
  Mesh,
  Sphere,
  Vector3,
  WireframeGeometry,
} from 'three'

class LineSegmentsGeometry extends InstancedBufferGeometry {
  isLineSegmentsGeometry = true
  type = 'LineSegmentsGeometry'

  boundingBox: Box3 | null = null
  boundingSphere: Sphere | null = null

  constructor() {
    super()

    const positions = [-1, 2, 0, 1, 2, 0, -1, 1, 0, 1, 1, 0, -1, 0, 0, 1, 0, 0, -1, -1, 0, 1, -1, 0]
    const uvs = [-1, 2, 1, 2, -1, 1, 1, 1, -1, -1, 1, -1, -1, -2, 1, -2]
    const index = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5]

    this.setIndex(index)
    this.setAttribute('position', new Float32BufferAttribute(positions, 3))
    this.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  }

  applyMatrix4 = (matrix: Matrix4): this => {
    const start = this.attributes.instanceStart
    const end = this.attributes.instanceEnd

    if (start !== undefined) {
      start.applyMatrix4(matrix)

      end.applyMatrix4(matrix)

      start.needsUpdate = true
    }

    if (this.boundingBox !== null) {
      this.computeBoundingBox()
    }

    if (this.boundingSphere !== null) {
      this.computeBoundingSphere()
    }

    return this
  }

  setPositions = (array: number[] | Float32Array): this => {
    let lineSegments

    if (array instanceof Float32Array) {
      lineSegments = array
    } else if (Array.isArray(array)) {
      lineSegments = new Float32Array(array)
    } else {
      console.error('LineSegmentsGeometry.setPosition requires either a Float32Array or regular array of numbers')
      return this
    }

    const instanceBuffer = new InstancedInterleavedBuffer(lineSegments, 6, 1) // xyz, xyz

    this.setAttribute('instanceStart', new InterleavedBufferAttribute(instanceBuffer, 3, 0)) // xyz
    this.setAttribute('instanceEnd', new InterleavedBufferAttribute(instanceBuffer, 3, 3)) // xyz

    //

    this.computeBoundingBox()
    this.computeBoundingSphere()

    return this
  }

  setColors = (array: number[] | Float32Array): this => {
    let colors

    if (array instanceof Float32Array) {
      colors = array
    } else if (Array.isArray(array)) {
      colors = new Float32Array(array)
    } else {
      console.error('LineSegmentsGeometry.setColors requires either a Float32Array or regular array of numbers')
      return this
    }

    const instanceColorBuffer = new InstancedInterleavedBuffer(colors, 6, 1) // rgb, rgb

    this.setAttribute('instanceColorStart', new InterleavedBufferAttribute(instanceColorBuffer, 3, 0)) // rgb
    this.setAttribute('instanceColorEnd', new InterleavedBufferAttribute(instanceColorBuffer, 3, 3)) // rgb

    return this
  }

  fromWireframeGeometry = (geometry: BufferGeometry): this => {
    this.setPositions(Array.from(geometry.attributes.position.array))

    return this
  }

  fromEdgesGeometry = (geometry: BufferGeometry): this => {
    this.setPositions(Array.from(geometry.attributes.position.array))

    return this
  }

  fromMesh = (mesh: Mesh): this => {
    this.fromWireframeGeometry(new WireframeGeometry(mesh.geometry))

    return this
  }

  fromLineSegments = (lineSegments: LineSegments): this => {
    const geometry = lineSegments.geometry

    if (geometry.isBufferGeometry) {
      this.setPositions(Array.from(geometry.attributes.position.array)) // assumes non-indexed
    }

    // set colors, maybe

    return this
  }

  private box = new Box3()

  computeBoundingBox = (): void => {
    if (this.boundingBox === null) {
      this.boundingBox = new Box3()
    }

    const start = this.attributes.instanceStart as BufferAttribute
    const end = this.attributes.instanceEnd as BufferAttribute

    if (start !== undefined && end !== undefined) {
      this.boundingBox.setFromBufferAttribute(start)

      this.box.setFromBufferAttribute(end)

      this.boundingBox.union(this.box)
    }
  }

  private vector = new Vector3()

  computeBoundingSphere = (): void => {
    if (this.boundingSphere === null) {
      this.boundingSphere = new Sphere()
    }

    if (this.boundingBox === null) {
      this.computeBoundingBox()
    }

    const start = this.attributes.instanceStart
    const end = this.attributes.instanceEnd

    if (start !== undefined && end !== undefined) {
      const center = this.boundingSphere.center

      if (this.boundingBox) {
        this.boundingBox.getCenter(center)
      }

      let maxRadiusSq = 0

      for (let i = 0, il = start.count; i < il; i++) {
        this.vector.fromBufferAttribute(start, i)
        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(this.vector))

        this.vector.fromBufferAttribute(end, i)
        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(this.vector))
      }

      this.boundingSphere.radius = Math.sqrt(maxRadiusSq)

      if (isNaN(this.boundingSphere.radius)) {
        console.error(
          'THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.',
          this,
        )
      }
    }
  }

  toJSON = (): void => {
    // todo
  }

  applyMatrix = (matrix: Matrix4): this => {
    console.warn('THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4().')

    return this.applyMatrix4(matrix)
  }
}

export { LineSegmentsGeometry }
