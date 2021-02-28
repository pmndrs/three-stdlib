import { Camera, EventDispatcher, Matrix4, Plane, Raycaster, Vector2, Vector3 } from 'three'

class DragControls extends EventDispatcher {
  _objects: any
  _camera: Camera
  _domElement: HTMLElement | Document

  enabled: boolean
  transformGroup: boolean

  private _plane: Plane
  private _raycaster: Raycaster

  private _mouse: Vector2
  private _offset: Vector3
  private _intersection: Vector3
  private _worldPosition: Vector3
  private _inverseMatrix: Matrix4
  private _intersections: any

  private _selected: any
  private _hovered: any

  constructor(_objects: any, _camera: Camera, _domElement: HTMLElement | Document) {
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

    //

    const scope = this

    function activate() {
      _domElement.addEventListener('pointermove', onPointerMove)
      _domElement.addEventListener('pointerdown', onPointerDown)
      _domElement.addEventListener('pointerup', onPointerCancel)
      _domElement.addEventListener('pointerleave', onPointerCancel)
      _domElement.addEventListener('touchmove', onTouchMove)
      _domElement.addEventListener('touchstart', onTouchStart)
      _domElement.addEventListener('touchend', onTouchEnd)
    }

    function deactivate() {
      _domElement.removeEventListener('pointermove', onPointerMove)
      _domElement.removeEventListener('pointerdown', onPointerDown)
      _domElement.removeEventListener('pointerup', onPointerCancel)
      _domElement.removeEventListener('pointerleave', onPointerCancel)
      _domElement.removeEventListener('touchmove', onTouchMove)
      _domElement.removeEventListener('touchstart', onTouchStart)
      _domElement.removeEventListener('touchend', onTouchEnd)

      _domElement.style.cursor = ''
    }

    function dispose() {
      deactivate()
    }

    // function getObjects() {
    //   return _objects
    // }

    function onPointerMove(event: PointerEvent) {
      event.preventDefault()

      switch (event.pointerType) {
        case 'mouse':
        case 'pen':
          onMouseMove(event)
          break

        // TODO touch
      }
    }

    function onMouseMove(event: MouseEvent) {
      const rect = _domElement.getBoundingClientRect()

      this._mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      this._mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      this._raycaster.setFromCamera(this._mouse, this._camera)

      if (this._selected && scope.enabled) {
        if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
          this._selected.position.copy(this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix))
        }

        scope.dispatchEvent({ type: 'drag', object: this._selected })

        return
      }

      this._intersections.length = 0

      this._raycaster.setFromCamera(this._mouse, _camera)
      this._raycaster.intersectObjects(_objects, true, this._intersections)

      if (this._intersections.length > 0) {
        const object = this._intersections[0].object

        this._plane.setFromNormalAndCoplanarPoint(
          _camera.getWorldDirection(this._plane.normal),
          this._worldPosition.setFromMatrixPosition(object.matrixWorld),
        )

        if (this._hovered !== object) {
          scope.dispatchEvent({ type: 'hoveron', object })

          _domElement.style.cursor = 'pointer'
          this._hovered = object
        }
      } else {
        if (this._hovered !== null) {
          scope.dispatchEvent({ type: 'hoveroff', object: this._hovered })

          _domElement.style.cursor = 'auto'
          this._hovered = null
        }
      }
    }

    function onPointerDown(event: PointerEvent) {
      event.preventDefault()

      switch (event.pointerType) {
        case 'mouse':
        case 'pen':
          onMouseDown(event)
          break

        // TODO touch
      }
    }

    function onMouseDown(event: MouseEvent) {
      event.preventDefault()

      this._intersections.length = 0

      this._raycaster.setFromCamera(this._mouse, _camera)
      this._raycaster.intersectObjects(_objects, true, this._intersections)

      if (this._intersections.length > 0) {
        this._selected = scope.transformGroup === true ? _objects[0] : this._intersections[0].object

        if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
          this._inverseMatrix.copy(this._selected.parent.matrixWorld).invert()
          this._offset
            .copy(this._intersection)
            .sub(this._worldPosition.setFromMatrixPosition(this._selected.matrixWorld))
        }

        _domElement.style.cursor = 'move'

        scope.dispatchEvent({ type: 'dragstart', object: this._selected })
      }
    }

    function onPointerCancel(event: PointerEvent) {
      event.preventDefault()

      switch (event.pointerType) {
        case 'mouse':
        case 'pen':
          onMouseCancel(event)
          break

        // TODO touch
      }
    }

    function onMouseCancel(event: MouseEvent) {
      event.preventDefault()

      if (this._selected) {
        scope.dispatchEvent({ type: 'dragend', object: this._selected })

        this._selected = null
      }

      _domElement.style.cursor = this._hovered ? 'pointer' : 'auto'
    }

    function onTouchMove(event: TouchEvent) {
      event.preventDefault()
      // event = event.changedTouches[0]
      const newEvent = event.changedTouches[0]

      const rect = _domElement.getBoundingClientRect()

      this._mouse.x = ((newEvent.clientX - rect.left) / rect.width) * 2 - 1
      this._mouse.y = -((newEvent.clientY - rect.top) / rect.height) * 2 + 1

      this._raycaster.setFromCamera(this._mouse, this._camera)

      if (this._selected && scope.enabled) {
        if (this._raycaster.ray.intersectPlane(this._plane, this._intersection)) {
          this._selected.position.copy(this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix))
        }

        scope.dispatchEvent({ type: 'drag', object: this._selected })

        return
      }
    }

    function onTouchStart(event: TouchEvent) {
      event.preventDefault()
      event = event.changedTouches[0]

      const rect = _domElement.getBoundingClientRect()

      _mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      _intersections.length = 0

      _raycaster.setFromCamera(_mouse, _camera)
      _raycaster.intersectObjects(_objects, true, _intersections)

      if (_intersections.length > 0) {
        _selected = scope.transformGroup === true ? _objects[0] : _intersections[0].object

        _plane.setFromNormalAndCoplanarPoint(
          _camera.getWorldDirection(_plane.normal),
          _worldPosition.setFromMatrixPosition(_selected.matrixWorld),
        )

        if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
          _inverseMatrix.copy(_selected.parent.matrixWorld).invert()
          _offset.copy(_intersection).sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld))
        }

        _domElement.style.cursor = 'move'

        scope.dispatchEvent({ type: 'dragstart', object: _selected })
      }
    }

    function onTouchEnd(event: TouchEvent) {
      event.preventDefault()

      if (_selected) {
        scope.dispatchEvent({ type: 'dragend', object: _selected })

        _selected = null
      }

      _domElement.style.cursor = 'auto'
    }

    activate()

    // API

    this.enabled = true
    this.transformGroup = false

    this.activate = activate
    this.deactivate = deactivate
    this.dispose = dispose
    // this.getObjects = this.getObjects
  }

  getObjects = () => this._objects
}

export { DragControls }
