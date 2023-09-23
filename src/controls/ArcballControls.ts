import {
  GridHelper,
  EllipseCurve,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Raycaster,
  Group,
  Box3,
  Sphere,
  Quaternion,
  Vector2,
  Vector3,
  Matrix4,
  MathUtils,
  Scene,
  PerspectiveCamera,
  OrthographicCamera,
  Mesh,
  Material,
  EventDispatcher,
} from 'three'

type Camera = OrthographicCamera | PerspectiveCamera
type Operation = 'PAN' | 'ROTATE' | 'ZOOM' | 'FOV'
type MouseButtonType = number | 'WHEEL'
type ModifierKey = 'CTRL' | 'SHIFT'
type MouseAction = {
  operation: Operation
  mouse: MouseButtonType
  key: ModifierKey | null
}

type Transformation = {
  camera: Matrix4 | null
  gizmos: Matrix4 | null
}

//trackball state
const STATE = {
  IDLE: Symbol(),
  ROTATE: Symbol(),
  PAN: Symbol(),
  SCALE: Symbol(),
  FOV: Symbol(),
  FOCUS: Symbol(),
  ZROTATE: Symbol(),
  TOUCH_MULTI: Symbol(),
  ANIMATION_FOCUS: Symbol(),
  ANIMATION_ROTATE: Symbol(),
}

const INPUT = {
  NONE: Symbol(),
  ONE_FINGER: Symbol(),
  ONE_FINGER_SWITCHED: Symbol(),
  TWO_FINGER: Symbol(),
  MULT_FINGER: Symbol(),
  CURSOR: Symbol(),
}

//cursor center coordinates
const _center = {
  x: 0,
  y: 0,
}

//transformation matrices for gizmos and camera
const _transformation: Transformation = {
  camera: new Matrix4(),
  gizmos: new Matrix4(),
}

//events
const _changeEvent = { type: 'change' }
const _startEvent = { type: 'start' }
const _endEvent = { type: 'end' }

/**
 *
 * @param {CamOrthographicCamera | PerspectiveCameraera} camera Virtual camera used in the scene
 * @param {HTMLElement=null} domElement Renderer's dom element
 * @param {Scene=null} scene The scene to be rendered
 */
class ArcballControls extends EventDispatcher {
  private camera: OrthographicCamera | PerspectiveCamera | null
  private domElement: HTMLElement | null | undefined
  private scene: Scene | null | undefined

  private mouseActions: (MouseAction & { state: Symbol })[]
  private _mouseOp: Operation | null

  private _v2_1: Vector2
  private _v3_1: Vector3
  private _v3_2: Vector3

  private _m4_1: Matrix4
  private _m4_2: Matrix4

  private _quat: Quaternion

  private _translationMatrix: Matrix4
  private _rotationMatrix: Matrix4
  private _scaleMatrix: Matrix4

  private _rotationAxis: Vector3

  private _cameraMatrixState: Matrix4
  private _cameraProjectionState: Matrix4

  private _fovState: number
  private _upState: Vector3
  private _zoomState: number
  private _nearPos: number
  private _farPos: number

  private _gizmoMatrixState: Matrix4

  private _up0: Vector3
  private _zoom0: number
  private _fov0: number
  private _initialNear: number
  private _nearPos0: number
  private _initialFar: number
  private _farPos0: number
  private _cameraMatrixState0: Matrix4
  private _gizmoMatrixState0: Matrix4

  private _button: MouseButtonType
  private _touchStart: PointerEvent[]
  private _touchCurrent: PointerEvent[]
  private _input: Symbol

  private _switchSensibility: number
  private _startFingerDistance: number
  private _currentFingerDistance: number
  private _startFingerRotation: number
  private _currentFingerRotation: number

  private _devPxRatio: number
  private _downValid: boolean
  private _nclicks: number
  private _downEvents: PointerEvent[]
  private _clickStart: number
  private _maxDownTime: number
  private _maxInterval: number
  private _posThreshold: number
  private _movementThreshold: number

  private _currentCursorPosition: Vector3
  private _startCursorPosition: Vector3

  private _grid: GridHelper | null
  private _gridPosition: Vector3

  private _gizmos: Group
  private _curvePts: number

  private _timeStart: number
  private _animationId: number

  public focusAnimationTime: number

  private _timePrev: number
  private _timeCurrent: number
  private _anglePrev: number
  private _angleCurrent: number
  private _cursorPosPrev: Vector3
  private _cursorPosCurr: Vector3
  private _wPrev: number
  private _wCurr: number

  public adjustNearFar: boolean
  public scaleFactor: number
  public dampingFactor: number
  public wMax: number
  public enableAnimations: boolean
  public enableGrid: boolean
  public cursorZoom: boolean
  public minFov: number
  public maxFov: number

  public enabled: boolean
  public enablePan: boolean
  public enableRotate: boolean
  public enableZoom: boolean

  public minDistance: number
  public maxDistance: number
  public minZoom: number
  public maxZoom: number

  private target: Vector3
  private _currentTarget: Vector3

  private _tbRadius: number

  private _state: Symbol

  constructor(
    camera: Camera | null,
    domElement: HTMLElement | null | undefined = null,
    scene: Scene | null | undefined = null,
  ) {
    super()
    this.camera = null
    this.domElement = domElement
    this.scene = scene

    this.mouseActions = []
    this._mouseOp = null

    //global vectors and matrices that are used in some operations to avoid creating new objects every time (e.g. every time cursor moves)
    this._v2_1 = new Vector2()
    this._v3_1 = new Vector3()
    this._v3_2 = new Vector3()

    this._m4_1 = new Matrix4()
    this._m4_2 = new Matrix4()

    this._quat = new Quaternion()

    //transformation matrices
    this._translationMatrix = new Matrix4() //matrix for translation operation
    this._rotationMatrix = new Matrix4() //matrix for rotation operation
    this._scaleMatrix = new Matrix4() //matrix for scaling operation

    this._rotationAxis = new Vector3() //axis for rotate operation

    //camera state
    this._cameraMatrixState = new Matrix4()
    this._cameraProjectionState = new Matrix4()

    this._fovState = 1
    this._upState = new Vector3()
    this._zoomState = 1
    this._nearPos = 0
    this._farPos = 0

    this._gizmoMatrixState = new Matrix4()

    //initial values
    this._up0 = new Vector3()
    this._zoom0 = 1
    this._fov0 = 0
    this._initialNear = 0
    this._nearPos0 = 0
    this._initialFar = 0
    this._farPos0 = 0
    this._cameraMatrixState0 = new Matrix4()
    this._gizmoMatrixState0 = new Matrix4()

    //pointers array
    this._button = -1
    this._touchStart = []
    this._touchCurrent = []
    this._input = INPUT.NONE

    //two fingers touch interaction
    this._switchSensibility = 32 //minimum movement to be performed to fire single pan start after the second finger has been released
    this._startFingerDistance = 0 //distance between two fingers
    this._currentFingerDistance = 0
    this._startFingerRotation = 0 //amount of rotation performed with two fingers
    this._currentFingerRotation = 0

    //double tap
    this._devPxRatio = 0
    this._downValid = true
    this._nclicks = 0
    this._downEvents = []
    this._clickStart = 0 //first click time
    this._maxDownTime = 250
    this._maxInterval = 300
    this._posThreshold = 24
    this._movementThreshold = 24

    //cursor positions
    this._currentCursorPosition = new Vector3()
    this._startCursorPosition = new Vector3()

    //grid
    this._grid = null //grid to be visualized during pan operation
    this._gridPosition = new Vector3()

    //gizmos
    this._gizmos = new Group()
    this._curvePts = 128

    //animations
    this._timeStart = -1 //initial time
    this._animationId = -1

    //focus animation
    this.focusAnimationTime = 500 //duration of focus animation in ms

    //rotate animation
    this._timePrev = 0 //time at which previous rotate operation has been detected
    this._timeCurrent = 0 //time at which current rotate operation has been detected
    this._anglePrev = 0 //angle of previous rotation
    this._angleCurrent = 0 //angle of current rotation
    this._cursorPosPrev = new Vector3() //cursor position when previous rotate operation has been detected
    this._cursorPosCurr = new Vector3() //cursor position when current rotate operation has been detected
    this._wPrev = 0 //angular velocity of the previous rotate operation
    this._wCurr = 0 //angular velocity of the current rotate operation

    //parameters
    this.adjustNearFar = false
    this.scaleFactor = 1.1 //zoom/distance multiplier
    this.dampingFactor = 25
    this.wMax = 20 //maximum angular velocity allowed
    this.enableAnimations = true //if animations should be performed
    this.enableGrid = false //if grid should be showed during pan operation
    this.cursorZoom = false //if wheel zoom should be cursor centered
    this.minFov = 5
    this.maxFov = 90

    this.enabled = true
    this.enablePan = true
    this.enableRotate = true
    this.enableZoom = true

    this.minDistance = 0
    this.maxDistance = Infinity
    this.minZoom = 0
    this.maxZoom = Infinity

    //trackball parameters
    this.target = new Vector3(0, 0, 0)
    this._currentTarget = new Vector3(0, 0, 0)

    this._tbRadius = 1

    //FSA
    this._state = STATE.IDLE

    this.setCamera(camera)

    if (this.scene) {
      this.scene.add(this._gizmos)
    }

    this._devPxRatio = window.devicePixelRatio

    this.initializeMouseActions()

    if (this.domElement) this.connect(this.domElement)

    window.addEventListener('resize', this.onWindowResize)
  }

  //listeners

  private onWindowResize = (): void => {
    const scale = (this._gizmos.scale.x + this._gizmos.scale.y + this._gizmos.scale.z) / 3
    if (this.camera) {
      const tbRadius = this.calculateTbRadius(this.camera)
      if (tbRadius !== undefined) {
        this._tbRadius = tbRadius
      }
    }

    const newRadius = this._tbRadius / scale
    // @ts-ignore
    const curve = new EllipseCurve(0, 0, newRadius, newRadius)
    const points = curve.getPoints(this._curvePts)
    const curveGeometry = new BufferGeometry().setFromPoints(points)

    for (const gizmo in this._gizmos.children) {
      const child = this._gizmos.children[gizmo] as Mesh
      child.geometry = curveGeometry
    }

    this.dispatchEvent(_changeEvent)
  }

  private onContextMenu = (event: MouseEvent): void => {
    if (!this.enabled) {
      return
    }

    for (let i = 0; i < this.mouseActions.length; i++) {
      if (this.mouseActions[i].mouse == 2) {
        //prevent only if button 2 is actually used
        event.preventDefault()
        break
      }
    }
  }

