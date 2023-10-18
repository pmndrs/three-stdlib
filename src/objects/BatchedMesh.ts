import {
  Matrix4,
  Mesh,
  BufferGeometry,
  Material,
  DataTexture,
  IUniform,
  MathUtils,
  RGBAFormat,
  FloatType,
  BufferAttribute,
} from 'three'

const _identityMatrix = new Matrix4()
const _zeroMatrix = new Matrix4().set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)

// Custom shaders
const batchingParsVertex = /* glsl */ `
#ifdef BATCHING
	attribute float id;
	uniform highp sampler2D batchingTexture;
	uniform int batchingTextureSize;
	mat4 getBatchingMatrix( const in float i ) {
		float j = i * 4.0;
		float x = mod( j, float( batchingTextureSize ) );
		float y = floor( j / float( batchingTextureSize ) );
		float dx = 1.0 / float( batchingTextureSize );
		float dy = 1.0 / float( batchingTextureSize );
		y = dy * ( y + 0.5 );
		vec4 v1 = texture2D( batchingTexture, vec2( dx * ( x + 0.5 ), y ) );
		vec4 v2 = texture2D( batchingTexture, vec2( dx * ( x + 1.5 ), y ) );
		vec4 v3 = texture2D( batchingTexture, vec2( dx * ( x + 2.5 ), y ) );
		vec4 v4 = texture2D( batchingTexture, vec2( dx * ( x + 3.5 ), y ) );
		return mat4( v1, v2, v3, v4 );
	}
#endif
`

const batchingbaseVertex = /* glsl */ `
#ifdef BATCHING
	mat4 batchingMatrix = getBatchingMatrix( id );
#endif
`

const batchingnormalVertex = /* glsl */ `
#ifdef BATCHING
	objectNormal = vec4( batchingMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( batchingMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif
`

const batchingVertex = /* glsl */ `
#ifdef BATCHING
	transformed = ( batchingMatrix * vec4( transformed, 1.0 ) ).xyz;
#endif
`

// @TODO: SkinnedMesh support?
// @TODO: Future work if needed. Move into the core. Can be optimized more with WEBGL_multi_draw.

class BatchedMesh extends Mesh<BufferGeometry, Material> {
  _vertexStarts: number[]
  _vertexCounts: number[]
  _indexStarts: number[]
  _indexCounts: number[]
  _visibles: boolean[]
  _alives: boolean[]
  _maxGeometryCount: number
  _maxVertexCount: number
  _maxIndexCount: number
  _geometryInitialized: boolean
  _geometryCount: number
  _vertexCount: number
  _indexCount: number
  _matrices: Matrix4[]
  _matricesArray: Float32Array | null
  _matricesTexture: DataTexture | null
  _matricesTextureSize: number | null
  _customUniforms: Record<string, IUniform>

  constructor(
    maxGeometryCount: number,
    maxVertexCount: number,
    maxIndexCount = maxVertexCount * 2,
    material?: Material,
  ) {
    super(new BufferGeometry(), material)

    this._vertexStarts = []
    this._vertexCounts = []
    this._indexStarts = []
    this._indexCounts = []

    this._visibles = []
    this._alives = []

    this._maxGeometryCount = maxGeometryCount
    this._maxVertexCount = maxVertexCount
    this._maxIndexCount = maxIndexCount

    this._geometryInitialized = false
    this._geometryCount = 0
    this._vertexCount = 0
    this._indexCount = 0

    // Local matrix per geometry by using data texture
    // @TODO: Support uniform parameter per geometry

    this._matrices = []
    this._matricesArray = null
    this._matricesTexture = null
    this._matricesTextureSize = null

    // @TODO: Calculate the entire binding box and make frustumCulled true
    this.frustumCulled = false

    this._customUniforms = {
      batchingTexture: { value: null },
      batchingTextureSize: { value: 0 },
    }

    this._initMatricesTexture()
    this._initShader()
  }

