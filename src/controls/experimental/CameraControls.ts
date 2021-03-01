import {
  Camera,
  EventDispatcher,
  MOUSE,
  Matrix4,
  Object3D,
  Quaternion,
  Spherical,
  TOUCH,
  Vector2,
  Vector3,
} from 'three'

type CHANGE_EVENT = {
  type: 'change' | 'start' | 'end'
}

enum STATE {
  NONE = -1,
  ROTATE = 0,
  DOLLY = 1,
  PAN = 2,
  TOUCH_ROTATE = 3,
  TOUCH_PAN = 4,
  TOUCH_DOLLY_PAN = 5,
  TOUCH_DOLLY_ROTATE = 6,
}

class CameraControls extends EventDispatcher {
  object: Camera
  domElement: HTMLElement

  /** Set to false to disable this control */
  enabled: boolean

  /** "target" sets the location of focus, where the object orbits around */
  target: Vector3

  // Set to true to enable trackball behavior
  trackball: boolean

  // How far you can dolly in and out ( PerspectiveCamera only )
  minDistance: number
  maxDistance: number

  // How far you can zoom in and out ( OrthographicCamera only )
  minZoom: number
  maxZoom: number

  // How far you can orbit vertically, upper and lower limits.
  // Range is 0 to Math.PI radians.
  minPolarAngle: number // radians
  maxPolarAngle: number // radians

  // How far you can orbit horizontally, upper and lower limits.
  // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
  minAzimuthAngle: number // radians
  maxAzimuthAngle: number // radians

  // Set to true to enable damping (inertia)
  // If damping is enabled, you must call controls.update() in your animation loop
  enableDamping: boolean
  dampingFactor: number

  // This option enables dollying in and out; property named as "zoom" for backwards compatibility
  // Set to false to disable zooming
  enableZoom: boolean
  zoomSpeed: number

  // Set to false to disable rotating
  enableRotate: boolean
  rotateSpeed: number

  // Set to false to disable panning
  enablePan: boolean
  panSpeed: number
  screenSpacePanning: boolean // if true, pan in screen-space
  keyPanSpeed: number // pixels moved per arrow key push

  // Set to true to automatically rotate around the target
  // If auto-rotate is enabled, you must call controls.update() in your animation loop
  // auto-rotate is not supported for trackball behavior
  autoRotate: boolean
  autoRotateSpeed: number // 30 seconds per round when fps is 60

  // Set to false to disable use of the keys
  enableKeys: boolean

