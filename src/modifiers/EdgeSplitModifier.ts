import { BufferAttribute, BufferGeometry, Vector3 } from 'three'
import * as BufferGeometryUtils from '../utils/BufferGeometryUtils'

import { TypedArray } from '../types/shared'

interface EdgeSplitToGroupsResult {
  splitGroup: number[]
  currentGroup: number[]
}

interface SplitIndexes {
  original: number
  indexes: number[]
}

class EdgeSplitModifier {
  private A = new Vector3()
  private B = new Vector3()
  private C = new Vector3()

  private positions: ArrayLike<number> = []
  private normals: Float32Array = new Float32Array()
  private indexes: ArrayLike<number> = []
  private pointToIndexMap: number[][] = []
  private splitIndexes: SplitIndexes[] = []
  private oldNormals: ArrayLike<number> = []

  constructor() {}

  private computeNormals = (): void => {
    this.normals = new Float32Array(this.indexes.length * 3)

    for (let i = 0; i < this.indexes.length; i += 3) {
      let index = this.indexes[i]

      this.A.set(this.positions[3 * index], this.positions[3 * index + 1], this.positions[3 * index + 2])

      index = this.indexes[i + 1]
      this.B.set(this.positions[3 * index], this.positions[3 * index + 1], this.positions[3 * index + 2])

      index = this.indexes[i + 2]
      this.C.set(this.positions[3 * index], this.positions[3 * index + 1], this.positions[3 * index + 2])

      this.C.sub(this.B)
      this.A.sub(this.B)

      const normal = this.C.cross(this.A).normalize()

      for (let j = 0; j < 3; j++) {
        this.normals[3 * (i + j)] = normal.x
        this.normals[3 * (i + j) + 1] = normal.y
        this.normals[3 * (i + j) + 2] = normal.z
      }
    }
  }

  private mapPositionsToIndexes = (): void => {
    this.pointToIndexMap = Array(this.positions.length / 3)

    for (let i = 0; i < this.indexes.length; i++) {
      const index = this.indexes[i]

      if (this.pointToIndexMap[index] == null) {
        this.pointToIndexMap[index] = []
      }

      this.pointToIndexMap[index].push(i)
    }
  }

  private edgeSplitToGroups = (indexes: number[], cutOff: number, firstIndex: number): EdgeSplitToGroupsResult => {
    this.A.set(
      this.normals[3 * firstIndex],
      this.normals[3 * firstIndex + 1],
      this.normals[3 * firstIndex + 2],
    ).normalize()

    const result: EdgeSplitToGroupsResult = {
      splitGroup: [],
      currentGroup: [firstIndex],
    }

    for (let j of indexes) {
      if (j !== firstIndex) {
        this.B.set(this.normals[3 * j], this.normals[3 * j + 1], this.normals[3 * j + 2]).normalize()

        if (this.B.dot(this.A) < cutOff) {
          result.splitGroup.push(j)
        } else {
          result.currentGroup.push(j)
        }
      }
    }

    return result
  }

  private edgeSplit = (indexes: number[], cutOff: number, original: number | null = null): void => {
    if (indexes.length === 0) return

    const groupResults: EdgeSplitToGroupsResult[] = []

    for (let index of indexes) {
      groupResults.push(this.edgeSplitToGroups(indexes, cutOff, index))
    }

    let result = groupResults[0]

    for (let groupResult of groupResults) {
      if (groupResult.currentGroup.length > result.currentGroup.length) {
        result = groupResult
      }
    }

    if (original != null) {
      this.splitIndexes.push({
        original,
        indexes: result.currentGroup,
      })
    }

    if (result.splitGroup.length) {
      this.edgeSplit(result.splitGroup, cutOff, original || result.currentGroup[0])
    }
  }

  public modify = (geometry: BufferGeometry, cutOffAngle: number, tryKeepNormals = true): BufferGeometry => {
    let hadNormals = false

    if (geometry.attributes.normal) {
      hadNormals = true

      geometry = geometry.clone()

      if (tryKeepNormals === true && geometry.index !== null) {
        this.oldNormals = geometry.attributes.normal.array
      }

      geometry.deleteAttribute('normal')
    }

    if (geometry.index == null) {
      if (BufferGeometryUtils === undefined) {
        throw 'THREE.EdgeSplitModifier relies on BufferGeometryUtils'
      }

      geometry = BufferGeometryUtils.mergeVertices(geometry)
    }

    this.indexes = (geometry.index as BufferAttribute).array
    this.positions = geometry.getAttribute('position').array

    this.computeNormals()
    this.mapPositionsToIndexes()

    this.splitIndexes = []

    for (let vertexIndexes of this.pointToIndexMap) {
      this.edgeSplit(vertexIndexes, Math.cos(cutOffAngle) - 0.001)
    }

    const newAttributes: {
      [key: string]: BufferAttribute
    } = {}
    for (let name of Object.keys(geometry.attributes)) {
      const oldAttribute = geometry.attributes[name]
      const newArray = (oldAttribute.array as TypedArray).constructor(
        (this.indexes.length + this.splitIndexes.length) * oldAttribute.itemSize,
      )

      newArray.set(oldAttribute.array)
      newAttributes[name] = new BufferAttribute(newArray, oldAttribute.itemSize, oldAttribute.normalized)
    }

    const newIndexes = new Uint32Array(this.indexes.length)
    newIndexes.set(this.indexes)

    for (let i = 0; i < this.splitIndexes.length; i++) {
      const split = this.splitIndexes[i]
      const index = this.indexes[split.original]

      for (let attribute of Object.values(newAttributes)) {
        for (let j = 0; j < attribute.itemSize; j++) {
          // @ts-expect-error ArrayLike can't be mutated, but this works – https://github.com/three-types/three-ts-types/issues/35
          attribute.array[(indexes.length + i) * attribute.itemSize + j] =
            attribute.array[index * attribute.itemSize + j]
        }
      }

      for (let j of split.indexes) {
        newIndexes[j] = this.indexes.length + i
      }
    }

    geometry = new BufferGeometry()
    geometry.setIndex(new BufferAttribute(newIndexes, 1))

    for (let name of Object.keys(newAttributes)) {
      geometry.setAttribute(name, newAttributes[name])
    }

    if (hadNormals) {
      geometry.computeVertexNormals()

      if (this.oldNormals !== null) {
        const changedNormals = new Array(this.oldNormals.length / 3).fill(false)

        for (let splitData of this.splitIndexes) changedNormals[splitData.original] = true

        for (let i = 0; i < changedNormals.length; i++) {
          if (changedNormals[i] === false) {
            for (let j = 0; j < 3; j++) {
              // @ts-expect-error ArrayLike can't be mutated, but this works – https://github.com/three-types/three-ts-types/issues/35
              geometry.attributes.normal.array[3 * i + j] = this.oldNormals[3 * i + j]
            }
          }
        }
      }
    }

    return geometry
  }
}

export { EdgeSplitModifier }
