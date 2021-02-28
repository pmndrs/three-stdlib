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

  getPolarAngle: () => number
  getAzimuthalAngle: () => number
  saveState: () => void
  reset: () => void
  update: () => boolean
  dispose: () => void

  constructor(object: Camera, domElement: HTMLElement | Document) {
    super()

    if (domElement === undefined) {
      console.warn('THREE.CameraControls: The second parameter "domElement" is now mandatory.')
    }
    if (domElement instanceof Document) {
      console.error(
        'THREE.CameraControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.',
      )
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

    this.getPolarAngle = () => spherical.phi

    this.getAzimuthalAngle = () => spherical.theta

    this.saveState = () => {
      scope.target0.copy(scope.target)
      scope.position0.copy(scope.object.position)
      scope.quaternion0.copy(scope.object.quaternion)
      scope.zoom0 = scope.object.zoom
    }

    this.reset = () => {
      scope.target.copy(scope.target0)
      scope.object.position.copy(scope.position0)
      scope.object.quaternion.copy(scope.quaternion0)
      scope.object.zoom = scope.zoom0

      scope.object.updateProjectionMatrix()
      scope.dispatchEvent(changeEvent)

      scope.update()

      state = STATE.NONE
    }

    // this method is exposed, but perhaps it would be better if we can make it private...
    this.update = (() => {
      const offset = new Vector3()

      // so camera.up is the orbit axis
      const quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0))
      const quatInverse = quat.clone().invert()

      const lastPosition = new Vector3()
      const lastQuaternion = new Quaternion()

      const q = new Quaternion()
      const vec = new Vector3()

      return function update() {
        const position = scope.object.position

        offset.copy(position).sub(scope.target)

        if (scope.trackball) {
          // rotate around screen-space y-axis

          if (sphericalDelta.theta) {
            vec.set(0, 1, 0).applyQuaternion(scope.object.quaternion)

            var factor = scope.enableDamping ? scope.dampingFactor : 1

            q.setFromAxisAngle(vec, sphericalDelta.theta * factor)

            scope.object.quaternion.premultiply(q)
            offset.applyQuaternion(q)
          }

          // rotate around screen-space x-axis

          if (sphericalDelta.phi) {
            vec.set(1, 0, 0).applyQuaternion(scope.object.quaternion)

            var factor = scope.enableDamping ? scope.dampingFactor : 1

            q.setFromAxisAngle(vec, sphericalDelta.phi * factor)

            scope.object.quaternion.premultiply(q)
            offset.applyQuaternion(q)
          }

          offset.multiplyScalar(scale)
          offset.clampLength(scope.minDistance, scope.maxDistance)
        } else {
          // rotate offset to "y-axis-is-up" space
          offset.applyQuaternion(quat)

          if (scope.autoRotate && state === STATE.NONE) {
            rotateLeft(getAutoRotationAngle())
          }

          spherical.setFromVector3(offset)

          if (scope.enableDamping) {
            spherical.theta += sphericalDelta.theta * scope.dampingFactor
            spherical.phi += sphericalDelta.phi * scope.dampingFactor
          } else {
            spherical.theta += sphericalDelta.theta
            spherical.phi += sphericalDelta.phi
          }

          // restrict theta to be between desired limits
          spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta))

          // restrict phi to be between desired limits
          spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi))

          spherical.makeSafe()

          spherical.radius *= scale

          // restrict radius to be between desired limits
          spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius))

          offset.setFromSpherical(spherical)

          // rotate offset back to "camera-up-vector-is-up" space
          offset.applyQuaternion(quatInverse)
        }

        // move target to panned location

        if (scope.enableDamping === true) {
          scope.target.addScaledVector(panOffset, scope.dampingFactor)
        } else {
          scope.target.add(panOffset)
        }

        position.copy(scope.target).add(offset)

        if (scope.trackball === false) {
          scope.object.lookAt(scope.target)
        }

        if (scope.enableDamping === true) {
          sphericalDelta.theta *= 1 - scope.dampingFactor
          sphericalDelta.phi *= 1 - scope.dampingFactor

          panOffset.multiplyScalar(1 - scope.dampingFactor)
        } else {
          sphericalDelta.set(0, 0, 0)

          panOffset.set(0, 0, 0)
        }

        scale = 1

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if (
          zoomChanged ||
          lastPosition.distanceToSquared(scope.object.position) > EPS ||
          8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS
        ) {
          scope.dispatchEvent(changeEvent)

          lastPosition.copy(scope.object.position)
          lastQuaternion.copy(scope.object.quaternion)
          zoomChanged = false

          return true
        }

        return false
      }
    })()

    this.dispose = () => {
      scope.domElement.removeEventListener('contextmenu', onContextMenu, false)
      scope.domElement.removeEventListener('mousedown', onMouseDown, false)
      scope.domElement.removeEventListener('wheel', onMouseWheel, false)

      scope.domElement.removeEventListener('touchstart', onTouchStart, false)
      scope.domElement.removeEventListener('touchend', onTouchEnd, false)
      scope.domElement.removeEventListener('touchmove', onTouchMove, false)

      document.removeEventListener('mousemove', onMouseMove, false)
      document.removeEventListener('mouseup', onMouseUp, false)

      scope.domElement.removeEventListener('keydown', onKeyDown, false)

      //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
    }

    //
    // internals
    //

    var scope = this

    var changeEvent = { type: 'change' }
    const startEvent = { type: 'start' }
    const endEvent = { type: 'end' }

    var STATE = {
      NONE: -1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_PAN: 4,
      TOUCH_DOLLY_PAN: 5,
      TOUCH_DOLLY_ROTATE: 6,
    }

    var state = STATE.NONE

    var EPS = 0.000001

    // current position in spherical coordinates
    var spherical = new Spherical()
    var sphericalDelta = new Spherical()

    var scale = 1
    var panOffset = new Vector3()
    var zoomChanged = false

    const rotateStart = new Vector2()
    const rotateEnd = new Vector2()
    const rotateDelta = new Vector2()

    const panStart = new Vector2()
    const panEnd = new Vector2()
    const panDelta = new Vector2()

    const dollyStart = new Vector2()
    const dollyEnd = new Vector2()
    const dollyDelta = new Vector2()

    function getAutoRotationAngle() {
      return ((2 * Math.PI) / 60 / 60) * scope.autoRotateSpeed
    }

    function getZoomScale() {
      return Math.pow(0.95, scope.zoomSpeed)
    }

    function rotateLeft(angle: number) {
      sphericalDelta.theta -= angle
    }

    function rotateUp(angle: number) {
      sphericalDelta.phi -= angle
    }

    const panLeft = (() => {
      const v = new Vector3()

      return function panLeft(distance: number, objectMatrix: Matrix4) {
        v.setFromMatrixColumn(objectMatrix, 0) // get X column of objectMatrix
        v.multiplyScalar(-distance)

        panOffset.add(v)
      }
    })()

    const panUp = (() => {
      const v = new Vector3()

      return function panUp(distance: number, objectMatrix: Matrix4) {
        if (scope.screenSpacePanning === true) {
          v.setFromMatrixColumn(objectMatrix, 1)
        } else {
          v.setFromMatrixColumn(objectMatrix, 0)
          v.crossVectors(scope.object.up, v)
        }

        v.multiplyScalar(distance)

        panOffset.add(v)
      }
    })()

    // deltaX and deltaY are in pixels; right and down are positive
    const pan = (() => {
      const offset = new Vector3()

      return function pan(deltaX: number, deltaY: number) {
        const element = scope.domElement

        if (scope.object.isPerspectiveCamera && element instanceof HTMLElement) {
          // perspective
          const position = scope.object.position
          offset.copy(position).sub(scope.target)
          let targetDistance = offset.length()

          // half of the fov is center to top of screen
          targetDistance *= Math.tan(((scope.object.fov / 2) * Math.PI) / 180.0)

          // we use only clientHeight here so aspect ratio does not distort speed
          panLeft((2 * deltaX * targetDistance) / element.clientHeight, scope.object.matrix)
          panUp((2 * deltaY * targetDistance) / element.clientHeight, scope.object.matrix)
        } else if (scope.object.isOrthographicCamera) {
          // orthographic
          panLeft(
            (deltaX * (scope.object.right - scope.object.left)) / scope.object.zoom / element.clientWidth,
            scope.object.matrix,
          )
          panUp(
            (deltaY * (scope.object.top - scope.object.bottom)) / scope.object.zoom / element.clientHeight,
            scope.object.matrix,
          )
        } else {
          // camera neither orthographic nor perspective
          console.warn('WARNING: CameraControls.js encountered an unknown camera type - pan disabled.')
          scope.enablePan = false
        }
      }
    })()

    function dollyIn(dollyScale: number) {
      if (scope.object.isPerspectiveCamera) {
        scale /= dollyScale
      } else if (scope.object.isOrthographicCamera) {
        scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale))
        scope.object.updateProjectionMatrix()
        zoomChanged = true
      } else {
        console.warn('WARNING: CameraControls.js encountered an unknown camera type - dolly/zoom disabled.')
        scope.enableZoom = false
      }
    }

    function dollyOut(dollyScale: number) {
      if (scope.object.isPerspectiveCamera) {
        scale *= dollyScale
      } else if (scope.object.isOrthographicCamera) {
        scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale))
        scope.object.updateProjectionMatrix()
        zoomChanged = true
      } else {
        console.warn('WARNING: CameraControls.js encountered an unknown camera type - dolly/zoom disabled.')
        scope.enableZoom = false
      }
    }

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

      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed)

      const element = scope.domElement

      rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientHeight) // yes, height

      rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight)

      rotateStart.copy(rotateEnd)

      scope.update()
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

      scope.update()
    }

    function handleMouseMovePan(event: MouseEvent) {
      panEnd.set(event.clientX, event.clientY)

      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed)

      pan(panDelta.x, panDelta.y)

      panStart.copy(panEnd)

      scope.update()
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

      scope.update()
    }

    function handleKeyDown(event: KeyboardEvent) {
      let needsUpdate = false

      switch (event.keyCode) {
        case scope.keys.UP:
          pan(0, scope.keyPanSpeed)
          needsUpdate = true
          break

        case scope.keys.BOTTOM:
          pan(0, -scope.keyPanSpeed)
          needsUpdate = true
          break

        case scope.keys.LEFT:
          pan(scope.keyPanSpeed, 0)
          needsUpdate = true
          break

        case scope.keys.RIGHT:
          pan(-scope.keyPanSpeed, 0)
          needsUpdate = true
          break
      }

      if (needsUpdate) {
        // prevent the browser from scrolling on cursor keys
        event.preventDefault()

        scope.update()
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
      if (scope.enableZoom) handleTouchStartDolly(event)

      if (scope.enablePan) handleTouchStartPan(event)
    }

    function handleTouchStartDollyRotate(event: TouchEvent) {
      if (scope.enableZoom) handleTouchStartDolly(event)

      if (scope.enableRotate) handleTouchStartRotate(event)
    }

    function handleTouchMoveRotate(event: TouchEvent) {
      if (event.touches.length == 1) {
        rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY)
      } else {
        const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX)
        const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY)

        rotateEnd.set(x, y)
      }

      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed)

      const element = scope.domElement

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

      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed)

      pan(panDelta.x, panDelta.y)

      panStart.copy(panEnd)
    }

    function handleTouchMoveDolly(event: TouchEvent) {
      const dx = event.touches[0].pageX - event.touches[1].pageX
      const dy = event.touches[0].pageY - event.touches[1].pageY

      const distance = Math.sqrt(dx * dx + dy * dy)

      dollyEnd.set(0, distance)

      dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed))

      dollyIn(dollyDelta.y)

      dollyStart.copy(dollyEnd)
    }

    function handleTouchMoveDollyPan(event: TouchEvent) {
      if (scope.enableZoom) handleTouchMoveDolly(event)

      if (scope.enablePan) handleTouchMovePan(event)
    }

    function handleTouchMoveDollyRotate(event: TouchEvent) {
      if (scope.enableZoom) handleTouchMoveDolly(event)

      if (scope.enableRotate) handleTouchMoveRotate(event)
    }

    function handleTouchEnd(/*event*/) {
      // no-op
    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    function onMouseDown(event: MouseEvent) {
      if (scope.enabled === false) return

      // Prevent the browser from scrolling.

      event.preventDefault()

      // Manually set the focus since calling preventDefault above
      // prevents the browser from setting it automatically.

      scope.domElement.focus ? scope.domElement.focus() : window.focus()

      let mouseAction

      switch (event.button) {
        case 0:
          mouseAction = scope.mouseButtons.LEFT
          break

        case 1:
          mouseAction = scope.mouseButtons.MIDDLE
          break

        case 2:
          mouseAction = scope.mouseButtons.RIGHT
          break

        default:
          mouseAction = -1
      }

      switch (mouseAction) {
        case MOUSE.DOLLY:
          if (scope.enableZoom === false) return

          handleMouseDownDolly(event)

          state = STATE.DOLLY

          break

        case MOUSE.ROTATE:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            if (scope.enablePan === false) return

            handleMouseDownPan(event)

            state = STATE.PAN
          } else {
            if (scope.enableRotate === false) return

            handleMouseDownRotate(event)

            state = STATE.ROTATE
          }

          break

        case MOUSE.PAN:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            if (scope.enableRotate === false) return

            handleMouseDownRotate(event)

            state = STATE.ROTATE
          } else {
            if (scope.enablePan === false) return

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

        scope.dispatchEvent(startEvent)
      }
    }

    function onMouseMove(event: MouseEvent) {
      if (scope.enabled === false) return

      event.preventDefault()

      switch (state) {
        case STATE.ROTATE:
          if (scope.enableRotate === false) return

          handleMouseMoveRotate(event)

          break

        case STATE.DOLLY:
          if (scope.enableZoom === false) return

          handleMouseMoveDolly(event)

          break

        case STATE.PAN:
          if (scope.enablePan === false) return

          handleMouseMovePan(event)

          break
      }
    }

    function onMouseUp(event: MouseEvent) {
      if (scope.enabled === false) return

      handleMouseUp(event)

      document.removeEventListener('mousemove', onMouseMove, false)
      document.removeEventListener('mouseup', onMouseUp, false)

      scope.dispatchEvent(endEvent)

      state = STATE.NONE
    }

    function onMouseWheel(event: WheelEvent) {
      if (scope.enabled === false || scope.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) {
        return
      }

      event.preventDefault()

      scope.dispatchEvent(startEvent)

      handleMouseWheel(event)

      scope.dispatchEvent(endEvent)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return

      handleKeyDown(event)
    }

    function onTouchStart(event: TouchEvent) {
      if (scope.enabled === false) return

      event.preventDefault()

      switch (event.touches.length) {
        case 1:
          switch (scope.touches.ONE) {
            case TOUCH.ROTATE:
              if (scope.enableRotate === false) return

              handleTouchStartRotate(event)

              state = STATE.TOUCH_ROTATE

              break

            case TOUCH.PAN:
              if (scope.enablePan === false) return

              handleTouchStartPan(event)

              state = STATE.TOUCH_PAN

              break

            default:
              state = STATE.NONE
          }

          break

        case 2:
          switch (scope.touches.TWO) {
            case TOUCH.DOLLY_PAN:
              if (scope.enableZoom === false && scope.enablePan === false) return

              handleTouchStartDollyPan(event)

              state = STATE.TOUCH_DOLLY_PAN

              break

            case TOUCH.DOLLY_ROTATE:
              if (scope.enableZoom === false && scope.enableRotate === false) return

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
        scope.dispatchEvent(startEvent)
      }
    }

    function onTouchMove(event: TouchEvent) {
      if (scope.enabled === false) return

      event.preventDefault()

      switch (state) {
        case STATE.TOUCH_ROTATE:
          if (scope.enableRotate === false) return

          handleTouchMoveRotate(event)

          scope.update()

          break

        case STATE.TOUCH_PAN:
          if (scope.enablePan === false) return

          handleTouchMovePan(event)

          scope.update()

          break

        case STATE.TOUCH_DOLLY_PAN:
          if (scope.enableZoom === false && scope.enablePan === false) return

          handleTouchMoveDollyPan(event)

          scope.update()

          break

        case STATE.TOUCH_DOLLY_ROTATE:
          if (scope.enableZoom === false && scope.enableRotate === false) return

          handleTouchMoveDollyRotate(event)

          scope.update()

          break

        default:
          state = STATE.NONE
      }
    }

    function onTouchEnd(event: TouchEvent) {
      if (scope.enabled === false) return

      handleTouchEnd(event)

      scope.dispatchEvent(endEvent)

      state = STATE.NONE
    }

    function onContextMenu(event: Event) {
      if (scope.enabled === false) return

      event.preventDefault()
    }

    //

    scope.domElement.addEventListener('contextmenu', onContextMenu, false)

    scope.domElement.addEventListener('mousedown', onMouseDown, false)
    scope.domElement.addEventListener('wheel', onMouseWheel, false)

    scope.domElement.addEventListener('touchstart', onTouchStart, false)
    scope.domElement.addEventListener('touchend', onTouchEnd, false)
    scope.domElement.addEventListener('touchmove', onTouchMove, false)

    scope.domElement.addEventListener('keydown', onKeyDown, false)

    // make sure element can receive keys.

    if (scope.domElement.tabIndex === -1) {
      scope.domElement.tabIndex = 0
    }

    // force an update at start

    this.object.lookAt(scope.target)
    this.update()
    this.saveState()
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
