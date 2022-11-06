import {
  Attribute,
  DataType,
  Decoder,
  DecoderBuffer,
  DecoderModule,
  DracoDecoderModule,
  DracoDecoderModuleProps,
  Mesh,
  PointCloud,
} from 'draco3d'
import { BufferAttribute, BufferGeometry, FileLoader, Loader, LoadingManager } from 'three'
import { TypedArray } from 'types/shared'

type DecoderConfig = {
  type?: string
} & DracoDecoderModuleProps

type TypedArrayIndices = 'Float32Array' | 'Uint32Array' | 'Uint16Array' | 'Uint8Array' | 'Int16Array' | 'Int8Array'

type TaskConfig = {
  attributeIDs: {
    position: string | number
    normal: string | number
    color: string
    uv: string | number
  }
  attributeTypes: {
    position: TypedArrayIndices | TypedArray
    normal: TypedArrayIndices | TypedArray
    color: TypedArrayIndices | TypedArray
    uv: TypedArrayIndices | TypedArray
  }
  useUniqueIDs: boolean
}

type DefaultAttributeTypes = {
  position: TypedArrayIndices
  normal: TypedArrayIndices
  color: TypedArrayIndices
  uv: TypedArrayIndices
}

type ExtendedWorker = Worker & {
  _callbacks: {
    [T: number]: {
      resolve: (value: unknown) => void
      reject: (reason?: any) => void
    }
  }
  _taskCosts: {
    [T: number]: number
  }
  _taskLoad: number
}

type ClientMessage = {
  type: 'decode' | 'error'
  id: number
  geometry?: DecodeGeometry
  error?: string
}

const _taskCache = new WeakMap()

class DRACOLoader extends Loader {
  decoderPath
  decoderConfig: DecoderConfig
  decoderBinary: null
  decoderPending: Promise<void> | null
  workerLimit
  workerPool: ExtendedWorker[]
  workerNextTaskID
  workerSourceURL
  defaultAttributeIDs
  defaultAttributeTypes: DefaultAttributeTypes

  constructor(manager?: LoadingManager) {
    super(manager)

    this.decoderPath = ''
    this.decoderConfig = {}
    this.decoderBinary = null
    this.decoderPending = null

    this.workerLimit = 4
    this.workerPool = []
    this.workerNextTaskID = 1
    this.workerSourceURL = ''

    this.defaultAttributeIDs = {
      position: 'POSITION',
      normal: 'NORMAL',
      color: 'COLOR',
      uv: 'TEX_COORD',
    }
    this.defaultAttributeTypes = {
      position: 'Float32Array',
      normal: 'Float32Array',
      color: 'Float32Array',
      uv: 'Float32Array',
    }
  }

  setDecoderPath(path: string): DRACOLoader {
    this.decoderPath = path

    return this
  }

  setDecoderConfig(config: DecoderConfig): DRACOLoader {
    this.decoderConfig = config

    return this
  }

  setWorkerLimit(workerLimit: number): DRACOLoader {
    this.workerLimit = workerLimit

    return this
  }

  load(
    url: string,
    onLoad: (geometry: BufferGeometry) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void,
  ): void {
    const loader = new FileLoader(this.manager)

    loader.setPath(this.path)
    loader.setResponseType('arraybuffer')
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)

