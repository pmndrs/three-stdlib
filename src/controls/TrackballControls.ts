import { EventDispatcher, MOUSE, Quaternion, Vector2, Vector3, PerspectiveCamera, OrthographicCamera } from 'three'

class TrackballControls extends EventDispatcher {
  enabled = true

  screen = { left: 0, top: 0, width: 0, height: 0 }

  rotateSpeed = 1.0
  zoomSpeed = 1.2
  panSpeed = 0.3

  noRotate = false
  noZoom = false
  noPan = false

  staticMoving = false
  dynamicDampingFactor = 0.2

  minDistance = 0
  maxDistance = Infinity

  keys: [number, number, number] = [65 /*A*/, 83 /*S*/, 68 /*D*/]

  mouseButtons = {
    LEFT: MOUSE.ROTATE,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.PAN,
  }

  object: PerspectiveCamera | OrthographicCamera
  domElement: HTMLElement

  private target = new Vector3()

  // internals
  private STATE = {
    NONE: -1,
    ROTATE: 0,
    ZOOM: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_ZOOM_PAN: 4,
  }

  private EPS = 0.000001

  private lastPosition = new Vector3()
  private lastZoom = 1

  private _state = this.STATE.NONE
  private _keyState = this.STATE.NONE
  private _eye = new Vector3()
  private _movePrev = new Vector2()
  private _moveCurr = new Vector2()
  private _lastAxis = new Vector3()
  private _lastAngle = 0
  private _zoomStart = new Vector2()
  private _zoomEnd = new Vector2()
  private _touchZoomDistanceStart = 0
  private _touchZoomDistanceEnd = 0
  private _panStart = new Vector2()
  private _panEnd = new Vector2()

  private target0: Vector3
  private position0: Vector3
  private up0: Vector3
  private zoom0: number

  // events

  private changeEvent = { type: 'change' }
  private startEvent = { type: 'start' }
  private endEvent = { type: 'end' }

  constructor(object: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
    super()

    if (domElement === undefined) {
      console.warn('THREE.TrackballControls: The second parameter "domElement" is now mandatory.')
    }

    this.object = object
    this.domElement = domElement

    // for reset

    this.target0 = this.target.clone()
    this.position0 = this.object.position.clone()
    this.up0 = this.object.up.clone()
    this.zoom0 = this.object.zoom

    // listeners

    this.domElement.addEventListener('contextmenu', this.contextmenu)

    this.domElement.addEventListener('pointerdown', this.onPointerDown)
    this.domElement.addEventListener('wheel', this.mousewheel)

    this.domElement.addEventListener('touchstart', this.touchstart)
    this.domElement.addEventListener('touchend', this.touchend)
    this.domElement.addEventListener('touchmove', this.touchmove)

    this.domElement.ownerDocument.addEventListener('pointermove', this.onPointerMove)
    this.domElement.ownerDocument.addEventListener('pointerup', this.onPointerUp)

    window.addEventListener('keydown', this.keydown)
    window.addEventListener('keyup', this.keyup)

    this.handleResize()

    // force an update at start
    this.update()
  }

  private onScreenVector = new Vector2()

  private getMouseOnScreen = (pageX: number, pageY: number): Vector2 => {
    this.onScreenVector.set(
      (pageX - this.screen.left) / this.screen.width,
      (pageY - this.screen.top) / this.screen.height,
    )

    return this.onScreenVector
  }

  private onCircleVector = new Vector2()

  private getMouseOnCircle = (pageX: number, pageY: number): Vector2 => {
    this.onCircleVector.set(
      (pageX - this.screen.width * 0.5 - this.screen.left) / (this.screen.width * 0.5),
      (this.screen.height + 2 * (this.screen.top - pageY)) / this.screen.width, // screen.width intentional
    )

    return this.onCircleVector
  }

  private axis = new Vector3()
  private quaternion = new Quaternion()
  private eyeDirection = new Vector3()
  private objectUpDirection = new Vector3()
  private objectSidewaysDirection = new Vector3()
  private moveDirection = new Vector3()
  private angle: number = 0