  // TODO: don't hardcode
  // The four arrow keys
  keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 }

  // Mouse buttons
  mouseButtons = {
    LEFT: MOUSE.ROTATE,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.PAN,
  }

  // Touch fingers
  touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }

  // // for reset
  target0: Vector3
  position0: Vector3
  quaternion0: Quaternion
  zoom0: number

  // current position in spherical coordinates
  spherical: Spherical
  sphericalDelta: Spherical

  private changeEvent: { type: 'change' }
  private startEvent: { type: 'start' }
  private endEvent: { type: 'end' }
  private state: STATE

  private EPS: number

  private scale: number
  private panOffset: Vector3
  private zoomChanged: boolean

  private rotateStart: Vector2
  private rotateEnd: Vector2
  private rotateDelta: Vector2

  private panStart: Vector2
  private panEnd: Vector2
  private panDelta: Vector2

  private dollyStart: Vector2
  private dollyEnd: Vector2
  private dollyDelta: Vector2

  constructor(object: Camera, domElement: HTMLElement | Document) {
    super()

    if (domElement === undefined) {
      console.warn('THREE.CameraControls: The second parameter "domElement" is now mandatory.')
    }
    if (domElement instanceof Document) {
      console.error(
        'THREE.CameraControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.',
      )

      // TODO: should we just continue or not even allow Document's as a parameter type?
      throw new Error()
    }

    this.object = object
    this.domElement = domElement

    // Set to false to disable this control
    this.enabled = true

    // "target" sets the location of focus, where the object orbits around
    this.target = new Vector3()

    // Set to true to enable trackball behavior
    this.trackball = false

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0
    this.maxDistance = Infinity

    // How far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0
    this.maxZoom = Infinity

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0 // radians
    this.maxPolarAngle = Math.PI // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = -Infinity // radians
    this.maxAzimuthAngle = Infinity // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = false
    this.dampingFactor = 0.05

    // This option enables dollying in and out; property named as "zoom" for backwards compatibility
    // Set to false to disable zooming
    this.enableZoom = true
    this.zoomSpeed = 1.0

    // Set to false to disable rotating
    this.enableRotate = true
    this.rotateSpeed = 1.0

    // Set to false to disable panning
    this.enablePan = true
    this.panSpeed = 1.0
    this.screenSpacePanning = false // if true, pan in screen-space
    this.keyPanSpeed = 7.0 // pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    // auto-rotate is not supported for trackball behavior
    this.autoRotate = false
    this.autoRotateSpeed = 2.0 // 30 seconds per round when fps is 60

    // Set to false to disable use of the keys
    this.enableKeys = true

    // The four arrow keys
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 }

    // Mouse buttons
    this.mouseButtons = {
      LEFT: MOUSE.ROTATE,
      MIDDLE: MOUSE.DOLLY,
      RIGHT: MOUSE.PAN,
    }

    // Touch fingers
    this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }

    // for reset
    this.target0 = this.target.clone()
    this.position0 = this.object.position.clone()
    this.quaternion0 = this.object.quaternion.clone()
    this.zoom0 = this.object.zoom

    //
    // public methods
    //

    //
    // internals
    //

    this.changeEvent = { type: 'change' }
    this.startEvent = { type: 'start' }
    this.endEvent = { type: 'end' }

    this.state = STATE.NONE

    this.EPS = 0.000001

    // current position in spherical coordinates
    this.spherical = new Spherical()
    this.sphericalDelta = new Spherical()

    this.scale = 1
    this.panOffset = new Vector3()
    this.zoomChanged = false

    this.rotateStart = new Vector2()
    this.rotateEnd = new Vector2()
    this.rotateDelta = new Vector2()

    this.panStart = new Vector2()
    this.panEnd = new Vector2()
    this.panDelta = new Vector2()

    this.dollyStart = new Vector2()
    this.dollyEnd = new Vector2()
    this.dollyDelta = new Vector2()

    //
    // event callbacks - update the object state
    //

    function handleMouseDownRotate(event: MouseEvent) {
      rotateStart.set(event.clientX, event.clientY)
    }

    function handleMouseDownDolly(event: MouseEvent) {
      dollyStart.set(event.clientX, event.clientY)
    }

    function handleMouseDownPan(event: MouseEvent) {
      panStart.set(event.clientX, event.clientY)
    }

    function handleMouseMoveRotate(event: MouseEvent) {
      rotateEnd.set(event.clientX, event.clientY)

      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(this.rotateSpeed)

      const element = this.domElement

      rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientHeight) // yes, height

      rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight)

      rotateStart.copy(rotateEnd)

      this.update()
    }

    function handleMouseMoveDolly(event: MouseEvent) {
      dollyEnd.set(event.clientX, event.clientY)

      dollyDelta.subVectors(dollyEnd, dollyStart)

      if (dollyDelta.y > 0) {
        dollyIn(getZoomScale())
      } else if (dollyDelta.y < 0) {
        dollyOut(getZoomScale())
      }

      dollyStart.copy(dollyEnd)

      this.update()
    }

    function handleMouseMovePan(event: MouseEvent) {
      panEnd.set(event.clientX, event.clientY)

      panDelta.subVectors(panEnd, panStart).multiplyScalar(this.panSpeed)

      pan(panDelta.x, panDelta.y)

      panStart.copy(panEnd)

      this.update()
    }

    function handleMouseUp(/*event*/) {
      // no-op
    }

    function handleMouseWheel(event: WheelEvent) {
      if (event.deltaY < 0) {
        dollyOut(getZoomScale())
      } else if (event.deltaY > 0) {
        dollyIn(getZoomScale())
      }

      this.update()
    }

    function handleKeyDown(event: KeyboardEvent) {
      let needsUpdate = false

      switch (event.keyCode) {
        case this.keys.UP:
          pan(0, this.keyPanSpeed)
          needsUpdate = true
          break

        case this.keys.BOTTOM:
          pan(0, -this.keyPanSpeed)
          needsUpdate = true
          break

        case this.keys.LEFT:
          pan(this.keyPanSpeed, 0)
          needsUpdate = true
          break

        case this.keys.RIGHT:
          pan(-this.keyPanSpeed, 0)
          needsUpdate = true
          break
      }

      if (needsUpdate) {
        // prevent the browser from scrolling on cursor keys
        event.preventDefault()

        this.update()
      }
    }

    function handleTouchStartRotate(event: TouchEvent) {
      if (event.touches.length == 1) {
        rotateStart.set(event.touches[0].pageX, event.touches[0].pageY)
      } else {
        const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
        const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)

        rotateStart.set(x, y)
      }
    }

    function handleTouchStartPan(event: TouchEvent) {
      if (event.touches.length == 1) {
        panStart.set(event.touches[0].pageX, event.touches[0].pageY)
      } else {
        const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
        const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)

        panStart.set(x, y)
      }
    }

    function handleTouchStartDolly(event: TouchEvent) {
      const dx = event.touches[0].pageX - event.touches[1].pageX
      const dy = event.touches[0].pageY - event.touches[1].pageY

      const distance = Math.sqrt(dx * dx + dy * dy)

      dollyStart.set(0, distance)
    }

    function handleTouchStartDollyPan(event: TouchEvent) {
      if (this.enableZoom) handleTouchStartDolly(event)

      if (this.enablePan) handleTouchStartPan(event)
    }

    function handleTouchStartDollyRotate(event: TouchEvent) {
      if (this.enableZoom) handleTouchStartDolly(event)

      if (this.enableRotate) handleTouchStartRotate(event)
    }

    function handleTouchMoveRotate(event: TouchEvent) {
      if (event.touches.length == 1) {
        rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY)
      } else {
        const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
        const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)

        rotateEnd.set(x, y)
      }

      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(this.rotateSpeed)

      const element = this.domElement

      rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientHeight) // yes, height

      rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight)

      rotateStart.copy(rotateEnd)
    }

    function handleTouchMovePan(event: TouchEvent) {
      if (event.touches.length == 1) {
        panEnd.set(event.touches[0].pageX, event.touches[0].pageY)
      } else {
        const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
        const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)

        panEnd.set(x, y)
      }

      panDelta.subVectors(panEnd, panStart).multiplyScalar(this.panSpeed)

      pan(panDelta.x, panDelta.y)

      panStart.copy(panEnd)
    }

    function handleTouchMoveDolly(event: TouchEvent) {
      const dx = event.touches[0].pageX - event.touches[1].pageX
      const dy = event.touches[0].pageY - event.touches[1].pageY

      const distance = Math.sqrt(dx * dx + dy * dy)

      dollyEnd.set(0, distance)

      dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, this.zoomSpeed))

      dollyIn(dollyDelta.y)

      dollyStart.copy(dollyEnd)
    }

    function handleTouchMoveDollyPan(event: TouchEvent) {
      if (this.enableZoom) handleTouchMoveDolly(event)

      if (this.enablePan) handleTouchMovePan(event)
    }

    function handleTouchMoveDollyRotate(event: TouchEvent) {
      if (this.enableZoom) handleTouchMoveDolly(event)

      if (this.enableRotate) handleTouchMoveRotate(event)
    }

    function handleTouchEnd(/*event*/) {
      // no-op
    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    function onMouseDown(event: MouseEvent) {
      if (this.enabled === false) return

      // Prevent the browser from scrolling.

      event.preventDefault()

      // Manually set the focus since calling preventDefault above
      // prevents the browser from setting it automatically.

      this.domElement.focus ? this.domElement.focus() : window.focus()

      let mouseAction

      switch (event.button) {
        case 0:
          mouseAction = this.mouseButtons.LEFT
          break

        case 1:
          mouseAction = this.mouseButtons.MIDDLE
          break

        case 2:
          mouseAction = this.mouseButtons.RIGHT
          break

        default:
          mouseAction = -1
      }

      switch (mouseAction) {
        case MOUSE.DOLLY:
          if (this.enableZoom === false) return

          handleMouseDownDolly(event)

          state = STATE.DOLLY

          break

        case MOUSE.ROTATE:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            if (this.enablePan === false) return

            handleMouseDownPan(event)

            state = STATE.PAN
          } else {
            if (this.enableRotate === false) return

            handleMouseDownRotate(event)

            state = STATE.ROTATE
          }

          break

        case MOUSE.PAN:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            if (this.enableRotate === false) return

            handleMouseDownRotate(event)

            state = STATE.ROTATE
          } else {
            if (this.enablePan === false) return

            handleMouseDownPan(event)

            state = STATE.PAN
          }

          break

        default:
          state = STATE.NONE
      }

      if (state !== STATE.NONE) {
        document.addEventListener('mousemove', onMouseMove, false)
        document.addEventListener('mouseup', onMouseUp, false)

        this.dispatchEvent(startEvent)
      }
    }

    function onMouseMove(event: MouseEvent) {
      if (this.enabled === false) return

      event.preventDefault()

      switch (state) {
        case STATE.ROTATE:
          if (this.enableRotate === false) return

          handleMouseMoveRotate(event)

          break

        case STATE.DOLLY:
          if (this.enableZoom === false) return

          handleMouseMoveDolly(event)

          break

        case STATE.PAN:
          if (this.enablePan === false) return

          handleMouseMovePan(event)

          break
      }
    }

    function onMouseUp(event: MouseEvent) {
      if (this.enabled === false) return

      handleMouseUp(event)

      document.removeEventListener('mousemove', onMouseMove, false)
      document.removeEventListener('mouseup', onMouseUp, false)

      this.dispatchEvent(endEvent)

      state = STATE.NONE
    }

    function onMouseWheel(event: WheelEvent) {
      if (this.enabled === false || this.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) {
        return
      }

      event.preventDefault()

      this.dispatchEvent(startEvent)

      handleMouseWheel(event)

      this.dispatchEvent(endEvent)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (this.enabled === false || this.enableKeys === false || this.enablePan === false) return

      handleKeyDown(event)
    }

    function onTouchStart(event: TouchEvent) {
      if (this.enabled === false) return

      event.preventDefault()

      switch (event.touches.length) {
        case 1:
          switch (this.touches.ONE) {
            case TOUCH.ROTATE:
              if (this.enableRotate === false) return

              handleTouchStartRotate(event)

              state = STATE.TOUCH_ROTATE

              break

            case TOUCH.PAN:
              if (this.enablePan === false) return

              handleTouchStartPan(event)

              state = STATE.TOUCH_PAN

              break

            default:
              state = STATE.NONE
          }

          break

        case 2:
          switch (this.touches.TWO) {
            case TOUCH.DOLLY_PAN:
              if (this.enableZoom === false && this.enablePan === false) return

              handleTouchStartDollyPan(event)

              state = STATE.TOUCH_DOLLY_PAN

              break

            case TOUCH.DOLLY_ROTATE:
              if (this.enableZoom === false && this.enableRotate === false) return

              handleTouchStartDollyRotate(event)

              state = STATE.TOUCH_DOLLY_ROTATE

              break

            default:
              state = STATE.NONE
          }

          break

        default:
          state = STATE.NONE
      }

      if (state !== STATE.NONE) {
        this.dispatchEvent(startEvent)
      }
    }

    function onTouchMove(event: TouchEvent) {
      if (this.enabled === false) return

      event.preventDefault()

      switch (state) {
        case STATE.TOUCH_ROTATE:
          if (this.enableRotate === false) return

          handleTouchMoveRotate(event)

          this.update()

          break

        case STATE.TOUCH_PAN:
          if (this.enablePan === false) return

          handleTouchMovePan(event)

          this.update()

          break

        case STATE.TOUCH_DOLLY_PAN:
          if (this.enableZoom === false && this.enablePan === false) return

          handleTouchMoveDollyPan(event)

          this.update()

          break

        case STATE.TOUCH_DOLLY_ROTATE:
          if (this.enableZoom === false && this.enableRotate === false) return

          handleTouchMoveDollyRotate(event)

          this.update()

          break

        default:
          state = STATE.NONE
      }
    }

    function onTouchEnd(event: TouchEvent) {
      if (this.enabled === false) return

      handleTouchEnd(event)

      this.dispatchEvent(endEvent)

      state = STATE.NONE
    }

    function onContextMenu(event: Event) {
      if (this.enabled === false) return

      event.preventDefault()
    }

    //

    this.domElement.addEventListener('contextmenu', onContextMenu, false)

    this.domElement.addEventListener('mousedown', onMouseDown, false)
    this.domElement.addEventListener('wheel', onMouseWheel, false)

    this.domElement.addEventListener('touchstart', onTouchStart, false)
    this.domElement.addEventListener('touchend', onTouchEnd, false)
    this.domElement.addEventListener('touchmove', onTouchMove, false)

    this.domElement.addEventListener('keydown', onKeyDown, false)

    // make sure element can receive keys.

    if (this.domElement.tabIndex === -1) {
      this.domElement.tabIndex = 0
    }

    // force an update at start

    this.object.lookAt(this.target)
    this.update()
    this.saveState()
  }

  //
  // public methods
  //

  getPolarAngle = () => this.spherical.phi

  getAzimuthalAngle = () => this.spherical.theta

  saveState = () => {
    this.target0.copy(this.target)
    this.position0.copy(this.object.position)
    this.quaternion0.copy(this.object.quaternion)
    this.zoom0 = this.object.zoom
  }

  reset = () => {
    this.target.copy(this.target0)
    this.object.position.copy(this.position0)
    this.object.quaternion.copy(this.quaternion0)
    this.object.zoom = this.zoom0

    this.object.updateProjectionMatrix()
    this.dispatchEvent(changeEvent)

    this.update()

    this.state = STATE.NONE
  }

  dispose = () => {
    this.domElement.removeEventListener('contextmenu', this.onContextMenu, false)
    this.domElement.removeEventListener('mousedown', this.onMouseDown, false)
    this.domElement.removeEventListener('wheel', this.onMouseWheel, false)

    this.domElement.removeEventListener('touchstart', this.onTouchStart, false)
    this.domElement.removeEventListener('touchend', this.onTouchEnd, false)
    this.domElement.removeEventListener('touchmove', this.onTouchMove, false)

    document.removeEventListener('mousemove', this.onMouseMove, false)
    document.removeEventListener('mouseup', this.onMouseUp, false)

    this.domElement.removeEventListener('keydown', this.onKeyDown, false)

    //this.dispatchEvent( { type: 'dispose' } ); // should this be added here?
  }

  // Internal methods

  private update = (() => {
    const offset = new Vector3()

    // so camera.up is the orbit axis
    const quat = new Quaternion().setFromUnitVectors(this.object.up, new Vector3(0, 1, 0))
    const quatInverse = quat.clone().invert()

    const lastPosition = new Vector3()
    const lastQuaternion = new Quaternion()

    const q = new Quaternion()
    const vec = new Vector3()

    return () => {
      const position = this.object.position

      offset.copy(position).sub(this.target)

      if (this.trackball) {
        // rotate around screen-space y-axis

        if (this.sphericalDelta.theta) {
          vec.set(0, 1, 0).applyQuaternion(this.object.quaternion)

          var factor = this.enableDamping ? this.dampingFactor : 1

          q.setFromAxisAngle(vec, this.sphericalDelta.theta * factor)

          this.object.quaternion.premultiply(q)
          offset.applyQuaternion(q)
        }

        // rotate around screen-space x-axis

        if (this.sphericalDelta.phi) {
          vec.set(1, 0, 0).applyQuaternion(this.object.quaternion)

          var factor = this.enableDamping ? this.dampingFactor : 1

          q.setFromAxisAngle(vec, this.sphericalDelta.phi * factor)

          this.object.quaternion.premultiply(q)
          offset.applyQuaternion(q)
        }

        offset.multiplyScalar(this.scale)
        offset.clampLength(this.minDistance, this.maxDistance)
      } else {
        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat)

        if (this.autoRotate && this.state === STATE.NONE) {
          this.rotateLeft(this.getAutoRotationAngle())
        }

        this.spherical.setFromVector3(offset)

        if (this.enableDamping) {
          this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor
          this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor
        } else {
          this.spherical.theta += this.sphericalDelta.theta
          this.spherical.phi += this.sphericalDelta.phi
        }

        // restrict theta to be between desired limits
        this.spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.spherical.theta))

        // restrict phi to be between desired limits
        this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi))

        this.spherical.makeSafe()

        this.spherical.radius *= this.scale

        // restrict radius to be between desired limits
        this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius))

        offset.setFromSpherical(this.spherical)

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse)
      }

      // move target to panned location

      if (this.enableDamping === true) {
        this.target.addScaledVector(this.panOffset, this.dampingFactor)
      } else {
        this.target.add(this.panOffset)
      }

      position.copy(this.target).add(offset)

      if (this.trackball === false) {
        this.object.lookAt(this.target)
      }

      if (this.enableDamping === true) {
        this.sphericalDelta.theta *= 1 - this.dampingFactor
        this.sphericalDelta.phi *= 1 - this.dampingFactor

        this.panOffset.multiplyScalar(1 - this.dampingFactor)
      } else {
        this.sphericalDelta.set(0, 0, 0)

        this.panOffset.set(0, 0, 0)
      }

      this.scale = 1

      // update condition is:
      // min(camera displacement, camera rotation in radians)^2 > EPS
      // using small-angle approximation cos(x/2) = 1 - x^2 / 8

      if (
        this.zoomChanged ||
        lastPosition.distanceToSquared(this.object.position) > this.EPS ||
        8 * (1 - lastQuaternion.dot(this.object.quaternion)) > this.EPS
      ) {
        this.dispatchEvent(this.changeEvent)

        lastPosition.copy(this.object.position)
        lastQuaternion.copy(this.object.quaternion)
        this.zoomChanged = false

        return true
      }

      return false
    }
  })()

  private getAutoRotationAngle = () => ((2 * Math.PI) / 60 / 60) * this.autoRotateSpeed

  private getZoomScale = () => Math.pow(0.95, this.zoomSpeed)

  private rotateLeft = (angle: number) => (this.sphericalDelta.theta -= angle)

  private rotateUp = (angle: number) => (this.sphericalDelta.phi -= angle)

  private panLeft = (() => {
    const v = new Vector3()

    return function panLeft(distance: number, objectMatrix: Matrix4) {
      v.setFromMatrixColumn(objectMatrix, 0) // get X column of objectMatrix
      v.multiplyScalar(-distance)

      this.panOffset.add(v)
    }
  })()

  private panUp = (() => {
    const v = new Vector3()

    return function panUp(distance: number, objectMatrix: Matrix4) {
      if (this.screenSpacePanning === true) {
        v.setFromMatrixColumn(objectMatrix, 1)
      } else {
        v.setFromMatrixColumn(objectMatrix, 0)
        v.crossVectors(this.object.up, v)
      }

      v.multiplyScalar(distance)

      this.panOffset.add(v)
    }
  })()

  // deltaX and deltaY are in pixels; right and down are positive
  private pan = (() => {
    const offset = new Vector3()

    return function pan(deltaX: number, deltaY: number) {
      const element = this.domElement

      // TODO: this looks wrong...
      if (this.object.isPerspectiveCamera && element instanceof HTMLElement) {
        // perspective
        const position = this.object.position
        offset.copy(position).sub(this.target)
        let targetDistance = offset.length()

        // half of the fov is center to top of screen
        targetDistance *= Math.tan(((this.object.fov / 2) * Math.PI) / 180.0)

        // we use only clientHeight here so aspect ratio does not distort speed
        this.panLeft((2 * deltaX * targetDistance) / element.clientHeight, this.object.matrix)
        this.panUp((2 * deltaY * targetDistance) / element.clientHeight, this.object.matrix)
      } else if (this.object.isOrthographicCamera) {
        // orthographic
        this.panLeft(
          (deltaX * (this.object.right - this.object.left)) / this.object.zoom / element.clientWidth,
          this.object.matrix,
        )
        this.panUp(
          (deltaY * (this.object.top - this.object.bottom)) / this.object.zoom / element.clientHeight,
          this.object.matrix,
        )
      } else {
        // camera neither orthographic nor perspective
        console.warn('WARNING: CameraControls.js encountered an unknown camera type - pan disabled.')
        this.enablePan = false
      }
    }
  })()

  private dollyIn = (dollyScale: number) => {
    if (this.object.isPerspectiveCamera) {
      this.scale /= dollyScale
    } else if (this.object.isOrthographicCamera) {
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale))
      this.object.updateProjectionMatrix()
      this.zoomChanged = true
    } else {
      console.warn('WARNING: CameraControls.js encountered an unknown camera type - dolly/zoom disabled.')
      this.enableZoom = false
    }
  }

  private dollyOut = (dollyScale: number) => {
    if (this.object.isPerspectiveCamera) {
      this.scale *= dollyScale
    } else if (this.object.isOrthographicCamera) {
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale))
      this.object.updateProjectionMatrix()
      this.zoomChanged = true
    } else {
      console.warn('WARNING: CameraControls.js encountered an unknown camera type - dolly/zoom disabled.')
      this.enableZoom = false
    }
  }

  // event callbacks - update the object state
}

