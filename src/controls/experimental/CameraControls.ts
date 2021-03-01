import {
  Camera,
  EventDispatcher,
  MOUSE,
  Matrix4,
  OrthographicCamera,
  PerspectiveCamera,
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
  object: PerspectiveCamera | OrthographicCamera
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

  // The four arrow keys
  keys: { LEFT: number; UP: number; RIGHT: number; BOTTOM: number }

  // Mouse buttons
  mouseButtons: {
    LEFT: MOUSE
    MIDDLE: MOUSE
    RIGHT: MOUSE
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

  constructor(object: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
    super()

    if (domElement === undefined) {
      console.warn('THREE.CameraControls: The second parameter "domElement" is now mandatory.')
    }
    if (domElement instanceof Document) {
      console.error(
        'THREE.CameraControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.',
      )
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

    this.domElement.addEventListener('contextmenu', this.onContextMenu, false)

    this.domElement.addEventListener('mousedown', this.onMouseDown, false)
    this.domElement.addEventListener('wheel', this.onMouseWheel, false)

    this.domElement.addEventListener('touchstart', this.onTouchStart, false)
    this.domElement.addEventListener('touchend', this.onTouchEnd, false)
    this.domElement.addEventListener('touchmove', this.onTouchMove, false)

    this.domElement.addEventListener('keydown', this.onKeyDown, false)

    // make sure element can receive keys.

    if (this.domElement.tabIndex === -1) {
      this.domElement.tabIndex = 0
    }

    // force an update at start

    this.object.lookAt(this.target)
    this.update()
    this.saveState()
  }

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
    this.dispatchEvent(this.changeEvent)

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
    // TODO: replace w/.isPerspectiveCamera ?
    if (this.object instanceof PerspectiveCamera) {
      this.scale /= dollyScale
      // TODO: replace w/.isOrthographicCamera ?
    } else if (this.object instanceof OrthographicCamera) {
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom * dollyScale))
      this.object.updateProjectionMatrix()
      this.zoomChanged = true
    } else {
      console.warn('WARNING: CameraControls.js encountered an unknown camera type - dolly/zoom disabled.')
      this.enableZoom = false
    }
  }

  private dollyOut = (dollyScale: number) => {
    // TODO: replace w/.isPerspectiveCamera ?
    if (this.object instanceof PerspectiveCamera) {
      this.scale *= dollyScale
      // TODO: replace w/.isOrthographicCamera ?
    } else if (this.object instanceof OrthographicCamera) {
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / dollyScale))
      this.object.updateProjectionMatrix()
      this.zoomChanged = true
    } else {
      console.warn('WARNING: CameraControls.js encountered an unknown camera type - dolly/zoom disabled.')
      this.enableZoom = false
    }
  }

  // event callbacks - update the object state

  private handleMouseDownRotate = (event: MouseEvent) => {
    this.rotateStart.set(event.clientX, event.clientY)
  }

  // TODO: confirm if worthwhile to return the Vector2 instead of void
  private handleMouseDownDolly = (event: MouseEvent) => {
    this.dollyStart.set(event.clientX, event.clientY)
  }

  private handleMouseDownPan = (event: MouseEvent) => {
    this.panStart.set(event.clientX, event.clientY)
  }

  private handleMouseMoveRotate = (event: MouseEvent) => {
    this.rotateEnd.set(event.clientX, event.clientY)

    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed)

    const element = this.domElement

    this.rotateLeft((2 * Math.PI * this.rotateDelta.x) / element.clientHeight) // yes, height

    this.rotateUp((2 * Math.PI * this.rotateDelta.y) / element.clientHeight)

    this.rotateStart.copy(this.rotateEnd)

    this.update()
  }

  private handleMouseMoveDolly = (event: MouseEvent) => {
    this.dollyEnd.set(event.clientX, event.clientY)

    this.dollyDelta.subVectors(this.dollyEnd, this.dollyStart)

    if (this.dollyDelta.y > 0) {
      this.dollyIn(this.getZoomScale())
    } else if (this.dollyDelta.y < 0) {
      this.dollyOut(this.getZoomScale())
    }

    this.dollyStart.copy(this.dollyEnd)

    this.update()
  }

  private handleMouseMovePan = (event: MouseEvent) => {
    this.panEnd.set(event.clientX, event.clientY)

    this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed)

    this.pan(this.panDelta.x, this.panDelta.y)

    this.panStart.copy(this.panEnd)

    this.update()
  }

  private handleMouseUp(/*event*/) {
    // no-op
  }

  private handleMouseWheel = (event: WheelEvent) => {
    if (event.deltaY < 0) {
      this.dollyOut(this.getZoomScale())
    } else if (event.deltaY > 0) {
      this.dollyIn(this.getZoomScale())
    }

    this.update()
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    let needsUpdate = false

    // TODO: keyCode deprecated?
    switch (event.keyCode) {
      case this.keys.UP:
        this.pan(0, this.keyPanSpeed)
        needsUpdate = true
        break

      case this.keys.BOTTOM:
        this.pan(0, -this.keyPanSpeed)
        needsUpdate = true
        break

      case this.keys.LEFT:
        this.pan(this.keyPanSpeed, 0)
        needsUpdate = true
        break

      case this.keys.RIGHT:
        this.pan(-this.keyPanSpeed, 0)
        needsUpdate = true
        break
    }

    if (needsUpdate) {
      // prevent the browser from scrolling on cursor keys
      event.preventDefault()

      this.update()
    }
  }

  private handleTouchStartRotate = (event: TouchEvent) => {
    if (event.touches.length == 1) {
      this.rotateStart.set(event.touches[0].pageX, event.touches[0].pageY)
    } else {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)

      this.rotateStart.set(x, y)
    }
  }

  private handleTouchStartPan = (event: TouchEvent) => {
    if (event.touches.length == 1) {
      this.panStart.set(event.touches[0].pageX, event.touches[0].pageY)
    } else {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)

      this.panStart.set(x, y)
    }
  }

  private handleTouchStartDolly = (event: TouchEvent) => {
    const dx = event.touches[0].pageX - event.touches[1].pageX
    const dy = event.touches[0].pageY - event.touches[1].pageY

    const distance = Math.sqrt(dx * dx + dy * dy)

    this.dollyStart.set(0, distance)
  }

  private handleTouchStartDollyPan = (event: TouchEvent) => {
    if (this.enableZoom) this.handleTouchStartDolly(event)

    if (this.enablePan) this.handleTouchStartPan(event)
  }

  private handleTouchStartDollyRotate = (event: TouchEvent) => {
    if (this.enableZoom) this.handleTouchStartDolly(event)

    if (this.enableRotate) this.handleTouchStartRotate(event)
  }

  private handleTouchMoveRotate = (event: TouchEvent) => {
    if (event.touches.length == 1) {
      this.rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY)
    } else {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)

      this.rotateEnd.set(x, y)
    }

    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart).multiplyScalar(this.rotateSpeed)

    const element = this.domElement

    this.rotateLeft((2 * Math.PI * this.rotateDelta.x) / element.clientHeight) // yes, height

    this.rotateUp((2 * Math.PI * this.rotateDelta.y) / element.clientHeight)

    this.rotateStart.copy(this.rotateEnd)
  }

  private handleTouchMovePan = (event: TouchEvent) => {
    if (event.touches.length == 1) {
      this.panEnd.set(event.touches[0].pageX, event.touches[0].pageY)
    } else {
      const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
      const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)

      this.panEnd.set(x, y)
    }

    this.panDelta.subVectors(this.panEnd, this.panStart).multiplyScalar(this.panSpeed)

    this.pan(this.panDelta.x, this.panDelta.y)

    this.panStart.copy(this.panEnd)
  }

  private handleTouchMoveDolly = (event: TouchEvent) => {
    const dx = event.touches[0].pageX - event.touches[1].pageX
    const dy = event.touches[0].pageY - event.touches[1].pageY

    const distance = Math.sqrt(dx * dx + dy * dy)

    this.dollyEnd.set(0, distance)

    this.dollyDelta.set(0, Math.pow(this.dollyEnd.y / this.dollyStart.y, this.zoomSpeed))

    this.dollyIn(this.dollyDelta.y)

    this.dollyStart.copy(this.dollyEnd)
  }

  private handleTouchMoveDollyPan = (event: TouchEvent) => {
    if (this.enableZoom) this.handleTouchMoveDolly(event)

    if (this.enablePan) this.handleTouchMovePan(event)
  }

  private handleTouchMoveDollyRotate = (event: TouchEvent) => {
    if (this.enableZoom) this.handleTouchMoveDolly(event)

    if (this.enableRotate) this.handleTouchMoveRotate(event)
  }

  private handleTouchEnd(/*event*/) {
    // no-op
  }

  //
  // event handlers - FSM: listen for events and reset state
  //

  private onMouseDown = (event: MouseEvent) => {
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

        this.handleMouseDownDolly(event)

        this.state = STATE.DOLLY

        break

      case MOUSE.ROTATE:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enablePan === false) return

          this.handleMouseDownPan(event)

          this.state = STATE.PAN
        } else {
          if (this.enableRotate === false) return

          this.handleMouseDownRotate(event)

          this.state = STATE.ROTATE
        }

        break

      case MOUSE.PAN:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate === false) return

          this.handleMouseDownRotate(event)

          this.state = STATE.ROTATE
        } else {
          if (this.enablePan === false) return

          this.handleMouseDownPan(event)

          this.state = STATE.PAN
        }

        break

      default:
        this.state = STATE.NONE
    }

    if (this.state !== STATE.NONE) {
      document.addEventListener('mousemove', this.onMouseMove, false)
      document.addEventListener('mouseup', this.onMouseUp, false)

      this.dispatchEvent(this.startEvent)
    }
  }

  private onMouseMove = (event: MouseEvent) => {
    if (this.enabled === false) return

    event.preventDefault()

    switch (this.state) {
      case STATE.ROTATE:
        if (this.enableRotate === false) return

        this.handleMouseMoveRotate(event)

        break

      case STATE.DOLLY:
        if (this.enableZoom === false) return

        this.handleMouseMoveDolly(event)

        break

      case STATE.PAN:
        if (this.enablePan === false) return

        this.handleMouseMovePan(event)

        break
    }
  }

  private onMouseUp = (event: MouseEvent) => {
    if (this.enabled === false) return

    // this.handleMouseUp()

    document.removeEventListener('mousemove', this.onMouseMove, false)
    document.removeEventListener('mouseup', this.onMouseUp, false)

    this.dispatchEvent(this.endEvent)

    this.state = STATE.NONE
  }

  private onMouseWheel = (event: WheelEvent) => {
    if (
      this.enabled === false ||
      this.enableZoom === false ||
      (this.state !== STATE.NONE && this.state !== STATE.ROTATE)
    ) {
      return
    }

    event.preventDefault()

    this.dispatchEvent(this.startEvent)

    this.handleMouseWheel(event)

    this.dispatchEvent(this.endEvent)
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (this.enabled === false || this.enableKeys === false || this.enablePan === false) return

    this.handleKeyDown(event)
  }

  private onTouchStart = (event: TouchEvent) => {
    if (this.enabled === false) return

    event.preventDefault()

    switch (event.touches.length) {
      case 1:
        switch (this.touches.ONE) {
          case TOUCH.ROTATE:
            if (this.enableRotate === false) return

            this.handleTouchStartRotate(event)

            this.state = STATE.TOUCH_ROTATE

            break

          case TOUCH.PAN:
            if (this.enablePan === false) return

            this.handleTouchStartPan(event)

            this.state = STATE.TOUCH_PAN

            break

          default:
            this.state = STATE.NONE
        }

        break

      case 2:
        switch (this.touches.TWO) {
          case TOUCH.DOLLY_PAN:
            if (this.enableZoom === false && this.enablePan === false) return

            this.handleTouchStartDollyPan(event)

            this.state = STATE.TOUCH_DOLLY_PAN

            break

          case TOUCH.DOLLY_ROTATE:
            if (this.enableZoom === false && this.enableRotate === false) return

            this.handleTouchStartDollyRotate(event)

            this.state = STATE.TOUCH_DOLLY_ROTATE

            break

          default:
            this.state = STATE.NONE
        }

        break

      default:
        this.state = STATE.NONE
    }

    if (this.state !== STATE.NONE) {
      this.dispatchEvent(this.startEvent)
    }
  }

  private onTouchMove = (event: TouchEvent) => {
    if (this.enabled === false) return

    event.preventDefault()

    switch (this.state) {
      case STATE.TOUCH_ROTATE:
        if (this.enableRotate === false) return

        this.handleTouchMoveRotate(event)

        this.update()

        break

      case STATE.TOUCH_PAN:
        if (this.enablePan === false) return

        this.handleTouchMovePan(event)

        this.update()

        break

      case STATE.TOUCH_DOLLY_PAN:
        if (this.enableZoom === false && this.enablePan === false) return

        this.handleTouchMoveDollyPan(event)

        this.update()

        break

      case STATE.TOUCH_DOLLY_ROTATE:
        if (this.enableZoom === false && this.enableRotate === false) return

        this.handleTouchMoveDollyRotate(event)

        this.update()

        break

      default:
        this.state = STATE.NONE
    }
  }

  private onTouchEnd = (event: TouchEvent) => {
    if (this.enabled === false) return

    // this.handleTouchEnd()

    this.dispatchEvent(this.endEvent)

    this.state = STATE.NONE
  }

  private onContextMenu = (event: Event) => {
    if (this.enabled === false) return

    event.preventDefault()
  }
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

    // FIXME:
    // Argument of type 'this' is not assignable to parameter of type 'CameraControls'.
    // Type 'OrbitControlsExp' is missing the following properties from type 'CameraControls': object, domElement, enabled, target, and 90 more.
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

    // FIXME:
    // Argument of type 'this' is not assignable to parameter of type 'CameraControls'.
    // Type 'MapControlsExp' is missing the following properties from type 'CameraControls': object, domElement, enabled, target, and 90 more.
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

    // FIXME:
    // Argument of type 'this' is not assignable to parameter of type 'CameraControls'.
    // Type 'TrackballControlsExp' is missing the following properties from type 'CameraControls': object, domElement, enabled, target, and 87 more.
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
