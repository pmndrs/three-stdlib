import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three'
import * as BufferGeometryUtils from '../utils/BufferGeometryUtils'

const cb = new Vector3(),
  ab = new Vector3()

function pushIfUnique<TItem>(array: TItem[], object: TItem) {
  if (array.indexOf(object) === -1) array.push(object)
}

function removeFromArray<TItem>(array: TItem[], object: TItem) {
  const k = array.indexOf(object)
  if (k > -1) array.splice(k, 1)
}

class Vertex {
  public position: Vector3
  private id: number

  public faces: Triangle[]
  public neighbors: Vertex[]

  public collapseCost: number
  public collapseNeighbor: null | Vertex

  public minCost: number = 0
  public totalCost: number = 0
  public costCount: number = 0

  constructor(v: Vector3, id: number) {
    this.position = v
    this.id = id // old index id

    this.faces = [] // faces vertex is connected
    this.neighbors = [] // neighbouring vertices aka "adjacentVertices"

    // these will be computed in computeEdgeCostAtVertex()
    this.collapseCost = 0 // cost of collapsing this vertex, the less the better. aka objdist
    this.collapseNeighbor = null // best candinate for collapsing
  }

  addUniqueNeighbor(vertex: Vertex): void {
    pushIfUnique(this.neighbors, vertex)
  }

  removeIfNonNeighbor(n: Vertex): void {
    const neighbors = this.neighbors
    const faces = this.faces

    const offset = neighbors.indexOf(n)
    if (offset === -1) return
    for (let i = 0; i < faces.length; i++) {
      if (faces[i].hasVertex(n)) return
    }

    neighbors.splice(offset, 1)
  }
}

// we use a triangle class to represent structure of face slightly differently
class Triangle {
  private a: number
  private b: number
  private c: Number

  v1: Vertex
  v2: Vertex
  v3: Vertex

  public normal = new Vector3()

  constructor(v1: Vertex, v2: Vertex, v3: Vertex, a: number, b: number, c: number) {
    this.a = a
    this.b = b
    this.c = c

    this.v1 = v1
    this.v2 = v2
    this.v3 = v3

    this.computeNormal()

    v1.faces.push(this)
    v1.addUniqueNeighbor(v2)
    v1.addUniqueNeighbor(v3)

    v2.faces.push(this)
    v2.addUniqueNeighbor(v1)
    v2.addUniqueNeighbor(v3)

    v3.faces.push(this)
    v3.addUniqueNeighbor(v1)
    v3.addUniqueNeighbor(v2)
  }

  private computeNormal(): void {
    const vA = this.v1.position
    const vB = this.v2.position
    const vC = this.v3.position

    cb.subVectors(vC, vB)
    ab.subVectors(vA, vB)
    cb.cross(ab).normalize()

    this.normal.copy(cb)
  }

  public hasVertex(v: Vertex): boolean {
    return v === this.v1 || v === this.v2 || v === this.v3
  }

  public replaceVertex(oldv: Vertex, newv: Vertex): void {
    if (oldv === this.v1) this.v1 = newv
    else if (oldv === this.v2) this.v2 = newv
    else if (oldv === this.v3) this.v3 = newv

    removeFromArray(oldv.faces, this)
    newv.faces.push(this)

    oldv.removeIfNonNeighbor(this.v1)
    this.v1.removeIfNonNeighbor(oldv)

    oldv.removeIfNonNeighbor(this.v2)
    this.v2.removeIfNonNeighbor(oldv)

    oldv.removeIfNonNeighbor(this.v3)
    this.v3.removeIfNonNeighbor(oldv)

    this.v1.addUniqueNeighbor(this.v2)
    this.v1.addUniqueNeighbor(this.v3)

    this.v2.addUniqueNeighbor(this.v1)
    this.v2.addUniqueNeighbor(this.v3)

    this.v3.addUniqueNeighbor(this.v1)
    this.v3.addUniqueNeighbor(this.v2)

    this.computeNormal()
  }
}