  private rotateCamera = (): void => {
    this.moveDirection.set(this._moveCurr.x - this._movePrev.x, this._moveCurr.y - this._movePrev.y, 0)
    this.angle = this.moveDirection.length()

    if (this.angle) {
      this._eye.copy(this.object.position).sub(this.target)

      this.eyeDirection.copy(this._eye).normalize()
      this.objectUpDirection.copy(this.object.up).normalize()
      this.objectSidewaysDirection.crossVectors(this.objectUpDirection, this.eyeDirection).normalize()

      this.objectUpDirection.setLength(this._moveCurr.y - this._movePrev.y)
      this.objectSidewaysDirection.setLength(this._moveCurr.x - this._movePrev.x)

      this.moveDirection.copy(this.objectUpDirection.add(this.objectSidewaysDirection))

      this.axis.crossVectors(this.moveDirection, this._eye).normalize()

      this.angle *= this.rotateSpeed
      this.quaternion.setFromAxisAngle(this.axis, this.angle)

      this._eye.applyQuaternion(this.quaternion)
      this.object.up.applyQuaternion(this.quaternion)

      this._lastAxis.copy(this.axis)
      this._lastAngle = this.angle
    } else if (!this.staticMoving && this._lastAngle) {
      this._lastAngle *= Math.sqrt(1.0 - this.dynamicDampingFactor)
      this._eye.copy(this.object.position).sub(this.target)
      this.quaternion.setFromAxisAngle(this._lastAxis, this._lastAngle)
      this._eye.applyQuaternion(this.quaternion)
      this.object.up.applyQuaternion(this.quaternion)
    }

    this._movePrev.copy(this._moveCurr)
  }

  private zoomCamera = (): void => {
    let factor

    if (this._state === this.STATE.TOUCH_ZOOM_PAN) {
      factor = this._touchZoomDistanceStart / this._touchZoomDistanceEnd
      this._touchZoomDistanceStart = this._touchZoomDistanceEnd

      if ((this.object as PerspectiveCamera).isPerspectiveCamera) {
        this._eye.multiplyScalar(factor)
      } else if ((this.object as OrthographicCamera).isOrthographicCamera) {
        this.object.zoom *= factor
        this.object.updateProjectionMatrix()
      } else {
        console.warn('THREE.TrackballControls: Unsupported camera type')
      }
    } else {
      factor = 1.0 + (this._zoomEnd.y - this._zoomStart.y) * this.zoomSpeed

      if (factor !== 1.0 && factor > 0.0) {
        if ((this.object as PerspectiveCamera).isPerspectiveCamera) {
          this._eye.multiplyScalar(factor)
        } else if ((this.object as OrthographicCamera).isOrthographicCamera) {
          this.object.zoom /= factor
          this.object.updateProjectionMatrix()
        } else {
          console.warn('THREE.TrackballControls: Unsupported camera type')
        }
      }

      if (this.staticMoving) {
        this._zoomStart.copy(this._zoomEnd)
      } else {
        this._zoomStart.y += (this._zoomEnd.y - this._zoomStart.y) * this.dynamicDampingFactor
      }
    }
  }

  private mouseChange = new Vector2()
  private objectUp = new Vector3()
  private pan = new Vector3()

  private panCamera = (): void => {
    this.mouseChange.copy(this._panEnd).sub(this._panStart)

    if (this.mouseChange.lengthSq()) {
      if ((this.object as OrthographicCamera).isOrthographicCamera) {
        const orthoObject = this.object as OrthographicCamera
        const scale_x = (orthoObject.right - orthoObject.left) / this.object.zoom / this.domElement.clientWidth
        const scale_y = (orthoObject.top - orthoObject.bottom) / this.object.zoom / this.domElement.clientWidth

        this.mouseChange.x *= scale_x
        this.mouseChange.y *= scale_y
      }

      this.mouseChange.multiplyScalar(this._eye.length() * this.panSpeed)

      this.pan.copy(this._eye).cross(this.object.up).setLength(this.mouseChange.x)
      this.pan.add(this.objectUp.copy(this.object.up).setLength(this.mouseChange.y))

      this.object.position.add(this.pan)
      this.target.add(this.pan)

      if (this.staticMoving) {
        this._panStart.copy(this._panEnd)
      } else {
        this._panStart.add(
          this.mouseChange.subVectors(this._panEnd, this._panStart).multiplyScalar(this.dynamicDampingFactor),
        )
      }
    }
  }

  private checkDistances = (): void => {
    if (!this.noZoom || !this.noPan) {
      if (this._eye.lengthSq() > this.maxDistance * this.maxDistance) {
        this.object.position.addVectors(this.target, this._eye.setLength(this.maxDistance))
        this._zoomStart.copy(this._zoomEnd)
      }

      if (this._eye.lengthSq() < this.minDistance * this.minDistance) {
        this.object.position.addVectors(this.target, this._eye.setLength(this.minDistance))
        this._zoomStart.copy(this._zoomEnd)
      }
    }
  }

  private handleResize = (): void => {
    const box = this.domElement.getBoundingClientRect()
    // adjustments come from similar code in the jquery offset() function
    const d = this.domElement.ownerDocument.documentElement
    this.screen.left = box.left + window.pageXOffset - d.clientLeft
    this.screen.top = box.top + window.pageYOffset - d.clientTop
    this.screen.width = box.width
    this.screen.height = box.height
  }