  _initMatricesTexture() {
    // layout (1 matrix = 4 pixels)
    //      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
    //  with  8x8  pixel texture max   16 matrices * 4 pixels =  (8 * 8)
    //       16x16 pixel texture max   64 matrices * 4 pixels = (16 * 16)
    //       32x32 pixel texture max  256 matrices * 4 pixels = (32 * 32)
    //       64x64 pixel texture max 1024 matrices * 4 pixels = (64 * 64)

    let size = Math.sqrt(this._maxGeometryCount * 4) // 4 pixels needed for 1 matrix
    size = MathUtils.ceilPowerOfTwo(size)
    size = Math.max(size, 4)

    const matricesArray = new Float32Array(size * size * 4) // 4 floats per RGBA pixel
    const matricesTexture = new DataTexture(matricesArray, size, size, RGBAFormat, FloatType)

    this._matricesArray = matricesArray
    this._matricesTexture = matricesTexture
    this._matricesTextureSize = size

    this._customUniforms.batchingTexture.value = this._matricesTexture
    this._customUniforms.batchingTextureSize.value = this._matricesTextureSize
  }

  _initShader() {
    const currentOnBeforeCompile = this.material.onBeforeCompile
    const customUniforms = this._customUniforms

    this.material.onBeforeCompile = function onBeforeCompile(parameters, renderer) {
      // Is this replacement stable across any materials?
      parameters.vertexShader = parameters.vertexShader
        .replace('#include <skinning_pars_vertex>', '#include <skinning_pars_vertex>\n' + batchingParsVertex)
        .replace(
          '#include <skinnormal_vertex>',
          '#include <skinnormal_vertex>\n' + batchingbaseVertex + batchingnormalVertex,
        )
        .replace('#include <skinning_vertex>', '#include <skinning_vertex>\n' + batchingVertex)

      for (const uniformName in customUniforms) {
        parameters.uniforms[uniformName] = customUniforms[uniformName]
      }

      currentOnBeforeCompile.call(this, parameters, renderer)
    }

    this.material.defines = this.material.defines || {}
    this.material.defines.BATCHING = false
  }

  getGeometryCount() {
    return this._geometryCount
  }

  getVertexCount() {
    return this._vertexCount
  }

  getIndexCount() {
    return this._indexCount
  }

  applyGeometry(geometry: BufferGeometry) {
    // @TODO: geometry.groups support?
    // @TODO: geometry.drawRange support?
    // @TODO: geometry.mortphAttributes support?

    if (this._geometryCount >= this._maxGeometryCount) {
      // @TODO: Error handling
    }

    if (this._geometryInitialized === false) {
      for (const attributeName in geometry.attributes) {
        const srcAttribute = geometry.getAttribute(attributeName)
        const { array, itemSize, normalized } = srcAttribute

        const dstArray = new (array.constructor as Float32ArrayConstructor)(this._maxVertexCount * itemSize)
        const dstAttribute = new (srcAttribute.constructor as any)(dstArray, itemSize, normalized) as BufferAttribute

        // TODO: add usage in @types/three
        // @ts-ignore
        dstAttribute.setUsage(srcAttribute.usage)

        this.geometry.setAttribute(attributeName, dstAttribute)
      }

      if (geometry.getIndex() !== null) {
        const indexArray =
          this._maxVertexCount > 65536 ? new Uint32Array(this._maxIndexCount) : new Uint16Array(this._maxIndexCount)

        this.geometry.setIndex(new BufferAttribute(indexArray, 1))
      }

      const idArray =
        this._maxGeometryCount > 65536 ? new Uint32Array(this._maxVertexCount) : new Uint16Array(this._maxVertexCount)
      // @TODO: What if attribute name 'id' is already used?
      this.geometry.setAttribute('id', new BufferAttribute(idArray, 1))

      this._geometryInitialized = true
    } else {
      // @TODO: Check if geometry has the same attributes set
    }

    const hasIndex = this.geometry.getIndex() !== null
    const dstIndex = this.geometry.getIndex()
    const srcIndex = geometry.getIndex()

    // Assuming geometry has position attribute
    const srcPositionAttribute = geometry.getAttribute('position')

    this._vertexStarts.push(this._vertexCount)
    this._vertexCounts.push(srcPositionAttribute.count)

    if (hasIndex) {
      this._indexStarts.push(this._indexCount)
      this._indexCounts.push(srcIndex!.count)
    }

    this._visibles.push(true)
    this._alives.push(true)

    // @TODO: Error handling if exceeding maxVertexCount or maxIndexCount

    for (const attributeName in geometry.attributes) {
      const srcAttribute = geometry.getAttribute(attributeName)
      const dstAttribute = this.geometry.getAttribute(attributeName)
      ;(dstAttribute.array as Float32Array).set(srcAttribute.array, this._vertexCount * dstAttribute.itemSize)
      dstAttribute.needsUpdate = true
    }

    if (hasIndex) {
      for (let i = 0; i < srcIndex!.count; i++) {
        dstIndex!.setX(this._indexCount + i, this._vertexCount + srcIndex!.getX(i))
      }

      this._indexCount += srcIndex!.count
      dstIndex!.needsUpdate = true
    }

    const geometryId = this._geometryCount
    this._geometryCount++

    const idAttribute = this.geometry.getAttribute('id')

    for (let i = 0; i < srcPositionAttribute.count; i++) {
      idAttribute.setX(this._vertexCount + i, geometryId)
    }

    idAttribute.needsUpdate = true

    this._vertexCount += srcPositionAttribute.count

    this._matrices.push(new Matrix4())
    _identityMatrix.toArray(this._matricesArray ?? undefined, geometryId * 16)
    this._matricesTexture!.needsUpdate = true

    return geometryId
  }