/**
 *	Simplification Geometry Modifier
 *    - based on code and technique
 *	  - by Stan Melax in 1998
 *	  - Progressive Mesh type Polygon Reduction Algorithm
 *    - http://www.melax.com/polychop/
 */

class SimplifyModifier {
  constructor() {}

  private computeEdgeCollapseCost = (u: Vertex, v: Vertex) => {
    // if we collapse edge uv by moving u to v then how
    // much different will the model change, i.e. the "error".

    const edgelength = v.position.distanceTo(u.position)
    let curvature = 0

    const sideFaces = []
    let i,
      il = u.faces.length,
      face,
      sideFace

    // find the "sides" triangles that are on the edge uv
    for (i = 0; i < il; i++) {
      face = u.faces[i]

      if (face.hasVertex(v)) {
        sideFaces.push(face)
      }
    }

    // use the triangle facing most away from the sides
    // to determine our curvature term
    for (i = 0; i < il; i++) {
      let minCurvature = 1
      face = u.faces[i]

      for (let j = 0; j < sideFaces.length; j++) {
        sideFace = sideFaces[j]
        // use dot product of face normals.
        const dotProd = face.normal.dot(sideFace.normal)
        minCurvature = Math.min(minCurvature, (1.001 - dotProd) / 2)
      }

      curvature = Math.max(curvature, minCurvature)
    }

    // crude approach in attempt to preserve borders
    // though it seems not to be totally correct
    const borders = 0
    if (sideFaces.length < 2) {
      // we add some arbitrary cost for borders,
      // borders += 10;
      curvature = 1
    }

    const amt = edgelength * curvature + borders

    return amt
  }

  private removeVertex(v: Vertex, vertices: Vertex[]) {
    console.assert(v.faces.length === 0)

    while (v.neighbors.length) {
      const n = v.neighbors.pop() as Vertex
      removeFromArray(n.neighbors, v)
    }

    removeFromArray(vertices, v)
  }

  private computeEdgeCostAtVertex = (v: Vertex) => {
    // compute the edge collapse cost for all edges that start
    // from vertex v.  Since we are only interested in reducing
    // the object by selecting the min cost edge at each step, we
    // only cache the cost of the least cost edge at this vertex
    // (in member variable collapse) as well as the value of the
    // cost (in member variable collapseCost).

    if (v.neighbors.length === 0) {
      // collapse if no neighbors.
      v.collapseNeighbor = null
      v.collapseCost = -0.01

      return
    }

    v.collapseCost = 100000
    v.collapseNeighbor = null

    // search all neighboring edges for "least cost" edge
    for (let i = 0; i < v.neighbors.length; i++) {
      const collapseCost = this.computeEdgeCollapseCost(v, v.neighbors[i])

      if (!v.collapseNeighbor) {
        v.collapseNeighbor = v.neighbors[i]
        v.collapseCost = collapseCost
        v.minCost = collapseCost
        v.totalCost = 0
        v.costCount = 0
      }

      v.costCount++
      v.totalCost += collapseCost

      if (collapseCost < v.minCost) {
        v.collapseNeighbor = v.neighbors[i]
        v.minCost = collapseCost
      }
    }

    // we average the cost of collapsing at this vertex
    v.collapseCost = v.totalCost / v.costCount
    // v.collapseCost = v.minCost;
  }

  private removeFace = (f: Triangle, faces: Triangle[]) => {
    removeFromArray(faces, f)

    if (f.v1) removeFromArray(f.v1.faces, f)
    if (f.v2) removeFromArray(f.v2.faces, f)
    if (f.v3) removeFromArray(f.v3.faces, f)

    // TODO optimize this!
    const vs = [f.v1, f.v2, f.v3]
    let v1, v2

    for (let i = 0; i < 3; i++) {
      v1 = vs[i]
      v2 = vs[(i + 1) % 3]

      if (!v1 || !v2) continue

      v1.removeIfNonNeighbor(v2)
      v2.removeIfNonNeighbor(v1)
    }
  }