/**
 * OrbitControls maintains the "up" direction, camera.up (+Y by default).
 *
 * @event Orbit - left mouse / touch: one-finger move
 * @event Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
 * @event Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move
 */
class OrbitControlsExp extends EventDispatcher {
  mouseButtons: {
    LEFT: MOUSE
    RIGHT: MOUSE
  }
  touches: {
    ONE: TOUCH
    TWO: TOUCH
  }

  constructor(object: Object3D, domElement: HTMLElement) {
    super()

    CameraControls.call(this, object, domElement)

    this.mouseButtons = {
      LEFT: MOUSE.ROTATE,
      RIGHT: MOUSE.PAN,
    }
    this.touches = {
      ONE: TOUCH.ROTATE,
      TWO: TOUCH.DOLLY_PAN,
    }
  }
}

/**
 * MapControls maintains the "up" direction, camera.up (+Y by default)
 *
 * @event Orbit - right mouse, or left mouse + ctrl/meta/shiftKey / touch: two-finger rotate
 * @event Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
 * @event Pan - left mouse, or left right + ctrl/meta/shiftKey, or arrow keys / touch: one-finger move
 */
class MapControlsExp extends EventDispatcher {
  mouseButtons: {
    LEFT: MOUSE
    RIGHT: MOUSE
  }
  touches: {
    ONE: TOUCH
    TWO: TOUCH
  }

