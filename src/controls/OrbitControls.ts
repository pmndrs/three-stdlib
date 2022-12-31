/* eslint-disable */
import {
  Camera,
  EventDispatcher,
  Matrix4,
  MOUSE,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Spherical,
  TOUCH,
  Vector2,
  Vector3,
} from 'three'

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

const moduloWrapAround = (offset: number, capacity: number) => ((offset % capacity) + capacity) % capacity

class OrbitControls extends EventDispatcher {
  object: Camera
  domElement: HTMLElement | undefined
  // Set to false to disable this control
  enabled = true
  // "target" sets the location of focus, where the object orbits around
  target = new Vector3()
  // How far you can dolly in and out ( PerspectiveCamera only )
  minDistance = 0
  maxDistance = Infinity
  // How far you can zoom in and out ( OrthographicCamera only )
  minZoom = 0
  maxZoom = Infinity
  // How far you can orbit vertically, upper and lower limits.
  // Range is 0 to Math.PI radians.
  minPolarAngle = 0 // radians
  maxPolarAngle = Math.PI // radians
  // How far you can orbit horizontally, upper and lower limits.
  // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
  minAzimuthAngle = -Infinity // radians
  maxAzimuthAngle = Infinity // radians
  // Set to true to enable damping (inertia)
  // If damping is enabled, you must call controls.update() in your animation loop
  enableDamping = false
  dampingFactor = 0.05
  // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
  // Set to false to disable zooming
  enableZoom = true
  zoomSpeed = 1.0
  // Set to false to disable rotating
  enableRotate = true
  rotateSpeed = 1.0
  // Set to false to disable panning
  enablePan = true
  panSpeed = 1.0
  screenSpacePanning = true // if false, pan orthogonal to world-space direction camera.up
  keyPanSpeed = 7.0 // pixels moved per arrow key push
  // Set to true to automatically rotate around the target
  // If auto-rotate is enabled, you must call controls.update() in your animation loop
  autoRotate = false
  autoRotateSpeed = 2.0 // 30 seconds per orbit when fps is 60
  reverseOrbit = false // true if you want to reverse the orbit to mouse drag from left to right = orbits left
  // The four arrow keys
  keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' }
  // Mouse buttons
  mouseButtons: Partial<{
    LEFT: MOUSE
    MIDDLE: MOUSE
    RIGHT: MOUSE
  }> = {
    LEFT: MOUSE.ROTATE,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.PAN,
  }
  // Touch fingers
  touches: Partial<{
    ONE: TOUCH
    TWO: TOUCH
  }> = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }
  target0: Vector3
  position0: Vector3
  zoom0: number
  // the target DOM element for key events
  _domElementKeyEvents: any = null

  getPolarAngle: () => number
  getAzimuthalAngle: () => number
  setPolarAngle: (x: number) => void
  setAzimuthalAngle: (x: number) => void
  getDistance: () => number

  listenToKeyEvents: (domElement: HTMLElement) => void
  saveState: () => void
  reset: () => void
  update: () => void
  connect: (domElement: HTMLElement) => void
  dispose: () => void

  constructor(object: Camera, domElement?: HTMLElement) {
    super()

    this.object = object
    this.domElement = domElement

    // for reset
    this.target0 = this.target.clone()
    this.position0 = this.object.position.clone()
    this.zoom0 = this.object instanceof PerspectiveCamera ? this.object.zoom : 1

    //
    // public methods
    //

    this.getPolarAngle = (): number => spherical.phi

    this.getAzimuthalAngle = (): number => spherical.theta

    this.setPolarAngle = (value: number): void => {
      // use modulo wrapping to safeguard value
      let phi = moduloWrapAround(value, 2 * Math.PI)
      let currentPhi = spherical.phi

      // convert to the equivalent shortest angle
      if (currentPhi < 0) currentPhi += 2 * Math.PI
      if (phi < 0) phi += 2 * Math.PI
      let phiDist = Math.abs(phi - currentPhi)
      if (2 * Math.PI - phiDist < phiDist) {
        if (phi < currentPhi) {
          phi += 2 * Math.PI
        } else {
          currentPhi += 2 * Math.PI
        }
      }
      sphericalDelta.phi = phi - currentPhi
      scope.update()
    }

    this.setAzimuthalAngle = (value: number): void => {
      // use modulo wrapping to safeguard value
      let theta = moduloWrapAround(value, 2 * Math.PI)
      let currentTheta = spherical.theta

      // convert to the equivalent shortest angle
      if (currentTheta < 0) currentTheta += 2 * Math.PI
      if (theta < 0) theta += 2 * Math.PI
      let thetaDist = Math.abs(theta - currentTheta)
      if (2 * Math.PI - thetaDist < thetaDist) {
        if (theta < currentTheta) {
          theta += 2 * Math.PI
        } else {
          currentTheta += 2 * Math.PI
        }
      }
      sphericalDelta.theta = theta - currentTheta
      scope.update()
    }

    this.getDistance = (): number => scope.object.position.distanceTo(scope.target)

    this.listenToKeyEvents = (domElement: HTMLElement): void => {
      domElement.addEventListener('keydown', onKeyDown)
      this._domElementKeyEvents = domElement
    }

    this.saveState = (): void => {
      scope.target0.copy(scope.target)
      scope.position0.copy(scope.object.position)
      scope.zoom0 = scope.object instanceof PerspectiveCamera ? scope.object.zoom : 1
    }

    this.reset = (): void => {
      scope.target.copy(scope.target0)
      scope.object.position.copy(scope.position0)
      if (scope.object instanceof PerspectiveCamera) {
        scope.object.zoom = scope.zoom0
        scope.object.updateProjectionMatrix()
      }

      scope.dispatchEvent(changeEvent)

      scope.update()

      state = STATE.NONE
    }

    // this method is exposed, but perhaps it would be better if we can make it private...
    this.update = ((): (() => void) => {
      const offset = new Vector3()

      // so camera.up is the orbit axis
      const quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0))
      const quatInverse = quat.clone().invert()

      const lastPosition = new Vector3()
      const lastQuaternion = new Quaternion()

      const twoPI = 2 * Math.PI

      return function update(): boolean {
        const position = scope.object.position

        offset.copy(position).sub(scope.target)

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat)

        // angle from z-axis around y-axis
        spherical.setFromVector3(offset)

        if (scope.autoRotate && state === STATE.NONE) {
          rotateLeft(getAutoRotationAngle())
        }

        if (scope.enableDamping) {
          spherical.theta += sphericalDelta.theta * scope.dampingFactor
          spherical.phi += sphericalDelta.phi * scope.dampingFactor
        } else {
          spherical.theta += sphericalDelta.theta
          spherical.phi += sphericalDelta.phi
        }

        // restrict theta to be between desired limits

        let min = scope.minAzimuthAngle
        let max = scope.maxAzimuthAngle

        if (isFinite(min) && isFinite(max)) {
          if (min < -Math.PI) min += twoPI
          else if (min > Math.PI) min -= twoPI

          if (max < -Math.PI) max += twoPI
          else if (max > Math.PI) max -= twoPI

          if (min <= max) {
            spherical.theta = Math.max(min, Math.min(max, spherical.theta))
          } else {
            spherical.theta =
              spherical.theta > (min + max) / 2 ? Math.max(min, spherical.theta) : Math.min(max, spherical.theta)
          }
        }

        // restrict phi to be between desired limits
        spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi))
        spherical.makeSafe()
        spherical.radius *= scale

        // restrict radius to be between desired limits
        spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius))

        // move target to panned location

        if (scope.enableDamping === true) {
          scope.target.addScaledVector(panOffset, scope.dampingFactor)
        } else {
          scope.target.add(panOffset)
        }

        offset.setFromSpherical(spherical)

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse)

        position.copy(scope.target).add(offset)

        scope.object.lookAt(scope.target)

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

    // https://github.com/mrdoob/three.js/issues/20575
    this.connect = (domElement: HTMLElement): void => {
      if ((domElement as any) === document) {
        console.error(
          'THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.',
        )
      }
      scope.domElement = domElement
      // disables touch scroll
      // touch-action needs to be defined for pointer events to work on mobile
      // https://stackoverflow.com/a/48254578
      scope.domElement.style.touchAction = 'none'
      scope.domElement.addEventListener('contextmenu', onContextMenu)
      scope.domElement.addEventListener('pointerdown', onPointerDown)
      scope.domElement.addEventListener('pointercancel', onPointerCancel)
      scope.domElement.addEventListener('wheel', onMouseWheel)
    }

    this.dispose = (): void => {
      scope.domElement?.removeEventListener('contextmenu', onContextMenu)
      scope.domElement?.removeEventListener('pointerdown', onPointerDown)
      scope.domElement?.removeEventListener('pointercancel', onPointerCancel)
      scope.domElement?.removeEventListener('wheel', onMouseWheel)
      scope.domElement?.ownerDocument.removeEventListener('pointermove', onPointerMove)
      scope.domElement?.ownerDocument.removeEventListener('pointerup', onPointerUp)
      if (scope._domElementKeyEvents !== null) {
        scope._domElementKeyEvents.removeEventListener('keydown', onKeyDown)
      }
      //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
    }

    //
    // internals
    //

    const scope = this

    const changeEvent = { type: 'change' }
    const startEvent = { type: 'start' }
    const endEvent = { type: 'end' }

    const STATE = {
      NONE: -1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_PAN: 4,
      TOUCH_DOLLY_PAN: 5,
      TOUCH_DOLLY_ROTATE: 6,
    }

    let state = STATE.NONE

    const EPS = 0.000001

    // current position in spherical coordinates
    const spherical = new Spherical()
    const sphericalDelta = new Spherical()

    let scale = 1
    const panOffset = new Vector3()
    let zoomChanged = false

    const rotateStart = new Vector2()
    const rotateEnd = new Vector2()
    const rotateDelta = new Vector2()

    const panStart = new Vector2()
    const panEnd = new Vector2()
    const panDelta = new Vector2()

    const dollyStart = new Vector2()
    const dollyEnd = new Vector2()
    const dollyDelta = new Vector2()

    const pointers: PointerEvent[] = []
    const pointerPositions: { [key: string]: Vector2 } = {}

    function getAutoRotationAngle(): number {
      return ((2 * Math.PI) / 60 / 60) * scope.autoRotateSpeed
    }

    function getZoomScale(): number {
      return Math.pow(0.95, scope.zoomSpeed)
    }

    function rotateLeft(angle: number): void {
      if (scope.reverseOrbit) {
        sphericalDelta.theta += angle
      } else {
        sphericalDelta.theta -= angle
      }
    }

    function rotateUp(angle: number): void {
      if (scope.reverseOrbit) {
        sphericalDelta.phi += angle
      } else {
        sphericalDelta.phi -= angle
      }
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

        if (element && scope.object instanceof PerspectiveCamera && scope.object.isPerspectiveCamera) {
          // perspective
          const position = scope.object.position
          offset.copy(position).sub(scope.target)
          let targetDistance = offset.length()

          // half of the fov is center to top of screen
          targetDistance *= Math.tan(((scope.object.fov / 2) * Math.PI) / 180.0)

          // we use only clientHeight here so aspect ratio does not distort speed
          panLeft((2 * deltaX * targetDistance) / element.clientHeight, scope.object.matrix)
          panUp((2 * deltaY * targetDistance) / element.clientHeight, scope.object.matrix)
        } else if (element && scope.object instanceof OrthographicCamera && scope.object.isOrthographicCamera) {
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
          console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.')
          scope.enablePan = false
        }
      }
    })()

    function dollyOut(dollyScale: number) {
      if (scope.object instanceof PerspectiveCamera && scope.object.isPerspectiveCamera) {
        scale /= dollyScale
      } else if (scope.object instanceof OrthographicCamera && scope.object.isOrthographicCamera) {
        scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale))
        scope.object.updateProjectionMatrix()
        zoomChanged = true
      } else {
        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.')
        scope.enableZoom = false
      }
    }

    function dollyIn(dollyScale: number) {
      if (scope.object instanceof PerspectiveCamera && scope.object.isPerspectiveCamera) {
        scale *= dollyScale
      } else if (scope.object instanceof OrthographicCamera && scope.object.isOrthographicCamera) {
        scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale))
        scope.object.updateProjectionMatrix()
        zoomChanged = true
      } else {
        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.')
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

      if (element) {
        rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientHeight) // yes, height
        rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight)
      }
      rotateStart.copy(rotateEnd)
      scope.update()
    }

    function handleMouseMoveDolly(event: MouseEvent) {
      dollyEnd.set(event.clientX, event.clientY)
      dollyDelta.subVectors(dollyEnd, dollyStart)

      if (dollyDelta.y > 0) {
        dollyOut(getZoomScale())
      } else if (dollyDelta.y < 0) {
        dollyIn(getZoomScale())
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

    function handleMouseWheel(event: WheelEvent) {
      if (event.deltaY < 0) {
        dollyIn(getZoomScale())
      } else if (event.deltaY > 0) {
        dollyOut(getZoomScale())
      }

      scope.update()
    }

    function handleKeyDown(event: KeyboardEvent) {
      let needsUpdate = false

      switch (event.code) {
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

    function handleTouchStartRotate() {
      if (pointers.length == 1) {
        rotateStart.set(pointers[0].pageX, pointers[0].pageY)
      } else {
        const x = 0.5 * (pointers[0].pageX + pointers[1].pageX)
        const y = 0.5 * (pointers[0].pageY + pointers[1].pageY)

        rotateStart.set(x, y)
      }
    }

    function handleTouchStartPan() {
      if (pointers.length == 1) {
        panStart.set(pointers[0].pageX, pointers[0].pageY)
      } else {
        const x = 0.5 * (pointers[0].pageX + pointers[1].pageX)
        const y = 0.5 * (pointers[0].pageY + pointers[1].pageY)

        panStart.set(x, y)
      }
    }

    function handleTouchStartDolly() {
      const dx = pointers[0].pageX - pointers[1].pageX
      const dy = pointers[0].pageY - pointers[1].pageY
      const distance = Math.sqrt(dx * dx + dy * dy)

      dollyStart.set(0, distance)
    }

    function handleTouchStartDollyPan() {
      if (scope.enableZoom) handleTouchStartDolly()
      if (scope.enablePan) handleTouchStartPan()
    }

    function handleTouchStartDollyRotate() {
      if (scope.enableZoom) handleTouchStartDolly()
      if (scope.enableRotate) handleTouchStartRotate()
    }

    function handleTouchMoveRotate(event: PointerEvent) {
      if (pointers.length == 1) {
        rotateEnd.set(event.pageX, event.pageY)
      } else {
        const position = getSecondPointerPosition(event)
        const x = 0.5 * (event.pageX + position.x)
        const y = 0.5 * (event.pageY + position.y)
        rotateEnd.set(x, y)
      }

      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed)

      const element = scope.domElement

      if (element) {
        rotateLeft((2 * Math.PI * rotateDelta.x) / element.clientHeight) // yes, height
        rotateUp((2 * Math.PI * rotateDelta.y) / element.clientHeight)
      }
      rotateStart.copy(rotateEnd)
    }

    function handleTouchMovePan(event: PointerEvent) {
      if (pointers.length == 1) {
        panEnd.set(event.pageX, event.pageY)
      } else {
        const position = getSecondPointerPosition(event)
        const x = 0.5 * (event.pageX + position.x)
        const y = 0.5 * (event.pageY + position.y)
        panEnd.set(x, y)
      }

      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed)
      pan(panDelta.x, panDelta.y)
      panStart.copy(panEnd)
    }

    function handleTouchMoveDolly(event: PointerEvent) {
      const position = getSecondPointerPosition(event)
      const dx = event.pageX - position.x
      const dy = event.pageY - position.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      dollyEnd.set(0, distance)
      dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed))
      dollyOut(dollyDelta.y)
      dollyStart.copy(dollyEnd)
    }

    function handleTouchMoveDollyPan(event: PointerEvent) {
      if (scope.enableZoom) handleTouchMoveDolly(event)
      if (scope.enablePan) handleTouchMovePan(event)
    }

    function handleTouchMoveDollyRotate(event: PointerEvent) {
      if (scope.enableZoom) handleTouchMoveDolly(event)
      if (scope.enableRotate) handleTouchMoveRotate(event)
    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    function onPointerDown(event: PointerEvent) {
      if (scope.enabled === false) return

      if (pointers.length === 0) {
        scope.domElement?.ownerDocument.addEventListener('pointermove', onPointerMove)
        scope.domElement?.ownerDocument.addEventListener('pointerup', onPointerUp)
      }

      addPointer(event)

      if (event.pointerType === 'touch') {
        onTouchStart(event)
      } else {
        onMouseDown(event)
      }
    }

    function onPointerMove(event: PointerEvent) {
      if (scope.enabled === false) return

      if (event.pointerType === 'touch') {
        onTouchMove(event)
      } else {
        onMouseMove(event)
      }
    }

    function onPointerUp(event: PointerEvent) {
      removePointer(event)

      if (pointers.length === 0) {
        scope.domElement?.releasePointerCapture(event.pointerId)

        scope.domElement?.ownerDocument.removeEventListener('pointermove', onPointerMove)
        scope.domElement?.ownerDocument.removeEventListener('pointerup', onPointerUp)
      }

      scope.dispatchEvent(endEvent)

      state = STATE.NONE
    }

    function onPointerCancel(event: PointerEvent) {
      removePointer(event)
    }

    function onMouseDown(event: MouseEvent) {
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
        scope.dispatchEvent(startEvent)
      }
    }

    function onMouseMove(event: MouseEvent) {
      if (scope.enabled === false) return

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
      if (scope.enabled === false || scope.enablePan === false) return
      handleKeyDown(event)
    }

    function onTouchStart(event: PointerEvent) {
      trackPointer(event)

      switch (pointers.length) {
        case 1:
          switch (scope.touches.ONE) {
            case TOUCH.ROTATE:
              if (scope.enableRotate === false) return
              handleTouchStartRotate()
              state = STATE.TOUCH_ROTATE
              break

            case TOUCH.PAN:
              if (scope.enablePan === false) return
              handleTouchStartPan()
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
              handleTouchStartDollyPan()
              state = STATE.TOUCH_DOLLY_PAN
              break

            case TOUCH.DOLLY_ROTATE:
              if (scope.enableZoom === false && scope.enableRotate === false) return
              handleTouchStartDollyRotate()
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

    function onTouchMove(event: PointerEvent) {
      trackPointer(event)

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

    function onContextMenu(event: Event) {
      if (scope.enabled === false) return
      event.preventDefault()
    }

    function addPointer(event: PointerEvent) {
      pointers.push(event)
    }

    function removePointer(event: PointerEvent) {
      delete pointerPositions[event.pointerId]

      for (let i = 0; i < pointers.length; i++) {
        if (pointers[i].pointerId == event.pointerId) {
          pointers.splice(i, 1)
          return
        }
      }
    }

    function trackPointer(event: PointerEvent) {
      let position = pointerPositions[event.pointerId]

      if (position === undefined) {
        position = new Vector2()
        pointerPositions[event.pointerId] = position
      }

      position.set(event.pageX, event.pageY)
    }

    function getSecondPointerPosition(event: PointerEvent) {
      const pointer = event.pointerId === pointers[0].pointerId ? pointers[1] : pointers[0]
      return pointerPositions[pointer.pointerId]
    }

    // connect events
    if (domElement !== undefined) this.connect(domElement)
    // force an update at start
    this.update()
  }
}

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
// This is very similar to OrbitControls, another set of touch behavior
//
//    Orbit - right mouse, or left mouse + ctrl/meta/shiftKey / touch: two-finger rotate
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - left mouse, or arrow keys / touch: one-finger move

class MapControls extends OrbitControls {
  constructor(object: Camera, domElement?: HTMLElement) {
    super(object, domElement)

    this.screenSpacePanning = false // pan orthogonal to world-space direction camera.up

    this.mouseButtons.LEFT = MOUSE.PAN
    this.mouseButtons.RIGHT = MOUSE.ROTATE

    this.touches.ONE = TOUCH.PAN
    this.touches.TWO = TOUCH.DOLLY_ROTATE
  }
}

export { OrbitControls, MapControls }