  public update = (): void => {
    this._eye.subVectors(this.object.position, this.target)

    if (!this.noRotate) {
      this.rotateCamera()
    }

    if (!this.noZoom) {
      this.zoomCamera()
    }

    if (!this.noPan) {
      this.panCamera()
    }

    this.object.position.addVectors(this.target, this._eye)

    if ((this.object as PerspectiveCamera).isPerspectiveCamera) {
      this.checkDistances()

      this.object.lookAt(this.target)

      if (this.lastPosition.distanceToSquared(this.object.position) > this.EPS) {
        this.dispatchEvent(this.changeEvent)

        this.lastPosition.copy(this.object.position)
      }
    } else if ((this.object as OrthographicCamera).isOrthographicCamera) {
      this.object.lookAt(this.target)

      if (this.lastPosition.distanceToSquared(this.object.position) > this.EPS || this.lastZoom !== this.object.zoom) {
        this.dispatchEvent(this.changeEvent)

        this.lastPosition.copy(this.object.position)
        this.lastZoom = this.object.zoom
      }
    } else {
      console.warn('THREE.TrackballControls: Unsupported camera type')
    }
  }

  public reset = (): void => {
    this._state = this.STATE.NONE
    this._keyState = this.STATE.NONE

    this.target.copy(this.target0)
    this.object.position.copy(this.position0)
    this.object.up.copy(this.up0)
    this.object.zoom = this.zoom0

    this.object.updateProjectionMatrix()

    this._eye.subVectors(this.object.position, this.target)

    this.object.lookAt(this.target)

    this.dispatchEvent(this.changeEvent)

    this.lastPosition.copy(this.object.position)
    this.lastZoom = this.object.zoom
  }

  private keydown = (event: KeyboardEvent): void => {
    if (this.enabled === false) return

    window.removeEventListener('keydown', this.keydown)

    if (this._keyState !== this.STATE.NONE) {
      return
    } else if (event.keyCode === this.keys[this.STATE.ROTATE] && !this.noRotate) {
      this._keyState = this.STATE.ROTATE
    } else if (event.keyCode === this.keys[this.STATE.ZOOM] && !this.noZoom) {
      this._keyState = this.STATE.ZOOM
    } else if (event.keyCode === this.keys[this.STATE.PAN] && !this.noPan) {
      this._keyState = this.STATE.PAN
    }
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (this.enabled === false) return

    switch (event.pointerType) {
      case 'mouse':
      case 'pen':
        this.onMouseDown(event)
        break

      // TODO touch
    }
  }

  private onPointerMove = (event: PointerEvent): void => {
    if (this.enabled === false) return

    switch (event.pointerType) {
      case 'mouse':
      case 'pen':
        this.onMouseMove(event)
        break

      // TODO touch
    }
  }

  private onPointerUp = (event: PointerEvent): void => {
    if (this.enabled === false) return

    switch (event.pointerType) {
      case 'mouse':
      case 'pen':
        this.onMouseUp(event)
        break

      // TODO touch
    }
  }

  private keyup = (): void => {
    if (this.enabled === false) return

    this._keyState = this.STATE.NONE

    window.addEventListener('keydown', this.keydown)
  }

  private onMouseDown = (event: MouseEvent): void => {
    event.preventDefault()

    if (this._state === this.STATE.NONE) {
      switch (event.button) {
        case this.mouseButtons.LEFT:
          this._state = this.STATE.ROTATE
          break

        case this.mouseButtons.MIDDLE:
          this._state = this.STATE.ZOOM
          break

        case this.mouseButtons.RIGHT:
          this._state = this.STATE.PAN
          break

        default:
          this._state = this.STATE.NONE
      }
    }

    const state = this._keyState !== this.STATE.NONE ? this._keyState : this._state

    if (state === this.STATE.ROTATE && !this.noRotate) {
      this._moveCurr.copy(this.getMouseOnCircle(event.pageX, event.pageY))
      this._movePrev.copy(this._moveCurr)
    } else if (state === this.STATE.ZOOM && !this.noZoom) {
      this._zoomStart.copy(this.getMouseOnScreen(event.pageX, event.pageY))
      this._zoomEnd.copy(this._zoomStart)
    } else if (state === this.STATE.PAN && !this.noPan) {
      this._panStart.copy(this.getMouseOnScreen(event.pageX, event.pageY))
      this._panEnd.copy(this._panStart)
    }

    this.domElement.ownerDocument.addEventListener('pointermove', this.onPointerMove)
    this.domElement.ownerDocument.addEventListener('pointerup', this.onPointerUp)

    this.dispatchEvent(this.startEvent)
  }