  private onPointerCancel = (): void => {
    this._touchStart.splice(0, this._touchStart.length)
    this._touchCurrent.splice(0, this._touchCurrent.length)
    this._input = INPUT.NONE
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (event.button == 0 && event.isPrimary) {
      this._downValid = true
      this._downEvents.push(event)
    } else {
      this._downValid = false
    }

    if (event.pointerType == 'touch' && this._input != INPUT.CURSOR) {
      this._touchStart.push(event)
      this._touchCurrent.push(event)

      switch (this._input) {
        case INPUT.NONE:
          //singleStart
          this._input = INPUT.ONE_FINGER
          this.onSinglePanStart(event, 'ROTATE')

          window.addEventListener('pointermove', this.onPointerMove)
          window.addEventListener('pointerup', this.onPointerUp)

          break

        case INPUT.ONE_FINGER:
        case INPUT.ONE_FINGER_SWITCHED:
          //doubleStart
          this._input = INPUT.TWO_FINGER

          this.onRotateStart()
          this.onPinchStart()
          this.onDoublePanStart()

          break

        case INPUT.TWO_FINGER:
          //multipleStart
          this._input = INPUT.MULT_FINGER
          this.onTriplePanStart()
          break
      }
    } else if (event.pointerType != 'touch' && this._input == INPUT.NONE) {
      let modifier: ModifierKey | null = null

      if (event.ctrlKey || event.metaKey) {
        modifier = 'CTRL'
      } else if (event.shiftKey) {
        modifier = 'SHIFT'
      }

      this._mouseOp = this.getOpFromAction(event.button, modifier)
      if (this._mouseOp) {
        window.addEventListener('pointermove', this.onPointerMove)
        window.addEventListener('pointerup', this.onPointerUp)

        //singleStart
        this._input = INPUT.CURSOR
        this._button = event.button
        this.onSinglePanStart(event, this._mouseOp)
      }
    }
  }