    loader.load(
      url,
      (buffer) => {
        const taskConfig = {
          attributeIDs: this.defaultAttributeIDs,
          attributeTypes: this.defaultAttributeTypes,
          useUniqueIDs: false,
        }

        this.decodeGeometry(buffer as ArrayBuffer, taskConfig)
          .then(onLoad)
          .catch(onError)
      },
      onProgress,
      onError,
    )
  }

  /** @deprecated Kept for backward-compatibility with previous DRACOLoader versions. */
  decodeDracoFile(
    buffer: ArrayBuffer,
    callback: (geometry: BufferGeometry) => void,
    attributeIDs: TaskConfig['attributeIDs'],
    attributeTypes: TaskConfig['attributeTypes'],
  ): void {
    const taskConfig = {
      attributeIDs: attributeIDs || this.defaultAttributeIDs,
      attributeTypes: attributeTypes || this.defaultAttributeTypes,
      useUniqueIDs: !!attributeIDs,
    }

    this.decodeGeometry(buffer, taskConfig).then(callback)
  }

  decodeGeometry(buffer: ArrayBuffer, taskConfig: TaskConfig): Promise<BufferGeometry> {
    // TODO: For backward-compatibility, support 'attributeTypes' objects containing
    // references (rather than names) to typed array constructors. These must be
    // serialized before sending them to the worker.
    for (const attribute in taskConfig.attributeTypes) {
      const type = taskConfig.attributeTypes[attribute as keyof TaskConfig['attributeTypes']]

      if ((type as TypedArray).BYTES_PER_ELEMENT !== undefined) {
        // Name doesn't seem to be a recognized property but does exist
        // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/name
        taskConfig.attributeTypes[attribute as keyof TaskConfig['attributeTypes']] = (type as TypedArray & {
          name: TypedArrayIndices
        }).name
      }
    }

    //

    const taskKey = JSON.stringify(taskConfig)

    // Check for an existing task using this buffer. A transferred buffer cannot be transferred
    // again from this thread.
    if (_taskCache.has(buffer)) {
      const cachedTask = _taskCache.get(buffer)

      if (cachedTask.key === taskKey) {
        return cachedTask.promise
      } else if (buffer.byteLength === 0) {
        // Technically, it would be possible to wait for the previous task to complete,
        // transfer the buffer back, and decode again with the second configuration. That
        // is complex, and I don't know of any reason to decode a Draco buffer twice in
        // different ways, so this is left unimplemented.
        throw new Error(
          'THREE.DRACOLoader: Unable to re-decode a buffer with different ' +
            'settings. Buffer has already been transferred.',
        )
      }
    }

    //

    let worker: ExtendedWorker
    const taskID = this.workerNextTaskID++
    const taskCost = buffer.byteLength

    // Obtain a worker and assign a task, and construct a geometry instance
    // when the task completes.
    const geometryPending = this._getWorker(taskID, taskCost)
      .then((_worker) => {
        worker = _worker

        return new Promise((resolve, reject) => {
          worker._callbacks[taskID] = { resolve, reject }

          worker.postMessage({ type: 'decode', id: taskID, taskConfig, buffer }, [buffer])

          // this.debug();
        })
      })
      .then((message) => {
        return this._createGeometry((message as ClientMessage).geometry as DecodeGeometry)
      })

    // Remove task from the task list.
    // Note: replaced '.finally()' with '.catch().then()' block - iOS 11 support (#19416)
    geometryPending
      .catch(() => true)
      .then(() => {
        if (worker && taskID) {
          this._releaseTask(worker, taskID)

          // this.debug();
        }
      })

    // Cache the task result.
    _taskCache.set(buffer, {
      key: taskKey,
      promise: geometryPending,
    })

    return geometryPending
  }

  private _createGeometry(geometryData: DecodeGeometry): BufferGeometry {
    const geometry = new BufferGeometry()

    if (geometryData.index) {
      geometry.setIndex(new BufferAttribute(geometryData.index.array, 1))
    }

    for (let i = 0; i < geometryData.attributes.length; i++) {
      const attribute = geometryData.attributes[i]
      const name = attribute.name
      const array = attribute.array
      const itemSize = attribute.itemSize

      geometry.setAttribute(name, new BufferAttribute(array, itemSize))
    }

    return geometry
  }

  private _loadLibrary(url: string, responseType: string): Promise<string | ArrayBuffer> {
    const loader = new FileLoader(this.manager)
    loader.setPath(this.decoderPath)
    loader.setResponseType(responseType)
    loader.setWithCredentials(this.withCredentials)

    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject)
    })
  }

  preload(): DRACOLoader {
    this._initDecoder()

    return this
  }

  private _initDecoder(): Promise<void> {
    if (this.decoderPending) return this.decoderPending

    const useJS = typeof WebAssembly !== 'object' || this.decoderConfig.type === 'js'
    const librariesPending = []

    if (useJS) {
      librariesPending.push(this._loadLibrary('draco_decoder.js', 'text'))
    } else {
      librariesPending.push(this._loadLibrary('draco_wasm_wrapper.js', 'text'))
      librariesPending.push(this._loadLibrary('draco_decoder.wasm', 'arraybuffer'))
    }

    this.decoderPending = Promise.all(librariesPending).then((libraries) => {
      const jsContent = libraries[0]

      if (!useJS) {
        this.decoderConfig.wasmBinary = libraries[1] as ArrayBuffer
      }

      const fn = DRACOWorker.toString()

      const body = [
        '/* draco decoder */',
        jsContent,
        '',
        '/* worker */',
        fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}')),
      ].join('\n')

      this.workerSourceURL = URL.createObjectURL(new Blob([body]))
    })

    return this.decoderPending
  }

  private _getWorker(taskID: number, taskCost: number): Promise<ExtendedWorker> {
    return this._initDecoder().then(() => {
      if (this.workerPool.length < this.workerLimit) {
        const worker = new Worker(this.workerSourceURL) as ExtendedWorker

        worker._callbacks = {}
        worker._taskCosts = {}
        worker._taskLoad = 0

        worker.postMessage({ type: 'init', decoderConfig: this.decoderConfig })

        worker.onmessage = function (e): void {
          const message: ClientMessage = e.data

          switch (message.type) {
            case 'decode':
              worker._callbacks[message.id].resolve(message)
              break

            case 'error':
              worker._callbacks[message.id].reject(message)
              break

            default:
              console.error('THREE.DRACOLoader: Unexpected message, "' + message.type + '"')
          }
        }

        this.workerPool.push(worker)
      } else {
        this.workerPool.sort(function (a, b) {
          return a._taskLoad > b._taskLoad ? -1 : 1
        })
      }

      const worker = this.workerPool[this.workerPool.length - 1]
      worker._taskCosts[taskID] = taskCost
      worker._taskLoad += taskCost
      return worker
    })
  }

  private _releaseTask(worker: ExtendedWorker, taskID: number): void {
    worker._taskLoad -= worker._taskCosts[taskID]
    delete worker._callbacks[taskID]
    delete worker._taskCosts[taskID]
  }

  debug(): void {
    console.log(
      'Task load: ',
      this.workerPool.map((worker) => worker._taskLoad),
    )
  }

  dispose(): DRACOLoader {
    for (let i = 0; i < this.workerPool.length; ++i) {
      this.workerPool[i].terminate()
    }

    this.workerPool.length = 0

    return this
  }
}