  private collapse = (vertices: Vertex[], faces: Triangle[], u: Vertex, v: Vertex) => {
    // u and v are pointers to vertices of an edge

    // Collapse the edge uv by moving vertex u onto v

    if (!v) {
      // u is a vertex all by itself so just delete it..
      this.removeVertex(u, vertices)
      return
    }

    let i
    const tmpVertices = []

    for (i = 0; i < u.neighbors.length; i++) {
      tmpVertices.push(u.neighbors[i])
    }

    // delete triangles on edge uv:
    for (i = u.faces.length - 1; i >= 0; i--) {
      if (u.faces[i].hasVertex(v)) {
        this.removeFace(u.faces[i], faces)
      }
    }

    // update remaining triangles to have v instead of u
    for (i = u.faces.length - 1; i >= 0; i--) {
      u.faces[i].replaceVertex(u, v)
    }

    this.removeVertex(u, vertices)

    // recompute the edge collapse costs in neighborhood
    for (i = 0; i < tmpVertices.length; i++) {
      this.computeEdgeCostAtVertex(tmpVertices[i])
    }
  }

  private minimumCostEdge = (vertices: Vertex[]) => {
    // O(n * n) approach. TODO optimize this

    let least = vertices[0]

    for (let i = 0; i < vertices.length; i++) {
      if (vertices[i].collapseCost < least.collapseCost) {
        least = vertices[i]
      }
    }

    return least
  }

  modify = (geometry: BufferGeometry, count: number) => {
    geometry = geometry.clone()
    const attributes = geometry.attributes

    // this modifier can only process indexed and non-indexed geomtries with a position attribute

    for (let name in attributes) {
      if (name !== 'position') geometry.deleteAttribute(name)
    }

    geometry = BufferGeometryUtils.mergeVertices(geometry)

    //
    // put data of original geometry in different data structures
    //

    const vertices = []
    const faces = []

    // add vertices

    const positionAttribute = geometry.getAttribute('position')

    for (let i = 0; i < positionAttribute.count; i++) {
      const v = new Vector3().fromBufferAttribute(positionAttribute, i)

      const vertex = new Vertex(v, i)
      vertices.push(vertex)
    }

    // add faces

    const geomIndex = geometry.getIndex()

    if (geomIndex !== null) {
      for (let i = 0; i < geomIndex.count; i += 3) {
        const a = geomIndex.getX(i)
        const b = geomIndex.getX(i + 1)
        const c = geomIndex.getX(i + 2)

        const triangle = new Triangle(vertices[a], vertices[b], vertices[c], a, b, c)
        faces.push(triangle)
      }
    } else {
      for (let i = 0; i < positionAttribute.count; i += 3) {
        const a = i
        const b = i + 1
        const c = i + 2

        const triangle = new Triangle(vertices[a], vertices[b], vertices[c], a, b, c)
        faces.push(triangle)
      }
    }

    // compute all edge collapse costs

    for (let i = 0, il = vertices.length; i < il; i++) {
      this.computeEdgeCostAtVertex(vertices[i])
    }

    let nextVertex

    let z = count

    while (z--) {
      nextVertex = this.minimumCostEdge(vertices)

      if (!nextVertex) {
        console.log('THREE.SimplifyModifier: No next vertex')
        break
      } else {
        this.collapse(vertices, faces, nextVertex, nextVertex.collapseNeighbor as Vertex)
      }
    }

    //

    const simplifiedGeometry = new BufferGeometry()
    const position = []
    let index = []

    //

    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i].position
      position.push(vertex.x, vertex.y, vertex.z)
    }

    //

    for (let i = 0; i < faces.length; i++) {
      const face = faces[i]

      const a = vertices.indexOf(face.v1)
      const b = vertices.indexOf(face.v2)
      const c = vertices.indexOf(face.v3)

      index.push(a, b, c)
    }

    //

    simplifiedGeometry.setAttribute('position', new Float32BufferAttribute(position, 3))
    simplifiedGeometry.setIndex(index)

    return simplifiedGeometry
  }
}

export { SimplifyModifier }