  private onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType == 'touch' && this._input != INPUT.CURSOR) {
      switch (this._input) {
        case INPUT.ONE_FINGER:
          //singleMove
          this.updateTouchEvent(event)

          this.onSinglePanMove(event, STATE.ROTATE)
          break

        case INPUT.ONE_FINGER_SWITCHED:
          const movement = this.calculatePointersDistance(this._touchCurrent[0], event) * this._devPxRatio

          if (movement >= this._switchSensibility) {
            //singleMove
            this._input = INPUT.ONE_FINGER
            this.updateTouchEvent(event)

            this.onSinglePanStart(event, 'ROTATE')
            break
          }

          break

        case INPUT.TWO_FINGER:
          //rotate/pan/pinchMove
          this.updateTouchEvent(event)

          this.onRotateMove()
          this.onPinchMove()
          this.onDoublePanMove()

          break

        case INPUT.MULT_FINGER:
          //multMove
          this.updateTouchEvent(event)

          this.onTriplePanMove()
          break
      }
    } else if (event.pointerType != 'touch' && this._input == INPUT.CURSOR) {
      let modifier: ModifierKey | null = null

      if (event.ctrlKey || event.metaKey) {
        modifier = 'CTRL'
      } else if (event.shiftKey) {
        modifier = 'SHIFT'
      }

      const mouseOpState = this.getOpStateFromAction(this._button, modifier)

      if (mouseOpState) {
        this.onSinglePanMove(event, mouseOpState)
      }
    }

    //checkDistance
    if (this._downValid) {
      const movement =
        this.calculatePointersDistance(this._downEvents[this._downEvents.length - 1], event) * this._devPxRatio
      if (movement > this._movementThreshold) {
        this._downValid = false
      }
    }
  }

  private onPointerUp = (event: PointerEvent): void => {
    if (event.pointerType == 'touch' && this._input != INPUT.CURSOR) {
      const nTouch = this._touchCurrent.length

      for (let i = 0; i < nTouch; i++) {
        if (this._touchCurrent[i].pointerId == event.pointerId) {
          this._touchCurrent.splice(i, 1)
          this._touchStart.splice(i, 1)
          break
        }
      }

      switch (this._input) {
        case INPUT.ONE_FINGER:
        case INPUT.ONE_FINGER_SWITCHED:
          //singleEnd
          window.removeEventListener('pointermove', this.onPointerMove)
          window.removeEventListener('pointerup', this.onPointerUp)

          this._input = INPUT.NONE
          this.onSinglePanEnd()

          break

        case INPUT.TWO_FINGER:
          //doubleEnd
          this.onDoublePanEnd()
          this.onPinchEnd()
          this.onRotateEnd()

          //switching to singleStart
          this._input = INPUT.ONE_FINGER_SWITCHED

          break

        case INPUT.MULT_FINGER:
          if (this._touchCurrent.length == 0) {
            window.removeEventListener('pointermove', this.onPointerMove)
            window.removeEventListener('pointerup', this.onPointerUp)

            //multCancel
            this._input = INPUT.NONE
            this.onTriplePanEnd()
          }

          break
      }
    } else if (event.pointerType != 'touch' && this._input == INPUT.CURSOR) {
      window.removeEventListener('pointermove', this.onPointerMove)
      window.removeEventListener('pointerup', this.onPointerUp)

      this._input = INPUT.NONE
      this.onSinglePanEnd()
      this._button = -1
    }

    if (event.isPrimary) {
      if (this._downValid) {
        const downTime = event.timeStamp - this._downEvents[this._downEvents.length - 1].timeStamp

        if (downTime <= this._maxDownTime) {
          if (this._nclicks == 0) {
            //first valid click detected
            this._nclicks = 1
            this._clickStart = performance.now()
          } else {
            const clickInterval = event.timeStamp - this._clickStart
            const movement = this.calculatePointersDistance(this._downEvents[1], this._downEvents[0]) * this._devPxRatio

            if (clickInterval <= this._maxInterval && movement <= this._posThreshold) {
              //second valid click detected
              //fire double tap and reset values
              this._nclicks = 0
              this._downEvents.splice(0, this._downEvents.length)
              this.onDoubleTap(event)
            } else {
              //new 'first click'
              this._nclicks = 1
              this._downEvents.shift()
              this._clickStart = performance.now()
            }
          }
        } else {
          this._downValid = false
          this._nclicks = 0
          this._downEvents.splice(0, this._downEvents.length)
        }
      } else {
        this._nclicks = 0
        this._downEvents.splice(0, this._downEvents.length)
      }
    }
  }

  private onWheel = (event: WheelEvent): void => {
    if (this.enabled && this.enableZoom && this.domElement) {
      let modifier: ModifierKey | null = null

      if (event.ctrlKey || event.metaKey) {
        modifier = 'CTRL'
      } else if (event.shiftKey) {
        modifier = 'SHIFT'
      }

      const mouseOp = this.getOpFromAction('WHEEL', modifier)

      if (mouseOp) {
        event.preventDefault()
        this.dispatchEvent(_startEvent)

        const notchDeltaY = 125 //distance of one notch of mouse wheel
        let sgn = event.deltaY / notchDeltaY

        let size = 1

        if (sgn > 0) {
          size = 1 / this.scaleFactor
        } else if (sgn < 0) {
          size = this.scaleFactor
        }

        switch (mouseOp) {
          case 'ZOOM':
            this.updateTbState(STATE.SCALE, true)

            if (sgn > 0) {
              size = 1 / Math.pow(this.scaleFactor, sgn)
            } else if (sgn < 0) {
              size = Math.pow(this.scaleFactor, -sgn)
            }

            if (this.cursorZoom && this.enablePan) {
              let scalePoint

              if (this.camera instanceof OrthographicCamera) {
                scalePoint = this.unprojectOnTbPlane(this.camera, event.clientX, event.clientY, this.domElement)
                  ?.applyQuaternion(this.camera.quaternion)
                  .multiplyScalar(1 / this.camera.zoom)
                  .add(this._gizmos.position)
              }

              if (this.camera instanceof PerspectiveCamera) {
                scalePoint = this.unprojectOnTbPlane(this.camera, event.clientX, event.clientY, this.domElement)
                  ?.applyQuaternion(this.camera.quaternion)
                  .add(this._gizmos.position)
              }

              if (scalePoint !== undefined) this.applyTransformMatrix(this.applyScale(size, scalePoint))
            } else {
              this.applyTransformMatrix(this.applyScale(size, this._gizmos.position))
            }

            if (this._grid) {
              this.disposeGrid()
              this.drawGrid()
            }

            this.updateTbState(STATE.IDLE, false)

            this.dispatchEvent(_changeEvent)
            this.dispatchEvent(_endEvent)

            break

          case 'FOV':
            if (this.camera instanceof PerspectiveCamera) {
              this.updateTbState(STATE.FOV, true)

              //Vertigo effect

              //	  fov / 2
              //		|\
              //		| \
              //		|  \
              //	x	|	\
              //		| 	 \
              //		| 	  \
              //		| _ _ _\
              //			y

              //check for iOs shift shortcut
              if (event.deltaX != 0) {
                sgn = event.deltaX / notchDeltaY

                size = 1

                if (sgn > 0) {
                  size = 1 / Math.pow(this.scaleFactor, sgn)
                } else if (sgn < 0) {
                  size = Math.pow(this.scaleFactor, -sgn)
                }
              }

              this._v3_1.setFromMatrixPosition(this._cameraMatrixState)
              const x = this._v3_1.distanceTo(this._gizmos.position)
              let xNew = x / size //distance between camera and gizmos if scale(size, scalepoint) would be performed

              //check min and max distance
              xNew = MathUtils.clamp(xNew, this.minDistance, this.maxDistance)

              const y = x * Math.tan(MathUtils.DEG2RAD * this.camera.fov * 0.5)

              //calculate new fov
              let newFov = MathUtils.RAD2DEG * (Math.atan(y / xNew) * 2)

              //check min and max fov
              if (newFov > this.maxFov) {
                newFov = this.maxFov
              } else if (newFov < this.minFov) {
                newFov = this.minFov
              }

              const newDistance = y / Math.tan(MathUtils.DEG2RAD * (newFov / 2))
              size = x / newDistance

              this.setFov(newFov)
              this.applyTransformMatrix(this.applyScale(size, this._gizmos.position, false))
            }

            if (this._grid) {
              this.disposeGrid()
              this.drawGrid()
            }

            this.updateTbState(STATE.IDLE, false)

            this.dispatchEvent(_changeEvent)
            this.dispatchEvent(_endEvent)

            break
        }
      }
    }
  }

  private onSinglePanStart = (event: PointerEvent, operation: Operation): void => {
    if (this.enabled && this.domElement) {
      this.dispatchEvent(_startEvent)

      this.setCenter(event.clientX, event.clientY)

      switch (operation) {
        case 'PAN':
          if (!this.enablePan) return

          if (this._animationId != -1) {
            cancelAnimationFrame(this._animationId)
            this._animationId = -1
            this._timeStart = -1

            this.activateGizmos(false)
            this.dispatchEvent(_changeEvent)
          }

          if (this.camera) {
            this.updateTbState(STATE.PAN, true)
            const rayDir = this.unprojectOnTbPlane(this.camera, _center.x, _center.y, this.domElement)
            if (rayDir !== undefined) {
              this._startCursorPosition.copy(rayDir)
            }
            if (this.enableGrid) {
              this.drawGrid()
              this.dispatchEvent(_changeEvent)
            }
          }

          break

        case 'ROTATE':
          if (!this.enableRotate) return

          if (this._animationId != -1) {
            cancelAnimationFrame(this._animationId)
            this._animationId = -1
            this._timeStart = -1
          }

          if (this.camera) {
            this.updateTbState(STATE.ROTATE, true)
            const rayDir = this.unprojectOnTbSurface(this.camera, _center.x, _center.y, this.domElement, this._tbRadius)
            if (rayDir !== undefined) {
              this._startCursorPosition.copy(rayDir)
            }
            this.activateGizmos(true)
            if (this.enableAnimations) {
              this._timePrev = this._timeCurrent = performance.now()
              this._angleCurrent = this._anglePrev = 0
              this._cursorPosPrev.copy(this._startCursorPosition)
              this._cursorPosCurr.copy(this._cursorPosPrev)
              this._wCurr = 0
              this._wPrev = this._wCurr
            }
          }

          this.dispatchEvent(_changeEvent)
          break

        case 'FOV':
          if (!this.enableZoom) return

          if (this.camera instanceof PerspectiveCamera) {
            if (this._animationId != -1) {
              cancelAnimationFrame(this._animationId)
              this._animationId = -1
              this._timeStart = -1

              this.activateGizmos(false)
              this.dispatchEvent(_changeEvent)
            }

            this.updateTbState(STATE.FOV, true)
            this._startCursorPosition.setY(this.getCursorNDC(_center.x, _center.y, this.domElement).y * 0.5)
            this._currentCursorPosition.copy(this._startCursorPosition)
          }
          break

        case 'ZOOM':
          if (!this.enableZoom) return

          if (this._animationId != -1) {
            cancelAnimationFrame(this._animationId)
            this._animationId = -1
            this._timeStart = -1

            this.activateGizmos(false)
            this.dispatchEvent(_changeEvent)
          }

          this.updateTbState(STATE.SCALE, true)
          this._startCursorPosition.setY(this.getCursorNDC(_center.x, _center.y, this.domElement).y * 0.5)
          this._currentCursorPosition.copy(this._startCursorPosition)
          break
      }
    }
  }

  private onSinglePanMove = (event: PointerEvent, opState: Symbol): void => {
    if (this.enabled && this.domElement) {
      const restart = opState != this._state
      this.setCenter(event.clientX, event.clientY)

      switch (opState) {
        case STATE.PAN:
          if (this.enablePan && this.camera) {
            if (restart) {
              //switch to pan operation

              this.dispatchEvent(_endEvent)
              this.dispatchEvent(_startEvent)

              this.updateTbState(opState, true)
              const rayDir = this.unprojectOnTbPlane(this.camera, _center.x, _center.y, this.domElement)
              if (rayDir !== undefined) {
                this._startCursorPosition.copy(rayDir)
              }
              if (this.enableGrid) {
                this.drawGrid()
              }

              this.activateGizmos(false)
            } else {
              //continue with pan operation
              const rayDir = this.unprojectOnTbPlane(this.camera, _center.x, _center.y, this.domElement)
              if (rayDir !== undefined) {
                this._currentCursorPosition.copy(rayDir)
              }
              this.applyTransformMatrix(this.pan(this._startCursorPosition, this._currentCursorPosition))
            }
          }

          break

        case STATE.ROTATE:
          if (this.enableRotate && this.camera) {
            if (restart) {
              //switch to rotate operation

              this.dispatchEvent(_endEvent)
              this.dispatchEvent(_startEvent)

              this.updateTbState(opState, true)
              const rayDir = this.unprojectOnTbSurface(
                this.camera,
                _center.x,
                _center.y,
                this.domElement,
                this._tbRadius,
              )
              if (rayDir !== undefined) {
                this._startCursorPosition.copy(rayDir)
              }

              if (this.enableGrid) {
                this.disposeGrid()
              }

              this.activateGizmos(true)
            } else {
              //continue with rotate operation
              const rayDir = this.unprojectOnTbSurface(
                this.camera,
                _center.x,
                _center.y,
                this.domElement,
                this._tbRadius,
              )
              if (rayDir !== undefined) {
                this._currentCursorPosition.copy(rayDir)
              }

              const distance = this._startCursorPosition.distanceTo(this._currentCursorPosition)
              const angle = this._startCursorPosition.angleTo(this._currentCursorPosition)
              const amount = Math.max(distance / this._tbRadius, angle) //effective rotation angle

              this.applyTransformMatrix(
                this.rotate(this.calculateRotationAxis(this._startCursorPosition, this._currentCursorPosition), amount),
              )

              if (this.enableAnimations) {
                this._timePrev = this._timeCurrent
                this._timeCurrent = performance.now()
                this._anglePrev = this._angleCurrent
                this._angleCurrent = amount
                this._cursorPosPrev.copy(this._cursorPosCurr)
                this._cursorPosCurr.copy(this._currentCursorPosition)
                this._wPrev = this._wCurr
                this._wCurr = this.calculateAngularSpeed(
                  this._anglePrev,
                  this._angleCurrent,
                  this._timePrev,
                  this._timeCurrent,
                )
              }
            }
          }

          break

        case STATE.SCALE:
          if (this.enableZoom) {
            if (restart) {
              //switch to zoom operation

              this.dispatchEvent(_endEvent)
              this.dispatchEvent(_startEvent)

              this.updateTbState(opState, true)
              this._startCursorPosition.setY(this.getCursorNDC(_center.x, _center.y, this.domElement).y * 0.5)
              this._currentCursorPosition.copy(this._startCursorPosition)

              if (this.enableGrid) {
                this.disposeGrid()
              }

              this.activateGizmos(false)
            } else {
              //continue with zoom operation
              const screenNotches = 8 //how many wheel notches corresponds to a full screen pan
              this._currentCursorPosition.setY(this.getCursorNDC(_center.x, _center.y, this.domElement).y * 0.5)

              const movement = this._currentCursorPosition.y - this._startCursorPosition.y

              let size = 1

              if (movement < 0) {
                size = 1 / Math.pow(this.scaleFactor, -movement * screenNotches)
              } else if (movement > 0) {
                size = Math.pow(this.scaleFactor, movement * screenNotches)
              }

              this.applyTransformMatrix(this.applyScale(size, this._gizmos.position))
            }
          }

          break

        case STATE.FOV:
          if (this.enableZoom && this.camera instanceof PerspectiveCamera) {
            if (restart) {
              //switch to fov operation

              this.dispatchEvent(_endEvent)
              this.dispatchEvent(_startEvent)

              this.updateTbState(opState, true)
              this._startCursorPosition.setY(this.getCursorNDC(_center.x, _center.y, this.domElement).y * 0.5)
              this._currentCursorPosition.copy(this._startCursorPosition)

              if (this.enableGrid) {
                this.disposeGrid()
              }

              this.activateGizmos(false)
            } else {
              //continue with fov operation
              const screenNotches = 8 //how many wheel notches corresponds to a full screen pan
              this._currentCursorPosition.setY(this.getCursorNDC(_center.x, _center.y, this.domElement).y * 0.5)

              const movement = this._currentCursorPosition.y - this._startCursorPosition.y

              let size = 1

              if (movement < 0) {
                size = 1 / Math.pow(this.scaleFactor, -movement * screenNotches)
              } else if (movement > 0) {
                size = Math.pow(this.scaleFactor, movement * screenNotches)
              }

              this._v3_1.setFromMatrixPosition(this._cameraMatrixState)
              const x = this._v3_1.distanceTo(this._gizmos.position)
              let xNew = x / size //distance between camera and gizmos if scale(size, scalepoint) would be performed

              //check min and max distance
              xNew = MathUtils.clamp(xNew, this.minDistance, this.maxDistance)

              const y = x * Math.tan(MathUtils.DEG2RAD * this._fovState * 0.5)

              //calculate new fov
              let newFov = MathUtils.RAD2DEG * (Math.atan(y / xNew) * 2)

              //check min and max fov
              newFov = MathUtils.clamp(newFov, this.minFov, this.maxFov)

              const newDistance = y / Math.tan(MathUtils.DEG2RAD * (newFov / 2))
              size = x / newDistance
              this._v3_2.setFromMatrixPosition(this._gizmoMatrixState)

              this.setFov(newFov)
              this.applyTransformMatrix(this.applyScale(size, this._v3_2, false))

              //adjusting distance
              const direction = this._gizmos.position
                .clone()
                .sub(this.camera.position)
                .normalize()
                .multiplyScalar(newDistance / x)
              this._m4_1.makeTranslation(direction.x, direction.y, direction.z)
            }
          }

          break
      }

      this.dispatchEvent(_changeEvent)
    }
  }

  private onSinglePanEnd = (): void => {
    if (this._state == STATE.ROTATE) {
      if (!this.enableRotate) {
        return
      }

      if (this.enableAnimations) {
        //perform rotation animation
        const deltaTime = performance.now() - this._timeCurrent
        if (deltaTime < 120) {
          const w = Math.abs((this._wPrev + this._wCurr) / 2)

          const self = this
          this._animationId = window.requestAnimationFrame(function (t) {
            self.updateTbState(STATE.ANIMATION_ROTATE, true)
            const rotationAxis = self.calculateRotationAxis(self._cursorPosPrev, self._cursorPosCurr)

            self.onRotationAnim(t, rotationAxis, Math.min(w, self.wMax))
          })
        } else {
          //cursor has been standing still for over 120 ms since last movement
          this.updateTbState(STATE.IDLE, false)
          this.activateGizmos(false)
          this.dispatchEvent(_changeEvent)
        }
      } else {
        this.updateTbState(STATE.IDLE, false)
        this.activateGizmos(false)
        this.dispatchEvent(_changeEvent)
      }
    } else if (this._state == STATE.PAN || this._state == STATE.IDLE) {
      this.updateTbState(STATE.IDLE, false)

      if (this.enableGrid) {
        this.disposeGrid()
      }

      this.activateGizmos(false)
      this.dispatchEvent(_changeEvent)
    }

    this.dispatchEvent(_endEvent)
  }

  private onDoubleTap = (event: PointerEvent): void => {
    if (this.enabled && this.enablePan && this.scene && this.camera && this.domElement) {
      this.dispatchEvent(_startEvent)

      this.setCenter(event.clientX, event.clientY)
      const hitP = this.unprojectOnObj(this.getCursorNDC(_center.x, _center.y, this.domElement), this.camera)

      if (hitP && this.enableAnimations) {
        const self = this
        if (this._animationId != -1) {
          window.cancelAnimationFrame(this._animationId)
        }

        this._timeStart = -1
        this._animationId = window.requestAnimationFrame(function (t) {
          self.updateTbState(STATE.ANIMATION_FOCUS, true)
          self.onFocusAnim(t, hitP, self._cameraMatrixState, self._gizmoMatrixState)
        })
      } else if (hitP && !this.enableAnimations) {
        this.updateTbState(STATE.FOCUS, true)
        this.focus(hitP, this.scaleFactor)
        this.updateTbState(STATE.IDLE, false)
        this.dispatchEvent(_changeEvent)
      }
    }

    this.dispatchEvent(_endEvent)
  }

  private onDoublePanStart = (): void => {
    if (this.enabled && this.enablePan && this.camera && this.domElement) {
      this.dispatchEvent(_startEvent)

      this.updateTbState(STATE.PAN, true)

      this.setCenter(
        (this._touchCurrent[0].clientX + this._touchCurrent[1].clientX) / 2,
        (this._touchCurrent[0].clientY + this._touchCurrent[1].clientY) / 2,
      )

      const rayDir = this.unprojectOnTbPlane(this.camera, _center.x, _center.y, this.domElement, true)
      if (rayDir !== undefined) {
        this._startCursorPosition.copy(rayDir)
      }
      this._currentCursorPosition.copy(this._startCursorPosition)

      this.activateGizmos(false)
    }
  }

  private onDoublePanMove = (): void => {
    if (this.enabled && this.enablePan && this.camera && this.domElement) {
      this.setCenter(
        (this._touchCurrent[0].clientX + this._touchCurrent[1].clientX) / 2,
        (this._touchCurrent[0].clientY + this._touchCurrent[1].clientY) / 2,
      )

      if (this._state != STATE.PAN) {
        this.updateTbState(STATE.PAN, true)
        this._startCursorPosition.copy(this._currentCursorPosition)
      }

      const rayDir = this.unprojectOnTbPlane(this.camera, _center.x, _center.y, this.domElement, true)
      if (rayDir !== undefined) this._currentCursorPosition.copy(rayDir)
      this.applyTransformMatrix(this.pan(this._startCursorPosition, this._currentCursorPosition, true))
      this.dispatchEvent(_changeEvent)
    }
  }

  private onDoublePanEnd = (): void => {
    this.updateTbState(STATE.IDLE, false)
    this.dispatchEvent(_endEvent)
  }

  private onRotateStart = (): void => {
    if (this.enabled && this.enableRotate) {
      this.dispatchEvent(_startEvent)

      this.updateTbState(STATE.ZROTATE, true)

      //this._startFingerRotation = event.rotation;

      this._startFingerRotation =
        this.getAngle(this._touchCurrent[1], this._touchCurrent[0]) +
        this.getAngle(this._touchStart[1], this._touchStart[0])
      this._currentFingerRotation = this._startFingerRotation

      this.camera?.getWorldDirection(this._rotationAxis) //rotation axis

      if (!this.enablePan && !this.enableZoom) {
        this.activateGizmos(true)
      }
    }
  }

  private onRotateMove = (): void => {
    if (this.enabled && this.enableRotate && this.camera && this.domElement) {
      this.setCenter(
        (this._touchCurrent[0].clientX + this._touchCurrent[1].clientX) / 2,
        (this._touchCurrent[0].clientY + this._touchCurrent[1].clientY) / 2,
      )
      let rotationPoint

      if (this._state != STATE.ZROTATE) {
        this.updateTbState(STATE.ZROTATE, true)
        this._startFingerRotation = this._currentFingerRotation
      }

      //this._currentFingerRotation = event.rotation;
      this._currentFingerRotation =
        this.getAngle(this._touchCurrent[1], this._touchCurrent[0]) +
        this.getAngle(this._touchStart[1], this._touchStart[0])

      if (!this.enablePan) {
        rotationPoint = new Vector3().setFromMatrixPosition(this._gizmoMatrixState)
      } else if (this.camera) {
        this._v3_2.setFromMatrixPosition(this._gizmoMatrixState)
        rotationPoint = this.unprojectOnTbPlane(this.camera, _center.x, _center.y, this.domElement)
          ?.applyQuaternion(this.camera.quaternion)
          .multiplyScalar(1 / this.camera.zoom)
          .add(this._v3_2)
      }

      const amount = MathUtils.DEG2RAD * (this._startFingerRotation - this._currentFingerRotation)

      if (rotationPoint !== undefined) {
        this.applyTransformMatrix(this.zRotate(rotationPoint, amount))
      }
      this.dispatchEvent(_changeEvent)
    }
  }

  private onRotateEnd = (): void => {
    this.updateTbState(STATE.IDLE, false)
    this.activateGizmos(false)
    this.dispatchEvent(_endEvent)
  }

  private onPinchStart = (): void => {
    if (this.enabled && this.enableZoom) {
      this.dispatchEvent(_startEvent)
      this.updateTbState(STATE.SCALE, true)

      this._startFingerDistance = this.calculatePointersDistance(this._touchCurrent[0], this._touchCurrent[1])
      this._currentFingerDistance = this._startFingerDistance

      this.activateGizmos(false)
    }
  }

  private onPinchMove = (): void => {
    if (this.enabled && this.enableZoom && this.domElement) {
      this.setCenter(
        (this._touchCurrent[0].clientX + this._touchCurrent[1].clientX) / 2,
        (this._touchCurrent[0].clientY + this._touchCurrent[1].clientY) / 2,
      )
      const minDistance = 12 //minimum distance between fingers (in css pixels)

      if (this._state != STATE.SCALE) {
        this._startFingerDistance = this._currentFingerDistance
        this.updateTbState(STATE.SCALE, true)
      }

      this._currentFingerDistance = Math.max(
        this.calculatePointersDistance(this._touchCurrent[0], this._touchCurrent[1]),
        minDistance * this._devPxRatio,
      )
      const amount = this._currentFingerDistance / this._startFingerDistance

      let scalePoint

      if (!this.enablePan) {
        scalePoint = this._gizmos.position
      } else {
        if (this.camera instanceof OrthographicCamera) {
          scalePoint = this.unprojectOnTbPlane(this.camera, _center.x, _center.y, this.domElement)
            ?.applyQuaternion(this.camera.quaternion)
            .multiplyScalar(1 / this.camera.zoom)
            .add(this._gizmos.position)
        } else if (this.camera instanceof PerspectiveCamera) {
          scalePoint = this.unprojectOnTbPlane(this.camera, _center.x, _center.y, this.domElement)
            ?.applyQuaternion(this.camera.quaternion)
            .add(this._gizmos.position)
        }
      }

      if (scalePoint !== undefined) {
        this.applyTransformMatrix(this.applyScale(amount, scalePoint))
      }
      this.dispatchEvent(_changeEvent)
    }
  }

  private onPinchEnd = (): void => {
    this.updateTbState(STATE.IDLE, false)
    this.dispatchEvent(_endEvent)
  }

  private onTriplePanStart = (): void => {
    if (this.enabled && this.enableZoom && this.domElement) {
      this.dispatchEvent(_startEvent)

      this.updateTbState(STATE.SCALE, true)

      //const center = event.center;
      let clientX = 0
      let clientY = 0
      const nFingers = this._touchCurrent.length

      for (let i = 0; i < nFingers; i++) {
        clientX += this._touchCurrent[i].clientX
        clientY += this._touchCurrent[i].clientY
      }

      this.setCenter(clientX / nFingers, clientY / nFingers)

      this._startCursorPosition.setY(this.getCursorNDC(_center.x, _center.y, this.domElement).y * 0.5)
      this._currentCursorPosition.copy(this._startCursorPosition)
    }
  }

  private onTriplePanMove = (): void => {
    if (this.enabled && this.enableZoom && this.camera && this.domElement) {
      //	  fov / 2
      //		|\
      //		| \
      //		|  \
      //	x	|	\
      //		| 	 \
      //		| 	  \
      //		| _ _ _\
      //			y

      //const center = event.center;
      let clientX = 0
      let clientY = 0
      const nFingers = this._touchCurrent.length

      for (let i = 0; i < nFingers; i++) {
        clientX += this._touchCurrent[i].clientX
        clientY += this._touchCurrent[i].clientY
      }

      this.setCenter(clientX / nFingers, clientY / nFingers)

      const screenNotches = 8 //how many wheel notches corresponds to a full screen pan
      this._currentCursorPosition.setY(this.getCursorNDC(_center.x, _center.y, this.domElement).y * 0.5)

      const movement = this._currentCursorPosition.y - this._startCursorPosition.y

      let size = 1

      if (movement < 0) {
        size = 1 / Math.pow(this.scaleFactor, -movement * screenNotches)
      } else if (movement > 0) {
        size = Math.pow(this.scaleFactor, movement * screenNotches)
      }

      this._v3_1.setFromMatrixPosition(this._cameraMatrixState)
      const x = this._v3_1.distanceTo(this._gizmos.position)
      let xNew = x / size //distance between camera and gizmos if scale(size, scalepoint) would be performed

      //check min and max distance
      xNew = MathUtils.clamp(xNew, this.minDistance, this.maxDistance)

      const y = x * Math.tan(MathUtils.DEG2RAD * this._fovState * 0.5)

      //calculate new fov
      let newFov = MathUtils.RAD2DEG * (Math.atan(y / xNew) * 2)

      //check min and max fov
      newFov = MathUtils.clamp(newFov, this.minFov, this.maxFov)

      const newDistance = y / Math.tan(MathUtils.DEG2RAD * (newFov / 2))
      size = x / newDistance
      this._v3_2.setFromMatrixPosition(this._gizmoMatrixState)

      this.setFov(newFov)
      this.applyTransformMatrix(this.applyScale(size, this._v3_2, false))

      //adjusting distance
      const direction = this._gizmos.position
        .clone()
        .sub(this.camera.position)
        .normalize()
        .multiplyScalar(newDistance / x)
      this._m4_1.makeTranslation(direction.x, direction.y, direction.z)

      this.dispatchEvent(_changeEvent)
    }
  }

  private onTriplePanEnd = (): void => {
    this.updateTbState(STATE.IDLE, false)
    this.dispatchEvent(_endEvent)
    //this.dispatchEvent( _changeEvent );
  }

  /**
   * Set _center's x/y coordinates
   * @param {Number} clientX
   * @param {Number} clientY
   */
  private setCenter = (clientX: number, clientY: number): void => {
    _center.x = clientX
    _center.y = clientY
  }

  /**
   * Set default mouse actions
   */
  private initializeMouseActions = (): void => {
    this.setMouseAction('PAN', 0, 'CTRL')
    this.setMouseAction('PAN', 2)

    this.setMouseAction('ROTATE', 0)

    this.setMouseAction('ZOOM', 'WHEEL')
    this.setMouseAction('ZOOM', 1)

    this.setMouseAction('FOV', 'WHEEL', 'SHIFT')
    this.setMouseAction('FOV', 1, 'SHIFT')
  }

  /**
   * Set a new mouse action by specifying the operation to be performed and a mouse/key combination. In case of conflict, replaces the existing one
   * @param {String} operation The operation to be performed ('PAN', 'ROTATE', 'ZOOM', 'FOV)
   * @param {*} mouse A mouse button (0, 1, 2) or 'WHEEL' for wheel notches
   * @param {*} key The keyboard modifier ('CTRL', 'SHIFT') or null if key is not needed
   * @returns {Boolean} True if the mouse action has been successfully added, false otherwise
   */
  private setMouseAction = (operation: Operation, mouse: MouseButtonType, key: ModifierKey | null = null): boolean => {
    const operationInput = ['PAN', 'ROTATE', 'ZOOM', 'FOV']
    const mouseInput = [0, 1, 2, 'WHEEL']
    const keyInput = ['CTRL', 'SHIFT', null]
    let state

    if (!operationInput.includes(operation) || !mouseInput.includes(mouse) || !keyInput.includes(key)) {
      //invalid parameters
      return false
    }

    if (mouse == 'WHEEL') {
      if (operation != 'ZOOM' && operation != 'FOV') {
        //cannot associate 2D operation to 1D input
        return false
      }
    }

    switch (operation) {
      case 'PAN':
        state = STATE.PAN
        break

      case 'ROTATE':
        state = STATE.ROTATE
        break

      case 'ZOOM':
        state = STATE.SCALE
        break

      case 'FOV':
        state = STATE.FOV
        break
    }

    const action = {
      operation: operation,
      mouse: mouse,
      key: key,
      state: state,
    }

    for (let i = 0; i < this.mouseActions.length; i++) {
      if (this.mouseActions[i].mouse == action.mouse && this.mouseActions[i].key == action.key) {
        this.mouseActions.splice(i, 1, action)
        return true
      }
    }

    this.mouseActions.push(action)
    return true
  }

  /**
   * Return the operation associated to a mouse/keyboard combination
   * @param {*} mouse A mouse button (0, 1, 2) or 'WHEEL' for wheel notches
   * @param {*} key The keyboard modifier ('CTRL', 'SHIFT') or null if key is not needed
   * @returns The operation if it has been found, null otherwise
   */
  private getOpFromAction = (mouse: MouseButtonType, key: ModifierKey | null): Operation | null => {
    let action

    for (let i = 0; i < this.mouseActions.length; i++) {
      action = this.mouseActions[i]
      if (action.mouse == mouse && action.key == key) {
        return action.operation
      }
    }

    if (key) {
      for (let i = 0; i < this.mouseActions.length; i++) {
        action = this.mouseActions[i]
        if (action.mouse == mouse && action.key == null) {
          return action.operation
        }
      }
    }

    return null
  }

  /**
   * Get the operation associated to mouse and key combination and returns the corresponding FSA state
   * @param {Number} mouse Mouse button
   * @param {String} key Keyboard modifier
   * @returns The FSA state obtained from the operation associated to mouse/keyboard combination
   */
  private getOpStateFromAction = (mouse: MouseButtonType, key: ModifierKey | null): Symbol | null => {
    let action

    for (let i = 0; i < this.mouseActions.length; i++) {
      action = this.mouseActions[i]
      if (action.mouse == mouse && action.key == key) {
        return action.state
      }
    }

    if (key) {
      for (let i = 0; i < this.mouseActions.length; i++) {
        action = this.mouseActions[i]
        if (action.mouse == mouse && action.key == null) {
          return action.state
        }
      }
    }

    return null
  }

  /**
   * Calculate the angle between two pointers
   * @param {PointerEvent} p1
   * @param {PointerEvent} p2
   * @returns {Number} The angle between two pointers in degrees
   */
  private getAngle = (p1: PointerEvent, p2: PointerEvent): number => {
    return (Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * 180) / Math.PI
  }

  /**
   * Update a PointerEvent inside current pointerevents array
   * @param {PointerEvent} event
   */
  private updateTouchEvent = (event: PointerEvent): void => {
    for (let i = 0; i < this._touchCurrent.length; i++) {
      if (this._touchCurrent[i].pointerId == event.pointerId) {
        this._touchCurrent.splice(i, 1, event)
        break
      }
    }
  }

  /**
   * Apply a transformation matrix, to the camera and gizmos
   * @param {Object} transformation Object containing matrices to apply to camera and gizmos
   */
  private applyTransformMatrix(transformation: Transformation | undefined): void {
    if (transformation?.camera && this.camera) {
      this._m4_1.copy(this._cameraMatrixState).premultiply(transformation.camera)
      this._m4_1.decompose(this.camera.position, this.camera.quaternion, this.camera.scale)
      this.camera.updateMatrix()

      //update camera up vector
      if (this._state == STATE.ROTATE || this._state == STATE.ZROTATE || this._state == STATE.ANIMATION_ROTATE) {
        this.camera.up.copy(this._upState).applyQuaternion(this.camera.quaternion)
      }
    }

    if (transformation?.gizmos) {
      this._m4_1.copy(this._gizmoMatrixState).premultiply(transformation.gizmos)
      this._m4_1.decompose(this._gizmos.position, this._gizmos.quaternion, this._gizmos.scale)
      this._gizmos.updateMatrix()
    }

    if (
      (this._state == STATE.SCALE || this._state == STATE.FOCUS || this._state == STATE.ANIMATION_FOCUS) &&
      this.camera
    ) {
      const tbRadius = this.calculateTbRadius(this.camera)
      if (tbRadius !== undefined) {
        this._tbRadius = tbRadius
      }

      if (this.adjustNearFar) {
        const cameraDistance = this.camera.position.distanceTo(this._gizmos.position)

        const bb = new Box3()
        bb.setFromObject(this._gizmos)
        const sphere = new Sphere()
        bb.getBoundingSphere(sphere)

        const adjustedNearPosition = Math.max(this._nearPos0, sphere.radius + sphere.center.length())
        const regularNearPosition = cameraDistance - this._initialNear

        const minNearPos = Math.min(adjustedNearPosition, regularNearPosition)
        this.camera.near = cameraDistance - minNearPos

        const adjustedFarPosition = Math.min(this._farPos0, -sphere.radius + sphere.center.length())
        const regularFarPosition = cameraDistance - this._initialFar

        const minFarPos = Math.min(adjustedFarPosition, regularFarPosition)
        this.camera.far = cameraDistance - minFarPos

        this.camera.updateProjectionMatrix()
      } else {
        let update = false

        if (this.camera.near != this._initialNear) {
          this.camera.near = this._initialNear
          update = true
        }

        if (this.camera.far != this._initialFar) {
          this.camera.far = this._initialFar
          update = true
        }

        if (update) {
          this.camera.updateProjectionMatrix()
        }
      }
    }
  }

  /**
   * Calculate the angular speed
   * @param {Number} p0 Position at t0
   * @param {Number} p1 Position at t1
   * @param {Number} t0 Initial time in milliseconds
   * @param {Number} t1 Ending time in milliseconds
   */
  private calculateAngularSpeed = (p0: number, p1: number, t0: number, t1: number): number => {
    const s = p1 - p0
    const t = (t1 - t0) / 1000
    if (t == 0) {
      return 0
    }

    return s / t
  }

  /**
   * Calculate the distance between two pointers
   * @param {PointerEvent} p0 The first pointer
   * @param {PointerEvent} p1 The second pointer
   * @returns {number} The distance between the two pointers
   */
  private calculatePointersDistance = (p0: PointerEvent, p1: PointerEvent): number => {
    return Math.sqrt(Math.pow(p1.clientX - p0.clientX, 2) + Math.pow(p1.clientY - p0.clientY, 2))
  }

  /**
   * Calculate the rotation axis as the vector perpendicular between two vectors
   * @param {Vector3} vec1 The first vector
   * @param {Vector3} vec2 The second vector
   * @returns {Vector3} The normalized rotation axis
   */
  private calculateRotationAxis = (vec1: Vector3, vec2: Vector3): Vector3 => {
    this._rotationMatrix.extractRotation(this._cameraMatrixState)
    this._quat.setFromRotationMatrix(this._rotationMatrix)

    this._rotationAxis.crossVectors(vec1, vec2).applyQuaternion(this._quat)
    return this._rotationAxis.normalize().clone()
  }

  /**
   * Calculate the trackball radius so that gizmo's diamater will be 2/3 of the minimum side of the camera frustum
   * @param {Camera} camera
   * @returns {Number} The trackball radius
   */
  private calculateTbRadius = (camera: Camera): number | undefined => {
    const factor = 0.67
    const distance = camera.position.distanceTo(this._gizmos.position)

    if (camera instanceof PerspectiveCamera) {
      const halfFovV = MathUtils.DEG2RAD * camera.fov * 0.5 //vertical fov/2 in radians
      const halfFovH = Math.atan(camera.aspect * Math.tan(halfFovV)) //horizontal fov/2 in radians
      return Math.tan(Math.min(halfFovV, halfFovH)) * distance * factor
    } else if (camera instanceof OrthographicCamera) {
      return Math.min(camera.top, camera.right) * factor
    }
  }

  /**
   * Focus operation consist of positioning the point of interest in front of the camera and a slightly zoom in
   * @param {Vector3} point The point of interest
   * @param {Number} size Scale factor
   * @param {Number} amount Amount of operation to be completed (used for focus animations, default is complete full operation)
   */
  private focus = (point: Vector3, size: number, amount = 1): void => {
    if (this.camera) {
      const focusPoint = point.clone()

      //move center of camera (along with gizmos) towards point of interest
      focusPoint.sub(this._gizmos.position).multiplyScalar(amount)
      this._translationMatrix.makeTranslation(focusPoint.x, focusPoint.y, focusPoint.z)

      const gizmoStateTemp = this._gizmoMatrixState.clone()
      this._gizmoMatrixState.premultiply(this._translationMatrix)
      this._gizmoMatrixState.decompose(this._gizmos.position, this._gizmos.quaternion, this._gizmos.scale)

      const cameraStateTemp = this._cameraMatrixState.clone()
      this._cameraMatrixState.premultiply(this._translationMatrix)
      this._cameraMatrixState.decompose(this.camera.position, this.camera.quaternion, this.camera.scale)

      //apply zoom
      if (this.enableZoom) {
        this.applyTransformMatrix(this.applyScale(size, this._gizmos.position))
      }

      this._gizmoMatrixState.copy(gizmoStateTemp)
      this._cameraMatrixState.copy(cameraStateTemp)
    }
  }

  /**
   * Draw a grid and add it to the scene
   */
  private drawGrid = (): void => {
    if (this.scene) {
      const color = 0x888888
      const multiplier = 3
      let size, divisions, maxLength, tick

      if (this.camera instanceof OrthographicCamera) {
        const width = this.camera.right - this.camera.left
        const height = this.camera.bottom - this.camera.top

        maxLength = Math.max(width, height)
        tick = maxLength / 20

        size = (maxLength / this.camera.zoom) * multiplier
        divisions = (size / tick) * this.camera.zoom
      } else if (this.camera instanceof PerspectiveCamera) {
        const distance = this.camera.position.distanceTo(this._gizmos.position)
        const halfFovV = MathUtils.DEG2RAD * this.camera.fov * 0.5
        const halfFovH = Math.atan(this.camera.aspect * Math.tan(halfFovV))

        maxLength = Math.tan(Math.max(halfFovV, halfFovH)) * distance * 2
        tick = maxLength / 20

        size = maxLength * multiplier
        divisions = size / tick
      }

      if (this._grid == null && this.camera) {
        this._grid = new GridHelper(size, divisions, color, color)
        this._grid.position.copy(this._gizmos.position)
        this._gridPosition.copy(this._grid.position)
        this._grid.quaternion.copy(this.camera.quaternion)
        this._grid.rotateX(Math.PI * 0.5)

        this.scene.add(this._grid)
      }
    }
  }

  public connect = (domElement: HTMLElement): void => {
    // https://github.com/mrdoob/three.js/issues/20575

    if ((domElement as any) === document) {
      console.error(
        'THREE.ArcballControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.',
      )
    }
    this.domElement = domElement
    // disables touch scroll
    // touch-action needs to be defined for pointer events to work on mobile
    // https://stackoverflow.com/a/48254578
    this.domElement.style.touchAction = 'none'
    this.domElement.addEventListener('contextmenu', this.onContextMenu)
    this.domElement.addEventListener('pointerdown', this.onPointerDown)
    this.domElement.addEventListener('pointercancel', this.onPointerCancel)
    this.domElement.addEventListener('wheel', this.onWheel)
  }

  /**
   * Remove all listeners, stop animations and clean scene
   */
  public dispose = (): void => {
    if (this._animationId != -1) {
      window.cancelAnimationFrame(this._animationId)
    }

    this.domElement?.removeEventListener('pointerdown', this.onPointerDown)
    this.domElement?.removeEventListener('pointercancel', this.onPointerCancel)
    this.domElement?.removeEventListener('wheel', this.onWheel)
    this.domElement?.removeEventListener('contextmenu', this.onContextMenu)

    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('pointerup', this.onPointerUp)

    window.removeEventListener('resize', this.onWindowResize)

    this.scene?.remove(this._gizmos)
    this.disposeGrid()
  }

  /**
   * remove the grid from the scene
   */
  private disposeGrid = (): void => {
    if (this._grid && this.scene) {
      this.scene.remove(this._grid)
      this._grid = null
    }
  }

  /**
   * Compute the easing out cubic function for ease out effect in animation
   * @param {Number} t The absolute progress of the animation in the bound of 0 (beginning of the) and 1 (ending of animation)
   * @returns {Number} Result of easing out cubic at time t
   */
  private easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3)
  }

  /**
   * Make rotation gizmos more or less visible
   * @param {Boolean} isActive If true, make gizmos more visible
   */
  private activateGizmos = (isActive: boolean): void => {
    for (const gizmo of this._gizmos.children) {
      ;(gizmo as Mesh<BufferGeometry, Material>).material.setValues({ opacity: isActive ? 1 : 0.6 })
    }
  }

  /**
   * Calculate the cursor position in NDC
   * @param {number} x Cursor horizontal coordinate within the canvas
   * @param {number} y Cursor vertical coordinate within the canvas
   * @param {HTMLElement} canvas The canvas where the renderer draws its output
   * @returns {Vector2} Cursor normalized position inside the canvas
   */
  private getCursorNDC = (cursorX: number, cursorY: number, canvas: HTMLElement): Vector2 => {
    const canvasRect = canvas.getBoundingClientRect()
    this._v2_1.setX(((cursorX - canvasRect.left) / canvasRect.width) * 2 - 1)
    this._v2_1.setY(((canvasRect.bottom - cursorY) / canvasRect.height) * 2 - 1)
    return this._v2_1.clone()
  }

  /**
   * Calculate the cursor position inside the canvas x/y coordinates with the origin being in the center of the canvas
   * @param {Number} x Cursor horizontal coordinate within the canvas
   * @param {Number} y Cursor vertical coordinate within the canvas
   * @param {HTMLElement} canvas The canvas where the renderer draws its output
   * @returns {Vector2} Cursor position inside the canvas
   */
  private getCursorPosition = (cursorX: number, cursorY: number, canvas: HTMLElement): Vector2 => {
    this._v2_1.copy(this.getCursorNDC(cursorX, cursorY, canvas))
    if (this.camera instanceof OrthographicCamera) {
      this._v2_1.x *= (this.camera.right - this.camera.left) * 0.5
      this._v2_1.y *= (this.camera.top - this.camera.bottom) * 0.5
    }
    return this._v2_1.clone()
  }

  /**
   * Set the camera to be controlled
   * @param {Camera} camera The virtual camera to be controlled
   */
  private setCamera = (camera: Camera | null): void => {
    if (camera) {
      camera.lookAt(this.target)
      camera.updateMatrix()

      //setting state
      if (camera instanceof PerspectiveCamera) {
        this._fov0 = camera.fov
        this._fovState = camera.fov
      }

      this._cameraMatrixState0.copy(camera.matrix)
      this._cameraMatrixState.copy(this._cameraMatrixState0)
      this._cameraProjectionState.copy(camera.projectionMatrix)
      this._zoom0 = camera.zoom
      this._zoomState = this._zoom0

      this._initialNear = camera.near
      this._nearPos0 = camera.position.distanceTo(this.target) - camera.near
      this._nearPos = this._initialNear

      this._initialFar = camera.far
      this._farPos0 = camera.position.distanceTo(this.target) - camera.far
      this._farPos = this._initialFar

      this._up0.copy(camera.up)
      this._upState.copy(camera.up)

      this.camera = camera

      this.camera.updateProjectionMatrix()

      //making gizmos
      const tbRadius = this.calculateTbRadius(camera)
      if (tbRadius !== undefined) {
        this._tbRadius = tbRadius
      }
      this.makeGizmos(this.target, this._tbRadius)
    }
  }

  /**
   * Set gizmos visibility
   * @param {Boolean} value Value of gizmos visibility
   */
  public setGizmosVisible(value: boolean): void {
    this._gizmos.visible = value
    this.dispatchEvent(_changeEvent)
  }

  /**
   * Creates the rotation gizmos matching trackball center and radius
   * @param {Vector3} tbCenter The trackball center
   * @param {number} tbRadius The trackball radius
   */
  private makeGizmos = (tbCenter: Vector3, tbRadius: number): void => {
    // @ts-ignore
    const curve = new EllipseCurve(0, 0, tbRadius, tbRadius)
    const points = curve.getPoints(this._curvePts)

    //geometry
    const curveGeometry = new BufferGeometry().setFromPoints(points)

    //material
    const curveMaterialX = new LineBasicMaterial({ color: 0xff8080, fog: false, transparent: true, opacity: 0.6 })
    const curveMaterialY = new LineBasicMaterial({ color: 0x80ff80, fog: false, transparent: true, opacity: 0.6 })
    const curveMaterialZ = new LineBasicMaterial({ color: 0x8080ff, fog: false, transparent: true, opacity: 0.6 })

    //line
    const gizmoX = new Line(curveGeometry, curveMaterialX)
    const gizmoY = new Line(curveGeometry, curveMaterialY)
    const gizmoZ = new Line(curveGeometry, curveMaterialZ)

    const rotation = Math.PI * 0.5
    gizmoX.rotation.x = rotation
    gizmoY.rotation.y = rotation

    //setting state
    this._gizmoMatrixState0.identity().setPosition(tbCenter)
    this._gizmoMatrixState.copy(this._gizmoMatrixState0)

    if (this.camera && this.camera.zoom != 1) {
      //adapt gizmos size to camera zoom
      const size = 1 / this.camera.zoom
      this._scaleMatrix.makeScale(size, size, size)
      this._translationMatrix.makeTranslation(-tbCenter.x, -tbCenter.y, -tbCenter.z)

      this._gizmoMatrixState.premultiply(this._translationMatrix).premultiply(this._scaleMatrix)
      this._translationMatrix.makeTranslation(tbCenter.x, tbCenter.y, tbCenter.z)
      this._gizmoMatrixState.premultiply(this._translationMatrix)
    }

    this._gizmoMatrixState.decompose(this._gizmos.position, this._gizmos.quaternion, this._gizmos.scale)

    this._gizmos.clear()

    this._gizmos.add(gizmoX)
    this._gizmos.add(gizmoY)
    this._gizmos.add(gizmoZ)
  }

  /**
   * Perform animation for focus operation
   * @param {Number} time Instant in which this function is called as performance.now()
   * @param {Vector3} point Point of interest for focus operation
   * @param {Matrix4} cameraMatrix Camera matrix
   * @param {Matrix4} gizmoMatrix Gizmos matrix
   */
  private onFocusAnim = (time: number, point: Vector3, cameraMatrix: Matrix4, gizmoMatrix: Matrix4): void => {
    if (this._timeStart == -1) {
      //animation start
      this._timeStart = time
    }

    if (this._state == STATE.ANIMATION_FOCUS) {
      const deltaTime = time - this._timeStart
      const animTime = deltaTime / this.focusAnimationTime

      this._gizmoMatrixState.copy(gizmoMatrix)

      if (animTime >= 1) {
        //animation end

        this._gizmoMatrixState.decompose(this._gizmos.position, this._gizmos.quaternion, this._gizmos.scale)

        this.focus(point, this.scaleFactor)

        this._timeStart = -1
        this.updateTbState(STATE.IDLE, false)
        this.activateGizmos(false)

        this.dispatchEvent(_changeEvent)
      } else {
        const amount = this.easeOutCubic(animTime)
        const size = 1 - amount + this.scaleFactor * amount

        this._gizmoMatrixState.decompose(this._gizmos.position, this._gizmos.quaternion, this._gizmos.scale)
        this.focus(point, size, amount)

        this.dispatchEvent(_changeEvent)
        const self = this
        this._animationId = window.requestAnimationFrame(function (t) {
          self.onFocusAnim(t, point, cameraMatrix, gizmoMatrix.clone())
        })
      }
    } else {
      //interrupt animation

      this._animationId = -1
      this._timeStart = -1
    }
  }

  /**
   * Perform animation for rotation operation
   * @param {Number} time Instant in which this function is called as performance.now()
   * @param {Vector3} rotationAxis Rotation axis
   * @param {number} w0 Initial angular velocity
   */
  private onRotationAnim = (time: number, rotationAxis: Vector3, w0: number): void => {
    if (this._timeStart == -1) {
      //animation start
      this._anglePrev = 0
      this._angleCurrent = 0
      this._timeStart = time
    }

    if (this._state == STATE.ANIMATION_ROTATE) {
      //w = w0 + alpha * t
      const deltaTime = (time - this._timeStart) / 1000
      const w = w0 + -this.dampingFactor * deltaTime

      if (w > 0) {
        //tetha = 0.5 * alpha * t^2 + w0 * t + tetha0
        this._angleCurrent = 0.5 * -this.dampingFactor * Math.pow(deltaTime, 2) + w0 * deltaTime + 0
        this.applyTransformMatrix(this.rotate(rotationAxis, this._angleCurrent))
        this.dispatchEvent(_changeEvent)
        const self = this
        this._animationId = window.requestAnimationFrame(function (t) {
          self.onRotationAnim(t, rotationAxis, w0)
        })
      } else {
        this._animationId = -1
        this._timeStart = -1

        this.updateTbState(STATE.IDLE, false)
        this.activateGizmos(false)

        this.dispatchEvent(_changeEvent)
      }
    } else {
      //interrupt animation

      this._animationId = -1
      this._timeStart = -1

      if (this._state != STATE.ROTATE) {
        this.activateGizmos(false)
        this.dispatchEvent(_changeEvent)
      }
    }
  }

  /**
   * Perform pan operation moving camera between two points
   * @param {Vector3} p0 Initial point
   * @param {Vector3} p1 Ending point
   * @param {Boolean} adjust If movement should be adjusted considering camera distance (Perspective only)
   */
  private pan = (p0: Vector3, p1: Vector3, adjust = false): Transformation => {
    if (this.camera) {
      const movement = p0.clone().sub(p1)

      if (this.camera instanceof OrthographicCamera) {
        //adjust movement amount
        movement.multiplyScalar(1 / this.camera.zoom)
      }

      if (this.camera instanceof PerspectiveCamera && adjust) {
        //adjust movement amount
        this._v3_1.setFromMatrixPosition(this._cameraMatrixState0) //camera's initial position
        this._v3_2.setFromMatrixPosition(this._gizmoMatrixState0) //gizmo's initial position
        const distanceFactor =
          this._v3_1.distanceTo(this._v3_2) / this.camera.position.distanceTo(this._gizmos.position)
        movement.multiplyScalar(1 / distanceFactor)
      }

      this._v3_1.set(movement.x, movement.y, 0).applyQuaternion(this.camera.quaternion)

      this._m4_1.makeTranslation(this._v3_1.x, this._v3_1.y, this._v3_1.z)

      this.setTransformationMatrices(this._m4_1, this._m4_1)
    }
    return _transformation
  }

  /**
   * Reset trackball
   */
  public reset = (): void => {
    if (this.camera) {
      this.camera.zoom = this._zoom0

      if (this.camera instanceof PerspectiveCamera) {
        this.camera.fov = this._fov0
      }

      this.camera.near = this._nearPos
      this.camera.far = this._farPos
      this._cameraMatrixState.copy(this._cameraMatrixState0)
      this._cameraMatrixState.decompose(this.camera.position, this.camera.quaternion, this.camera.scale)
      this.camera.up.copy(this._up0)

      this.camera.updateMatrix()
      this.camera.updateProjectionMatrix()

      this._gizmoMatrixState.copy(this._gizmoMatrixState0)
      this._gizmoMatrixState0.decompose(this._gizmos.position, this._gizmos.quaternion, this._gizmos.scale)
      this._gizmos.updateMatrix()

      const tbRadius = this.calculateTbRadius(this.camera)
      if (tbRadius !== undefined) {
        this._tbRadius = tbRadius
      }
      this.makeGizmos(this._gizmos.position, this._tbRadius)

      this.camera.lookAt(this._gizmos.position)

      this.updateTbState(STATE.IDLE, false)

      this.dispatchEvent(_changeEvent)
    }
  }

  /**
   * Rotate the camera around an axis passing by trackball's center
   * @param {Vector3} axis Rotation axis
   * @param {number} angle Angle in radians
   * @returns {Object} Object with 'camera' field containing transformation matrix resulting from the operation to be applied to the camera
   */
  private rotate = (axis: Vector3, angle: number): Transformation => {
    const point = this._gizmos.position //rotation center
    this._translationMatrix.makeTranslation(-point.x, -point.y, -point.z)
    this._rotationMatrix.makeRotationAxis(axis, -angle)

    //rotate camera
    this._m4_1.makeTranslation(point.x, point.y, point.z)
    this._m4_1.multiply(this._rotationMatrix)
    this._m4_1.multiply(this._translationMatrix)

    this.setTransformationMatrices(this._m4_1)

    return _transformation
  }

  public copyState = (): void => {
    if (this.camera) {
      const state = JSON.stringify(
        this.camera instanceof OrthographicCamera
          ? {
              arcballState: {
                cameraFar: this.camera.far,
                cameraMatrix: this.camera.matrix,
                cameraNear: this.camera.near,
                cameraUp: this.camera.up,
                cameraZoom: this.camera.zoom,
                gizmoMatrix: this._gizmos.matrix,
              },
            }
          : {
              arcballState: {
                cameraFar: this.camera.far,
                cameraFov: this.camera.fov,
                cameraMatrix: this.camera.matrix,
                cameraNear: this.camera.near,
                cameraUp: this.camera.up,
                cameraZoom: this.camera.zoom,
                gizmoMatrix: this._gizmos.matrix,
              },
            },
      )

      navigator.clipboard.writeText(state)
    }
  }

  public pasteState = (): void => {
    const self = this
    navigator.clipboard.readText().then(function resolved(value) {
      self.setStateFromJSON(value)
    })
  }

  /**
   * Save the current state of the control. This can later be recovered with .reset
   */
  public saveState = (): void => {
    if (!this.camera) return

    this._cameraMatrixState0.copy(this.camera.matrix)
    this._gizmoMatrixState0.copy(this._gizmos.matrix)
    this._nearPos = this.camera.near
    this._farPos = this.camera.far
    this._zoom0 = this.camera.zoom
    this._up0.copy(this.camera.up)

    if (this.camera instanceof PerspectiveCamera) {
      this._fov0 = this.camera.fov
    }
  }

  /**
   * Perform uniform scale operation around a given point
   * @param {Number} size Scale factor
   * @param {Vector3} point Point around which scale
   * @param {Boolean} scaleGizmos If gizmos should be scaled (Perspective only)
   * @returns {Object} Object with 'camera' and 'gizmo' fields containing transformation matrices resulting from the operation to be applied to the camera and gizmos
   */
  private applyScale = (size: number, point: Vector3, scaleGizmos = true): Transformation | undefined => {
    if (!this.camera) return

    const scalePoint = point.clone()
    let sizeInverse = 1 / size

    if (this.camera instanceof OrthographicCamera) {
      //camera zoom
      this.camera.zoom = this._zoomState
      this.camera.zoom *= size

      //check min and max zoom
      if (this.camera.zoom > this.maxZoom) {
        this.camera.zoom = this.maxZoom
        sizeInverse = this._zoomState / this.maxZoom
      } else if (this.camera.zoom < this.minZoom) {
        this.camera.zoom = this.minZoom
        sizeInverse = this._zoomState / this.minZoom
      }

      this.camera.updateProjectionMatrix()

      this._v3_1.setFromMatrixPosition(this._gizmoMatrixState) //gizmos position

      //scale gizmos so they appear in the same spot having the same dimension
      this._scaleMatrix.makeScale(sizeInverse, sizeInverse, sizeInverse)
      this._translationMatrix.makeTranslation(-this._v3_1.x, -this._v3_1.y, -this._v3_1.z)

      this._m4_2.makeTranslation(this._v3_1.x, this._v3_1.y, this._v3_1.z).multiply(this._scaleMatrix)
      this._m4_2.multiply(this._translationMatrix)

      //move camera and gizmos to obtain pinch effect
      scalePoint.sub(this._v3_1)

      const amount = scalePoint.clone().multiplyScalar(sizeInverse)
      scalePoint.sub(amount)

      this._m4_1.makeTranslation(scalePoint.x, scalePoint.y, scalePoint.z)
      this._m4_2.premultiply(this._m4_1)

      this.setTransformationMatrices(this._m4_1, this._m4_2)
      return _transformation
    }

    if (this.camera instanceof PerspectiveCamera) {
      this._v3_1.setFromMatrixPosition(this._cameraMatrixState)
      this._v3_2.setFromMatrixPosition(this._gizmoMatrixState)

      //move camera
      let distance = this._v3_1.distanceTo(scalePoint)
      let amount = distance - distance * sizeInverse

      //check min and max distance
      const newDistance = distance - amount
      if (newDistance < this.minDistance) {
        sizeInverse = this.minDistance / distance
        amount = distance - distance * sizeInverse
      } else if (newDistance > this.maxDistance) {
        sizeInverse = this.maxDistance / distance
        amount = distance - distance * sizeInverse
      }

      let direction = scalePoint.clone().sub(this._v3_1).normalize().multiplyScalar(amount)

      this._m4_1.makeTranslation(direction.x, direction.y, direction.z)

      if (scaleGizmos) {
        //scale gizmos so they appear in the same spot having the same dimension
        const pos = this._v3_2

        distance = pos.distanceTo(scalePoint)
        amount = distance - distance * sizeInverse
        direction = scalePoint.clone().sub(this._v3_2).normalize().multiplyScalar(amount)

        this._translationMatrix.makeTranslation(pos.x, pos.y, pos.z)
        this._scaleMatrix.makeScale(sizeInverse, sizeInverse, sizeInverse)

        this._m4_2.makeTranslation(direction.x, direction.y, direction.z).multiply(this._translationMatrix)
        this._m4_2.multiply(this._scaleMatrix)

        this._translationMatrix.makeTranslation(-pos.x, -pos.y, -pos.z)

        this._m4_2.multiply(this._translationMatrix)
        this.setTransformationMatrices(this._m4_1, this._m4_2)
      } else {
        this.setTransformationMatrices(this._m4_1)
      }

      return _transformation
    }
  }

  /**
   * Set camera fov
   * @param {Number} value fov to be setted
   */
  private setFov = (value: number): void => {
    if (this.camera instanceof PerspectiveCamera) {
      this.camera.fov = MathUtils.clamp(value, this.minFov, this.maxFov)
      this.camera.updateProjectionMatrix()
    }
  }

  /**
   * Set the trackball's center point
   * @param {Number} x X coordinate
   * @param {Number} y Y coordinate
   * @param {Number} z Z coordinate
   */
  public setTarget = (x: number, y: number, z: number): void => {
    if (this.camera) {
      this.target.set(x, y, z)
      this._gizmos.position.set(x, y, z) //for correct radius calculation
      const tbRadius = this.calculateTbRadius(this.camera)
      if (tbRadius !== undefined) {
        this._tbRadius = tbRadius
      }
      this.makeGizmos(this.target, this._tbRadius)
      this.camera.lookAt(this.target)
    }
  }

  /**
   * Set values in transformation object
   * @param {Matrix4} camera Transformation to be applied to the camera
   * @param {Matrix4} gizmos Transformation to be applied to gizmos
   */
  private setTransformationMatrices(camera: Matrix4 | null = null, gizmos: Matrix4 | null = null): void {
    if (camera) {
      if (_transformation.camera) {
        _transformation.camera.copy(camera)
      } else {
        _transformation.camera = camera.clone()
      }
    } else {
      _transformation.camera = null
    }

    if (gizmos) {
      if (_transformation.gizmos) {
        _transformation.gizmos.copy(gizmos)
      } else {
        _transformation.gizmos = gizmos.clone()
      }
    } else {
      _transformation.gizmos = null
    }
  }

  /**
   * Rotate camera around its direction axis passing by a given point by a given angle
   * @param {Vector3} point The point where the rotation axis is passing trough
   * @param {Number} angle Angle in radians
   * @returns The computed transormation matix
   */
  private zRotate = (point: Vector3, angle: number): Transformation => {
    this._rotationMatrix.makeRotationAxis(this._rotationAxis, angle)
    this._translationMatrix.makeTranslation(-point.x, -point.y, -point.z)

    this._m4_1.makeTranslation(point.x, point.y, point.z)
    this._m4_1.multiply(this._rotationMatrix)
    this._m4_1.multiply(this._translationMatrix)

    this._v3_1.setFromMatrixPosition(this._gizmoMatrixState).sub(point) //vector from rotation center to gizmos position
    this._v3_2.copy(this._v3_1).applyAxisAngle(this._rotationAxis, angle) //apply rotation
    this._v3_2.sub(this._v3_1)

    this._m4_2.makeTranslation(this._v3_2.x, this._v3_2.y, this._v3_2.z)

    this.setTransformationMatrices(this._m4_1, this._m4_2)
    return _transformation
  }

  /**
   * Unproject the cursor on the 3D object surface
   * @param {Vector2} cursor Cursor coordinates in NDC
   * @param {Camera} camera Virtual camera
   * @returns {Vector3} The point of intersection with the model, if exist, null otherwise
   */
  private unprojectOnObj = (cursor: Vector2, camera: Camera): Vector3 | null => {
    if (!this.scene) return null

    const raycaster = new Raycaster()
    raycaster.near = camera.near
    raycaster.far = camera.far
    raycaster.setFromCamera(cursor, camera)

    const intersect = raycaster.intersectObjects(this.scene.children, true)
    for (let i = 0; i < intersect.length; i++) {
      if (intersect[i].object.uuid != this._gizmos.uuid && intersect[i].face) {
        return intersect[i].point.clone()
      }
    }

    return null
  }

  /**
   * Unproject the cursor on the trackball surface
   * @param {Camera} camera The virtual camera
   * @param {Number} cursorX Cursor horizontal coordinate on screen
   * @param {Number} cursorY Cursor vertical coordinate on screen
   * @param {HTMLElement} canvas The canvas where the renderer draws its output
   * @param {number} tbRadius The trackball radius
   * @returns {Vector3} The unprojected point on the trackball surface
   */
  private unprojectOnTbSurface = (
    camera: Camera,
    cursorX: number,
    cursorY: number,
    canvas: HTMLElement,
    tbRadius: number,
  ): Vector3 | undefined => {
    if (camera instanceof OrthographicCamera) {
      this._v2_1.copy(this.getCursorPosition(cursorX, cursorY, canvas))
      this._v3_1.set(this._v2_1.x, this._v2_1.y, 0)

      const x2 = Math.pow(this._v2_1.x, 2)
      const y2 = Math.pow(this._v2_1.y, 2)
      const r2 = Math.pow(this._tbRadius, 2)

      if (x2 + y2 <= r2 * 0.5) {
        //intersection with sphere
        this._v3_1.setZ(Math.sqrt(r2 - (x2 + y2)))
      } else {
        //intersection with hyperboloid
        this._v3_1.setZ((r2 * 0.5) / Math.sqrt(x2 + y2))
      }

      return this._v3_1
    }

    if (camera instanceof PerspectiveCamera) {
      //unproject cursor on the near plane
      this._v2_1.copy(this.getCursorNDC(cursorX, cursorY, canvas))

      this._v3_1.set(this._v2_1.x, this._v2_1.y, -1)
      this._v3_1.applyMatrix4(camera.projectionMatrixInverse)

      const rayDir = this._v3_1.clone().normalize() //unprojected ray direction
      const cameraGizmoDistance = camera.position.distanceTo(this._gizmos.position)
      const radius2 = Math.pow(tbRadius, 2)

      //	  camera
      //		|\
      //		| \
      //		|  \
      //	h	|	\
      //		| 	 \
      //		| 	  \
      //	_ _ | _ _ _\ _ _  near plane
      //			l

      const h = this._v3_1.z
      const l = Math.sqrt(Math.pow(this._v3_1.x, 2) + Math.pow(this._v3_1.y, 2))

      if (l == 0) {
        //ray aligned with camera
        rayDir.set(this._v3_1.x, this._v3_1.y, tbRadius)
        return rayDir
      }

      const m = h / l
      const q = cameraGizmoDistance

      /*
       * calculate intersection point between unprojected ray and trackball surface
       *|y = m * x + q
       *|x^2 + y^2 = r^2
       *
       * (m^2 + 1) * x^2 + (2 * m * q) * x + q^2 - r^2 = 0
       */
      let a = Math.pow(m, 2) + 1
      let b = 2 * m * q
      let c = Math.pow(q, 2) - radius2
      let delta = Math.pow(b, 2) - 4 * a * c

      if (delta >= 0) {
        //intersection with sphere
        this._v2_1.setX((-b - Math.sqrt(delta)) / (2 * a))
        this._v2_1.setY(m * this._v2_1.x + q)

        const angle = MathUtils.RAD2DEG * this._v2_1.angle()

        if (angle >= 45) {
          //if angle between intersection point and X' axis is >= 45°, return that point
          //otherwise, calculate intersection point with hyperboloid

          const rayLength = Math.sqrt(Math.pow(this._v2_1.x, 2) + Math.pow(cameraGizmoDistance - this._v2_1.y, 2))
          rayDir.multiplyScalar(rayLength)
          rayDir.z += cameraGizmoDistance
          return rayDir
        }
      }

      //intersection with hyperboloid
      /*
       *|y = m * x + q
       *|y = (1 / x) * (r^2 / 2)
       *
       * m * x^2 + q * x - r^2 / 2 = 0
       */

      a = m
      b = q
      c = -radius2 * 0.5
      delta = Math.pow(b, 2) - 4 * a * c
      this._v2_1.setX((-b - Math.sqrt(delta)) / (2 * a))
      this._v2_1.setY(m * this._v2_1.x + q)

      const rayLength = Math.sqrt(Math.pow(this._v2_1.x, 2) + Math.pow(cameraGizmoDistance - this._v2_1.y, 2))

      rayDir.multiplyScalar(rayLength)
      rayDir.z += cameraGizmoDistance
      return rayDir
    }
  }

  /**
   * Unproject the cursor on the plane passing through the center of the trackball orthogonal to the camera
   * @param {Camera} camera The virtual camera
   * @param {Number} cursorX Cursor horizontal coordinate on screen
   * @param {Number} cursorY Cursor vertical coordinate on screen
   * @param {HTMLElement} canvas The canvas where the renderer draws its output
   * @param {Boolean} initialDistance If initial distance between camera and gizmos should be used for calculations instead of current (Perspective only)
   * @returns {Vector3} The unprojected point on the trackball plane
   */
  private unprojectOnTbPlane = (
    camera: Camera,
    cursorX: number,
    cursorY: number,
    canvas: HTMLElement,
    initialDistance = false,
  ): Vector3 | undefined => {
    if (camera instanceof OrthographicCamera) {
      this._v2_1.copy(this.getCursorPosition(cursorX, cursorY, canvas))
      this._v3_1.set(this._v2_1.x, this._v2_1.y, 0)

      return this._v3_1.clone()
    }

    if (camera instanceof PerspectiveCamera) {
      this._v2_1.copy(this.getCursorNDC(cursorX, cursorY, canvas))

      //unproject cursor on the near plane
      this._v3_1.set(this._v2_1.x, this._v2_1.y, -1)
      this._v3_1.applyMatrix4(camera.projectionMatrixInverse)

      const rayDir = this._v3_1.clone().normalize() //unprojected ray direction

      //	  camera
      //		|\
      //		| \
      //		|  \
      //	h	|	\
      //		| 	 \
      //		| 	  \
      //	_ _ | _ _ _\ _ _  near plane
      //			l

      const h = this._v3_1.z
      const l = Math.sqrt(Math.pow(this._v3_1.x, 2) + Math.pow(this._v3_1.y, 2))
      let cameraGizmoDistance

      if (initialDistance) {
        cameraGizmoDistance = this._v3_1
          .setFromMatrixPosition(this._cameraMatrixState0)
          .distanceTo(this._v3_2.setFromMatrixPosition(this._gizmoMatrixState0))
      } else {
        cameraGizmoDistance = camera.position.distanceTo(this._gizmos.position)
      }

      /*
       * calculate intersection point between unprojected ray and the plane
       *|y = mx + q
       *|y = 0
       *
       * x = -q/m
       */
      if (l == 0) {
        //ray aligned with camera
        rayDir.set(0, 0, 0)
        return rayDir
      }

      const m = h / l
      const q = cameraGizmoDistance
      const x = -q / m

      const rayLength = Math.sqrt(Math.pow(q, 2) + Math.pow(x, 2))
      rayDir.multiplyScalar(rayLength)
      rayDir.z = 0
      return rayDir
    }
  }

  /**
   * Update camera and gizmos state
   */
  private updateMatrixState = (): void => {
    if (!this.camera) return

    //update camera and gizmos state
    this._cameraMatrixState.copy(this.camera.matrix)
    this._gizmoMatrixState.copy(this._gizmos.matrix)

    if (this.camera instanceof OrthographicCamera) {
      this._cameraProjectionState.copy(this.camera.projectionMatrix)
      this.camera.updateProjectionMatrix()
      this._zoomState = this.camera.zoom
    }

    if (this.camera instanceof PerspectiveCamera) {
      this._fovState = this.camera.fov
    }
  }

  /**
   * Update the trackball FSA
   * @param {STATE} newState New state of the FSA
   * @param {Boolean} updateMatrices If matriices state should be updated
   */
  private updateTbState = (newState: Symbol, updateMatrices: boolean): void => {
    this._state = newState
    if (updateMatrices) {
      this.updateMatrixState()
    }
  }

  public update = (): void => {
    const EPS = 0.000001

    // Update target and gizmos state
    if (!this.target.equals(this._currentTarget) && this.camera) {
      this._gizmos.position.set(this.target.x, this.target.y, this.target.z) //for correct radius calculation
      const tbRadius = this.calculateTbRadius(this.camera)
      if (tbRadius !== undefined) {
        this._tbRadius = tbRadius
      }
      this.makeGizmos(this.target, this._tbRadius)
      this._currentTarget.copy(this.target)
    }

    if (!this.camera) return

    //check min/max parameters
    if (this.camera instanceof OrthographicCamera) {
      //check zoom
      if (this.camera.zoom > this.maxZoom || this.camera.zoom < this.minZoom) {
        const newZoom = MathUtils.clamp(this.camera.zoom, this.minZoom, this.maxZoom)
        this.applyTransformMatrix(this.applyScale(newZoom / this.camera.zoom, this._gizmos.position, true))
      }
    }

    if (this.camera instanceof PerspectiveCamera) {
      //check distance
      const distance = this.camera.position.distanceTo(this._gizmos.position)

      if (distance > this.maxDistance + EPS || distance < this.minDistance - EPS) {
        const newDistance = MathUtils.clamp(distance, this.minDistance, this.maxDistance)
        this.applyTransformMatrix(this.applyScale(newDistance / distance, this._gizmos.position))
        this.updateMatrixState()
      }

      //check fov
      if (this.camera.fov < this.minFov || this.camera.fov > this.maxFov) {
        this.camera.fov = MathUtils.clamp(this.camera.fov, this.minFov, this.maxFov)
        this.camera.updateProjectionMatrix()
      }

      const oldRadius = this._tbRadius
      const tbRadius = this.calculateTbRadius(this.camera)
      if (tbRadius !== undefined) {
        this._tbRadius = tbRadius
      }

      if (oldRadius < this._tbRadius - EPS || oldRadius > this._tbRadius + EPS) {
        const scale = (this._gizmos.scale.x + this._gizmos.scale.y + this._gizmos.scale.z) / 3
        const newRadius = this._tbRadius / scale
        // @ts-ignore
        const curve = new EllipseCurve(0, 0, newRadius, newRadius)
        const points = curve.getPoints(this._curvePts)
        const curveGeometry = new BufferGeometry().setFromPoints(points)

        for (const gizmo in this._gizmos.children) {
          const child = this._gizmos.children[gizmo] as Mesh
          child.geometry = curveGeometry
        }
      }
    }

    this.camera.lookAt(this._gizmos.position)
  }

  private setStateFromJSON = (json: string): void => {
    const state = JSON.parse(json)

    if (state.arcballState && this.camera) {
      this._cameraMatrixState.fromArray(state.arcballState.cameraMatrix.elements)
      this._cameraMatrixState.decompose(this.camera.position, this.camera.quaternion, this.camera.scale)

      this.camera.up.copy(state.arcballState.cameraUp)
      this.camera.near = state.arcballState.cameraNear
      this.camera.far = state.arcballState.cameraFar

      this.camera.zoom = state.arcballState.cameraZoom

      if (this.camera instanceof PerspectiveCamera) {
        this.camera.fov = state.arcballState.cameraFov
      }

      this._gizmoMatrixState.fromArray(state.arcballState.gizmoMatrix.elements)
      this._gizmoMatrixState.decompose(this._gizmos.position, this._gizmos.quaternion, this._gizmos.scale)

      this.camera.updateMatrix()
      this.camera.updateProjectionMatrix()

      this._gizmos.updateMatrix()

      const tbRadius = this.calculateTbRadius(this.camera)
      if (tbRadius !== undefined) {
        this._tbRadius = tbRadius
      }
      const gizmoTmp = new Matrix4().copy(this._gizmoMatrixState0)
      this.makeGizmos(this._gizmos.position, this._tbRadius)
      this._gizmoMatrixState0.copy(gizmoTmp)

      this.camera.lookAt(this._gizmos.position)
      this.updateTbState(STATE.IDLE, false)

      this.dispatchEvent(_changeEvent)
    }
  }
}

export { ArcballControls }
