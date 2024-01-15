import {
  BufferAttribute,
  BufferGeometry,
  InterleavedBufferAttribute,
  Mesh,
  Object3D,
  SkinnedMesh,
  Vector3,
} from 'three'

export interface STLExporterOptionsBinary {
  binary: true
}

export interface STLExporterOptionsString {
  binary?: false
}

export interface STLExporterOptions {
  binary?: boolean
}

const isMesh = (object: unknown): object is Mesh => (object as any).isMesh

export class STLExporter {
  private binary = false

  private output: string | DataView = ''
  private offset: number = 80 // skip header

  private objects: { object3d: Object3D; geometry: BufferGeometry }[] = []
  private triangles: number = 0

  private vA = new Vector3()
  private vB = new Vector3()
  private vC = new Vector3()
  private cb = new Vector3()
  private ab = new Vector3()
  private normal = new Vector3()

  parse(scene: Object3D, options: STLExporterOptionsBinary): DataView
  parse(scene: Object3D, options?: STLExporterOptionsString): string
  parse(scene: Object3D, options?: STLExporterOptions): string | DataView {
    this.binary = options?.binary !== undefined ? options?.binary : false

    scene.traverse((object: Object3D) => {
      if (isMesh(object)) {
        const geometry = object.geometry

        if (!geometry.isBufferGeometry) {
          throw new Error('THREE.STLExporter: Geometry is not of type THREE.BufferGeometry.')
        }

        const index = geometry.index
        const positionAttribute = geometry.getAttribute('position') || null
        if (!positionAttribute) return

        this.triangles += index !== null ? index.count / 3 : positionAttribute.count / 3

        this.objects.push({
          object3d: object,
          geometry: geometry,
        })
      }
    })

    if (this.binary) {
      const bufferLength = this.triangles * 2 + this.triangles * 3 * 4 * 4 + 80 + 4
      const arrayBuffer = new ArrayBuffer(bufferLength)
      this.output = new DataView(arrayBuffer)
      this.output.setUint32(this.offset, this.triangles, true)
      this.offset += 4
    } else {
      this.output = ''
      this.output += 'solid exported\n'
    }

    for (let i = 0, il = this.objects.length; i < il; i++) {
      const object = this.objects[i].object3d
      const geometry = this.objects[i].geometry

      const index = geometry.index
      const positionAttribute = geometry.getAttribute('position')

      if (index !== null) {
        // indexed geometry
        for (let j = 0; j < index.count; j += 3) {
          const a = index.getX(j + 0)
          const b = index.getX(j + 1)
          const c = index.getX(j + 2)

          this.writeFace(a, b, c, positionAttribute, object as SkinnedMesh)
        }
      } else {
        // non-indexed geometry
        for (let j = 0; j < positionAttribute.count; j += 3) {
          const a = j + 0
          const b = j + 1
          const c = j + 2

          this.writeFace(a, b, c, positionAttribute, object as SkinnedMesh)
        }
      }
    }

    if (!this.binary) {
      this.output += 'endsolid exported\n'
    }

    return this.output
  }

  private writeFace(
    a: number,
    b: number,
    c: number,
    positionAttribute: BufferAttribute | InterleavedBufferAttribute,
    object: SkinnedMesh,
  ): void {
    this.vA.fromBufferAttribute(positionAttribute, a)
    this.vB.fromBufferAttribute(positionAttribute, b)
    this.vC.fromBufferAttribute(positionAttribute, c)

    if (object.isSkinnedMesh) {
      const mesh = object as Omit<SkinnedMesh, 'boneTransform' | 'applyBoneTransform'> &
        (
          | {
              boneTransform(index: number, vector: Vector3): Vector3
            }
          | {
              applyBoneTransform(index: number, vector: Vector3): Vector3
            }
        )

      // r151 https://github.com/mrdoob/three.js/pull/25586
      if ('applyBoneTransform' in mesh) {
        mesh.applyBoneTransform(a, this.vA)
        mesh.applyBoneTransform(b, this.vB)
        mesh.applyBoneTransform(c, this.vC)
      } else {
        mesh.boneTransform(a, this.vA)
        mesh.boneTransform(b, this.vB)
        mesh.boneTransform(c, this.vC)
      }
    }

    this.vA.applyMatrix4(object.matrixWorld)
    this.vB.applyMatrix4(object.matrixWorld)
    this.vC.applyMatrix4(object.matrixWorld)

    this.writeNormal(this.vA, this.vB, this.vC)

    this.writeVertex(this.vA)
    this.writeVertex(this.vB)
    this.writeVertex(this.vC)

    if (this.binary && this.output instanceof DataView) {
      this.output.setUint16(this.offset, 0, true)
      this.offset += 2
    } else {
      this.output += '\t\tendloop\n'
      this.output += '\tendfacet\n'
    }
  }

  private writeNormal(vA: Vector3, vB: Vector3, vC: Vector3): void {
    this.cb.subVectors(vC, vB)
    this.ab.subVectors(vA, vB)
    this.cb.cross(this.ab).normalize()

    this.normal.copy(this.cb).normalize()

    if (this.binary && this.output instanceof DataView) {
      this.output.setFloat32(this.offset, this.normal.x, true)
      this.offset += 4
      this.output.setFloat32(this.offset, this.normal.y, true)
      this.offset += 4
      this.output.setFloat32(this.offset, this.normal.z, true)
      this.offset += 4
    } else {
      this.output += `\tfacet normal ${this.normal.x} ${this.normal.y} ${this.normal.z}\n`
      this.output += '\t\touter loop\n'
    }
  }

  private writeVertex(vertex: Vector3): void {
    if (this.binary && this.output instanceof DataView) {
      this.output.setFloat32(this.offset, vertex.x, true)
      this.offset += 4
      this.output.setFloat32(this.offset, vertex.y, true)
      this.offset += 4
      this.output.setFloat32(this.offset, vertex.z, true)
      this.offset += 4
    } else {
      this.output += `\t\t\tvertex ${vertex.x} ${vertex.y} ${vertex.z}\n`
    }
  }
}
