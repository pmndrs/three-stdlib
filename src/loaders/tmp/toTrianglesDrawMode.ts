import { BufferGeometry, TriangleFanDrawMode } from 'three'

export function toTrianglesDrawMode(geometry: BufferGeometry, drawMode: number): BufferGeometry {
  let index = geometry.getIndex()

  // generate index if not present

  if (index === null) {
    const indices = []

    const position = geometry.getAttribute('position')

    if (position !== undefined) {
      for (let i = 0; i < position.count; i++) {
        indices.push(i)
      }

      geometry.setIndex(indices)
      index = geometry.getIndex()
    } else {
      console.error('THREE.GLTFLoader.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.')
      return geometry
    }
  }

  //

  const numberOfTriangles = index.count - 2
  const newIndices = []

  if (drawMode === TriangleFanDrawMode) {
    // gl.TRIANGLE_FAN

    for (let i = 1; i <= numberOfTriangles; i++) {
      newIndices.push(index.getX(0))
      newIndices.push(index.getX(i))
      newIndices.push(index.getX(i + 1))
    }
  } else {
    // gl.TRIANGLE_STRIP

    for (let i = 0; i < numberOfTriangles; i++) {
      if (i % 2 === 0) {
        newIndices.push(index.getX(i))
        newIndices.push(index.getX(i + 1))
        newIndices.push(index.getX(i + 2))
      } else {
        newIndices.push(index.getX(i + 2))
        newIndices.push(index.getX(i + 1))
        newIndices.push(index.getX(i))
      }
    }
  }

  if (newIndices.length / 3 !== numberOfTriangles) {
    console.error('THREE.GLTFLoader.toTrianglesDrawMode(): Unable to generate correct amount of triangles.')
  }

  // build final geometry

  const newGeometry = geometry.clone()
  newGeometry.setIndex(newIndices)

  return newGeometry
}