/* WEB WORKER */

type WorkerMessage = {
  type: 'init' | 'decode'
  decoderConfig: DecoderConfig
  buffer?: ArrayBuffer
  id?: number
  taskConfig?: TaskConfig
}

type DecodeGeometry = {
  index: DecodeIndex | null
  attributes: DecodeAttribute[]
}

type DecodeIndex = {
  array: Uint32Array
  itemSize: number
}

type DecodeAttribute = {
  name: string
  array: Uint32Array
  itemSize: number
}

declare const self: DedicatedWorkerGlobalScope

function DRACOWorker(): void {
  let decoderConfig: DecoderConfig
  let decoderPending: Promise<{ draco: DecoderModule }>

  let DracoDecoderModule: DracoDecoderModule

  onmessage = function (e): void {
    const message: WorkerMessage = e.data

    switch (message.type) {
      case 'init':
        decoderConfig = message.decoderConfig
        decoderPending = new Promise(function (resolve /*, reject*/) {
          decoderConfig!.onModuleLoaded = function (draco: DecoderModule): void {
            // Module is Promise-like. Wrap before resolving to avoid loop.
            resolve({ draco: draco })
          }

          DracoDecoderModule(decoderConfig) // eslint-disable-line no-undef
        })
        break

      case 'decode':
        const buffer = message.buffer as ArrayBuffer
        const taskConfig = message.taskConfig
        decoderPending.then((module) => {
          const draco = module.draco
          const decoder = new draco.Decoder()
          const decoderBuffer = new draco.DecoderBuffer()
          decoderBuffer.Init(new Int8Array(buffer), buffer.byteLength)

          try {
            const geometry = decodeGeometry(draco, decoder, decoderBuffer, taskConfig as TaskConfig)

            const buffers = geometry.attributes.map((attr) => attr.array.buffer)

            if (geometry.index) buffers.push(geometry.index.array.buffer)

            self.postMessage({ type: 'decode', id: message.id, geometry }, buffers)
          } catch (error) {
            console.error(error)

            self.postMessage({ type: 'error', id: message.id, error: (error as Error).message })
          } finally {
            draco.destroy(decoderBuffer)
            draco.destroy(decoder)
          }
        })
        break
    }
  }

  function decodeGeometry(
    draco: DecoderModule,
    decoder: Decoder,
    decoderBuffer: DecoderBuffer,
    taskConfig: TaskConfig,
  ): DecodeGeometry {
    const attributeIDs = taskConfig.attributeIDs
    const attributeTypes = taskConfig.attributeTypes

    let dracoGeometry
    let decodingStatus

    const geometryType = decoder.GetEncodedGeometryType(decoderBuffer)

    if (geometryType === draco.TRIANGULAR_MESH) {
      dracoGeometry = new draco.Mesh()
      decodingStatus = decoder.DecodeBufferToMesh(decoderBuffer, dracoGeometry)
    } else if (geometryType === draco.POINT_CLOUD) {
      dracoGeometry = new draco.PointCloud()
      decodingStatus = decoder.DecodeBufferToPointCloud(decoderBuffer, dracoGeometry)
    } else {
      throw new Error('THREE.DRACOLoader: Unexpected geometry type.')
    }

    if (!decodingStatus.ok() || (dracoGeometry as Mesh).ptr === 0) {
      throw new Error('THREE.DRACOLoader: Decoding failed: ' + decodingStatus.error_msg())
    }

    const geometry: DecodeGeometry = { index: null, attributes: [] }

    // Gather all vertex attributes.
    for (const attributeName in attributeIDs) {
      const name = attributeName as keyof TaskConfig['attributeTypes']
      const arrayType = attributeTypes[name] as TypedArrayIndices
      const attributeType = (self[arrayType as keyof DedicatedWorkerGlobalScope] as unknown) as TypedArray

      let attribute
      let attributeID

      // A Draco file may be created with default vertex attributes, whose attribute IDs
      // are mapped 1:1 from their semantic name (POSITION, NORMAL, ...). Alternatively,
      // a Draco file may contain a custom set of attributes, identified by known unique
      // IDs. glTF files always do the latter, and `.drc` files typically do the former.
      if (taskConfig.useUniqueIDs) {
        attributeID = attributeIDs[name] as number
        attribute = decoder.GetAttributeByUniqueId(dracoGeometry as Mesh, attributeID)
      } else {
        let attributeIDName = attributeIDs[name] as keyof DecoderModule
        attributeID = decoder.GetAttributeId(dracoGeometry as PointCloud, draco[attributeIDName] as number)

        if (attributeID === -1) continue

        attribute = decoder.GetAttribute(dracoGeometry as PointCloud, attributeID)
      }

      geometry.attributes.push(decodeAttribute(draco, decoder, dracoGeometry as Mesh, name, attributeType, attribute))
    }

    // Add index.
    if (geometryType === draco.TRIANGULAR_MESH) {
      geometry.index = decodeIndex(draco, decoder, dracoGeometry as Mesh)
    }

    draco.destroy(dracoGeometry)

    return geometry
  }

  function decodeIndex(draco: DecoderModule, decoder: Decoder, dracoGeometry: Mesh): DecodeIndex {
    const numFaces = dracoGeometry.num_faces()
    const numIndices = numFaces * 3
    const byteLength = numIndices * 4

    const ptr = draco._malloc(byteLength)
    decoder.GetTrianglesUInt32Array(dracoGeometry, byteLength, ptr)
    const index = new Uint32Array(draco.HEAPF32.buffer, ptr, numIndices).slice()
    draco._free(ptr)

    return { array: index, itemSize: 1 }
  }

  function decodeAttribute(
    draco: DecoderModule,
    decoder: Decoder,
    dracoGeometry: Mesh,
    attributeName: keyof TaskConfig['attributeTypes'],
    attributeType: TypedArray,
    attribute: Attribute,
  ): DecodeAttribute {
    const numComponents = attribute.num_components()
    const numPoints = dracoGeometry.num_points()
    const numValues = numPoints * numComponents
    const byteLength = numValues * attributeType.BYTES_PER_ELEMENT
    const dataType = getDracoDataType(draco, attributeType) as DataType

    const ptr = draco._malloc(byteLength)
    decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, dataType, byteLength, ptr)
    // @ts-expect-error
    const array = new attributeType(draco.HEAPF32.buffer, ptr, numValues).slice()
    draco._free(ptr)

    return {
      name: attributeName,
      array: array,
      itemSize: numComponents,
    }
  }

  function getDracoDataType(draco: DecoderModule, attributeType: TypedArray): DataType | undefined {
    switch (attributeType) {
      case (Float32Array as unknown) as Float32Array:
        return draco.DT_FLOAT32
      case (Int8Array as unknown) as Int8Array:
        return draco.DT_INT8
      case (Int16Array as unknown) as Int16Array:
        return draco.DT_INT16
      case (Int32Array as unknown) as Int32Array:
        return draco.DT_INT32
      case (Uint8Array as unknown) as Uint8Array:
        return draco.DT_UINT8
      case (Uint16Array as unknown) as Uint16Array:
        return draco.DT_UINT16
      case (Uint32Array as unknown) as Uint32Array:
        return draco.DT_UINT32
    }
  }
}

export { DRACOLoader }