  constructor(object: Object3D, domElement: HTMLElement) {
    super()

    CameraControls.call(this, object, domElement)

    this.mouseButtons = {
      LEFT: MOUSE.PAN,
      RIGHT: MOUSE.ROTATE,
    }
    this.touches = {
      ONE: TOUCH.PAN,
      TWO: TOUCH.DOLLY_ROTATE,
    }
  }
}

/**
 * TrackballControls allows the camera to rotate over the polls and does not maintain camera.up
 *
 * @event Orbit - left mouse / touch: one-finger move
 * @event Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
 * @event Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move
 */
class TrackballControlsExp extends EventDispatcher {
  trackball: boolean
  screenSpacePanning: boolean
  autoRotate: boolean
  mouseButtons: {
    LEFT: MOUSE
    RIGHT: MOUSE
  }
  touches: {
    ONE: TOUCH
    TWO: TOUCH
  }

  constructor(object: Object3D, domElement: HTMLElement) {
    super()

    CameraControls.call(this, object, domElement)

    this.trackball = true
    this.screenSpacePanning = true
    this.autoRotate = false

    this.mouseButtons = {
      LEFT: MOUSE.ROTATE,
      RIGHT: MOUSE.PAN,
    }

    this.touches = {
      ONE: TOUCH.ROTATE,
      TWO: TOUCH.DOLLY_PAN,
    }
  }
}

export { CameraControls, OrbitControlsExp, MapControlsExp, TrackballControlsExp }