  private onMouseMove = (event: MouseEvent): void => {
    if (this.enabled === false) return

    event.preventDefault()

    const state = this._keyState !== this.STATE.NONE ? this._keyState : this._state

    if (state === this.STATE.ROTATE && !this.noRotate) {
      this._movePrev.copy(this._moveCurr)
      this._moveCurr.copy(this.getMouseOnCircle(event.pageX, event.pageY))
    } else if (state === this.STATE.ZOOM && !this.noZoom) {
      this._zoomEnd.copy(this.getMouseOnScreen(event.pageX, event.pageY))
    } else if (state === this.STATE.PAN && !this.noPan) {
      this._panEnd.copy(this.getMouseOnScreen(event.pageX, event.pageY))
    }
  }

  private onMouseUp = (event: MouseEvent): void => {
    if (this.enabled === false) return

    event.preventDefault()

    this._state = this.STATE.NONE

    this.domElement.ownerDocument.removeEventListener('pointermove', this.onPointerMove)
    this.domElement.ownerDocument.removeEventListener('pointerup', this.onPointerUp)

    this.dispatchEvent(this.endEvent)
  }

  private mousewheel = (event: WheelEvent): void => {
    if (this.enabled === false) return

    if (this.noZoom === true) return

    event.preventDefault()

    switch (event.deltaMode) {
      case 2:
        // Zoom in pages
        this._zoomStart.y -= event.deltaY * 0.025
        break

      case 1:
        // Zoom in lines
        this._zoomStart.y -= event.deltaY * 0.01
        break

      default:
        // undefined, 0, assume pixels
        this._zoomStart.y -= event.deltaY * 0.00025
        break
    }

    this.dispatchEvent(this.startEvent)
    this.dispatchEvent(this.endEvent)
  }

  private touchstart = (event: TouchEvent): void => {
    if (this.enabled === false) return

    event.preventDefault()

    switch (event.touches.length) {
      case 1:
        this._state = this.STATE.TOUCH_ROTATE
        this._moveCurr.copy(this.getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY))
        this._movePrev.copy(this._moveCurr)
        break

      default:
        // 2 or more
        this._state = this.STATE.TOUCH_ZOOM_PAN
        const dx = event.touches[0].pageX - event.touches[1].pageX
        const dy = event.touches[0].pageY - event.touches[1].pageY
        this._touchZoomDistanceEnd = this._touchZoomDistanceStart = Math.sqrt(dx * dx + dy * dy)

        const x = (event.touches[0].pageX + event.touches[1].pageX) / 2
        const y = (event.touches[0].pageY + event.touches[1].pageY) / 2
        this._panStart.copy(this.getMouseOnScreen(x, y))
        this._panEnd.copy(this._panStart)
        break
    }

    this.dispatchEvent(this.startEvent)
  }

  private touchmove = (event: TouchEvent): void => {
    if (this.enabled === false) return

    event.preventDefault()

    switch (event.touches.length) {
      case 1:
        this._movePrev.copy(this._moveCurr)
        this._moveCurr.copy(this.getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY))
        break

      default:
        // 2 or more
        const dx = event.touches[0].pageX - event.touches[1].pageX
        const dy = event.touches[0].pageY - event.touches[1].pageY
        this._touchZoomDistanceEnd = Math.sqrt(dx * dx + dy * dy)

        const x = (event.touches[0].pageX + event.touches[1].pageX) / 2
        const y = (event.touches[0].pageY + event.touches[1].pageY) / 2
        this._panEnd.copy(this.getMouseOnScreen(x, y))
        break
    }
  }

  private touchend = (event: TouchEvent): void => {
    if (this.enabled === false) return

    switch (event.touches.length) {
      case 0:
        this._state = this.STATE.NONE
        break

      case 1:
        this._state = this.STATE.TOUCH_ROTATE
        this._moveCurr.copy(this.getMouseOnCircle(event.touches[0].pageX, event.touches[0].pageY))
        this._movePrev.copy(this._moveCurr)
        break
    }

    this.dispatchEvent(this.endEvent)
  }

  private contextmenu = (event: MouseEvent): void => {
    if (this.enabled === false) return

    event.preventDefault()
  }

  public dispose = (): void => {
    this.domElement.removeEventListener('contextmenu', this.contextmenu)

    this.domElement.removeEventListener('pointerdown', this.onPointerDown)
    this.domElement.removeEventListener('wheel', this.mousewheel)

    this.domElement.removeEventListener('touchstart', this.touchstart)
    this.domElement.removeEventListener('touchend', this.touchend)
    this.domElement.removeEventListener('touchmove', this.touchmove)

    this.domElement.ownerDocument.removeEventListener('pointermove', this.onPointerMove)
    this.domElement.ownerDocument.removeEventListener('pointerup', this.onPointerUp)

    window.removeEventListener('keydown', this.keydown)
    window.removeEventListener('keyup', this.keyup)
  }
}

export { TrackballControls }