  deleteGeometry(geometryId: number) {
    if (geometryId >= this._alives.length || this._alives[geometryId] === false) {
      return this
    }

    this._alives[geometryId] = false
    _zeroMatrix.toArray(this._matricesArray!, geometryId * 16)
    this._matricesTexture!.needsUpdate = true

    // User needs to call optimize() to pack the data.

    return this
  }

  optimize() {
    // @TODO: Implement

    return this
  }

  setMatrixAt(geometryId: number, matrix: Matrix4) {
    // @TODO: Map geometryId to index of the arrays because
    //        optimize() can make geometryId mismatch the index

    if (geometryId >= this._matrices.length || this._alives[geometryId] === false) {
      return this
    }

    this._matrices[geometryId].copy(matrix)

    if (this._visibles[geometryId] === true) {
      matrix.toArray(this._matricesArray!, geometryId * 16)
      this._matricesTexture!.needsUpdate = true
    }

    return this
  }

  getMatrixAt(geometryId: number, matrix: Matrix4) {
    if (geometryId >= this._matrices.length || this._alives[geometryId] === false) {
      return matrix
    }

    return matrix.copy(this._matrices[geometryId])
  }

  setVisibleAt(geometryId: number, visible: boolean) {
    if (geometryId >= this._visibles.length || this._alives[geometryId] === false) {
      return this
    }

    if (this._visibles[geometryId] === visible) {
      return this
    }

    if (visible === true) {
      this._matrices[geometryId].toArray(this._matricesArray!, geometryId * 16)
    } else {
      _zeroMatrix.toArray(this._matricesArray!, geometryId * 16)
    }

    this._matricesTexture!.needsUpdate = true
    this._visibles[geometryId] = visible
    return this
  }

  getVisibleAt(geometryId: number) {
    if (geometryId >= this._visibles.length || this._alives[geometryId] === false) {
      return false
    }

    return this._visibles[geometryId]
  }

  copy(source: BatchedMesh) {
    // @ts-ignore
    super.copy(source)

    // @TODO: Implement

    return this
  }

  toJSON(meta: any) {
    // @TODO: Implement

    return super.toJSON(meta)
  }

  dispose() {
    // Assuming the geometry is not shared with other meshes
    this.geometry.dispose()

    this._matricesTexture?.dispose()
    this._matricesTexture = null

    return this
  }

  // @ts-ignore
  onBeforeRender() {
    if (this.material.defines) {
      this.material.defines.BATCHING = true
    }

    // @TODO: Implement frustum culling for each geometry
  }

  // @ts-ignore
  onAfterRender() {
    if (this.material.defines) {
      this.material.defines.BATCHING = false
    }
  }
}

export { BatchedMesh }
