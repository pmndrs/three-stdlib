import { Camera, EventDispatcher, Intersection, Matrix4, Object3D, Plane, Raycaster, Vector2, Vector3 } from 'three'

class DragControls extends EventDispatcher {
  enabled: boolean
  transformGroup: boolean

  private _objects: Object3D[]
  private _camera: Camera
  private _domElement: HTMLElement

  private _plane: Plane
  private _raycaster: Raycaster

  private _mouse: Vector2
  private _offset: Vector3
  private _intersection: Vector3
  private _worldPosition: Vector3
  private _inverseMatrix: Matrix4
  private _intersections: Intersection[]

  private _selected: Object3D | null
  private _hovered: Object3D | null

  constructor(_objects: Object3D[], _camera: Camera, _domElement: HTMLElement) {
    super()

    this._objects = _objects
    this._camera = _camera
    this._domElement = _domElement

    this._plane = new Plane()
    this._raycaster = new Raycaster()

    this._mouse = new Vector2()
    this._offset = new Vector3()
    this._intersection = new Vector3()
    this._worldPosition = new Vector3()
    this._inverseMatrix = new Matrix4()
    this._intersections = []
    this._selected = null
    this._hovered = null

    this.activate()

    // API

    this.enabled = true
    this.transformGroup = false
  }

  activate = () => {
    this._domElement.addEventListener('pointermove', this.onPointerMove)
    this._domElement.addEventListener('pointerdown', this.onPointerDown)
    this._domElement.addEventListener('pointerup', this.onPointerCancel)
    this._domElement.addEventListener('pointerleave', this.onPointerCancel)
    this._domElement.addEventListener('touchmove', this.onTouchMove)
    this._domElement.addEventListener('touchstart', this.onTouchStart)
    this._domElement.addEventListener('touchend', this.onTouchEnd)
  }

  deactivate = () => {
    this._domElement.removeEventListener('pointermove', this.onPointerMove)
    this._domElement.removeEventListener('pointerdown', this.onPointerDown)
    this._domElement.removeEventListener('pointerup', this.onPointerCancel)
    this._domElement.removeEventListener('pointerleave', this.onPointerCancel)
    this._domElement.removeEventListener('touchmove', this.onTouchMove)
    this._domElement.removeEventListener('touchstart', this.onTouchStart)
    this._domElement.removeEventListener('touchend', this.onTouchEnd)

    this._domElement.style.cursor = ''
  }

  // TODO: confirm if this can be removed?
  dispose = () => this.deactivate()

  getObjects = () => this._objects

  onMouseMove = (event: MouseEvent) => {
    const rect = this._domElement.getBoundingClientRect()

    this._mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this._mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this._raycaster.setFromCamera(this._mouse, this._camera)

    if (this._selected && this.enabled) {
      if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
        this._selected.position.copy(this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix))
      }

      this.dispatchEvent({ type: 'drag', object: this._selected })

      return
    }

    this._intersections.length = 0

    this._raycaster.setFromCamera(this._mouse, this._camera)
    this._raycaster.intersectObjects(this._objects, true, this._intersections)

    if (this._intersections.length > 0) {
      const object = this._intersections[0].object

      this._plane.setFromNormalAndCoplanarPoint(
        this._camera.getWorldDirection(this._plane.normal),
        this._worldPosition.setFromMatrixPosition(object.matrixWorld),
      )

      if (this._hovered !== object) {
        this.dispatchEvent({ type: 'hoveron', object })

        this._domElement.style.cursor = 'pointer'
        this._hovered = object
      }
    } else {
      if (this._hovered !== null) {
        this.dispatchEvent({ type: 'hoveroff', object: this._hovered })

        this._domElement.style.cursor = 'auto'
        this._hovered = null
      }
    }
  }

  onMouseDown = (event: MouseEvent) => {
    event.preventDefault()

    this._intersections.length = 0

    this._raycaster.setFromCamera(this._mouse, this._camera)
    this._raycaster.intersectObjects(this._objects, true, this._intersections)

    if (this._intersections.length > 0) {
      this._selected = this.transformGroup === true ? this._objects[0] : this._intersections[0].object

      if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
        this._inverseMatrix.copy(this._selected.parent.matrixWorld).invert()
        this._offset.copy(this._intersection).sub(this._worldPosition.setFromMatrixPosition(this._selected.matrixWorld))
      }

      this._domElement.style.cursor = 'move'

      this.dispatchEvent({ type: 'dragstart', object: this._selected })
    }
  }

  onMouseCancel = (event: MouseEvent) => {
    event.preventDefault()

    if (this._selected) {
      this.dispatchEvent({ type: 'dragend', object: this._selected })

      this._selected = null
    }

    this._domElement.style.cursor = this._hovered ? 'pointer' : 'auto'
  }

  onPointerMove = (event: PointerEvent) => {
    event.preventDefault()

    switch (event.pointerType) {
      case 'mouse':
      case 'pen':
        this.onMouseMove(event)
        break

      // TODO touch
    }
  }

  onPointerDown = (event: PointerEvent) => {
    event.preventDefault()

    switch (event.pointerType) {
      case 'mouse':
      case 'pen':
        this.onMouseDown(event)
        break

      // TODO touch
    }
  }

  onPointerCancel = (event: PointerEvent) => {
    event.preventDefault()

    switch (event.pointerType) {
      case 'mouse':
      case 'pen':
        this.onMouseCancel(event)
        break

      // TODO touch
    }
  }

  onTouchMove = (event: TouchEvent) => {
    event.preventDefault()
    const newEvent = event.changedTouches[0]

    const rect = this._domElement.getBoundingClientRect()

    this._mouse.x = ((newEvent.clientX - rect.left) / rect.width) * 2 - 1
    this._mouse.y = -((newEvent.clientY - rect.top) / rect.height) * 2 + 1

    this._raycaster.setFromCamera(this._mouse, this._camera)

    if (this._selected && this.enabled) {
      if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
        this._selected.position.copy(this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix))
      }

      this.dispatchEvent({ type: 'drag', object: this._selected })

      return
    }
  }

  onTouchStart = (event: TouchEvent) => {
    event.preventDefault()
    const newEvent = event.changedTouches[0]

    const rect = this._domElement.getBoundingClientRect()

    this._mouse.x = ((newEvent.clientX - rect.left) / rect.width) * 2 - 1
    this._mouse.y = -((newEvent.clientY - rect.top) / rect.height) * 2 + 1

    this._intersections.length = 0

    this._raycaster.setFromCamera(this._mouse, this._camera)
    this._raycaster.intersectObjects(this._objects, true, this._intersections)

    if (this._intersections.length > 0) {
      this._selected = this.transformGroup === true ? this._objects[0] : this._intersections[0].object

      this._plane.setFromNormalAndCoplanarPoint(
        this._camera.getWorldDirection(this._plane.normal),
        this._worldPosition.setFromMatrixPosition(this._selected.matrixWorld),
      )

      if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
        this._inverseMatrix.copy(this._selected.parent.matrixWorld).invert()
        this._offset.copy(this._intersection).sub(this._worldPosition.setFromMatrixPosition(this._selected.matrixWorld))
      }

      this._domElement.style.cursor = 'move'

      this.dispatchEvent({ type: 'dragstart', object: this._selected })
    }
  }

  onTouchEnd = (event: TouchEvent) => {
    event.preventDefault()

    if (this._selected) {
      this.dispatchEvent({ type: 'dragend', object: this._selected })

      this._selected = null
    }

    this._domElement.style.cursor = 'auto'
  }
}

export { DragControls }
