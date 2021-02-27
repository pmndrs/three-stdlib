import { MathUtils, Spherical, Vector3, EventDispatcher, Camera } from 'three'

class FirstPersonControls extends EventDispatcher {
  object: Camera
  domElement: HTMLElement

  enabled: boolean

  movementSpeed: number
  lookSpeed: number

  lookVertical: boolean
  autoForward: boolean

  activeLook: boolean

  heightSpeed: boolean
  heightCoef: number
  heightMin: number
  heightMax: number

  constrainVertical: boolean
  verticalMin: number
  verticalMax: number
  mouseDragOn: boolean
  autoSpeedFactor: number
  mouseX: number
  mouseY: number
  moveForward: boolean
  moveBackward: boolean
  moveLeft: boolean
  moveRight: boolean
  moveUp: boolean
  moveDown: boolean
  viewHalfX: number
  viewHalfY: number

  private lat: number
  private lon: number

  private lookDirection: Vector3
  private spherical: Spherical
  private target: Vector3

  dispose: () => void

  constructor(object: Camera, domElement: HTMLElement) {
    super()

    if (domElement === undefined) {
      console.warn('THREE.FirstPersonControls: The second parameter "domElement" is now mandatory.')
      domElement = document as any
    }

    this.object = object
    this.domElement = domElement

    // API

    this.enabled = true

    this.movementSpeed = 1.0
    this.lookSpeed = 0.005

    this.lookVertical = true
    this.autoForward = false

    this.activeLook = true

    this.heightSpeed = false
    this.heightCoef = 1.0
    this.heightMin = 0.0
    this.heightMax = 1.0

    this.constrainVertical = false
    this.verticalMin = 0
    this.verticalMax = Math.PI

    this.mouseDragOn = false

    // internals

    this.autoSpeedFactor = 0.0

    this.mouseX = 0
    this.mouseY = 0

    this.moveForward = false
    this.moveBackward = false
    this.moveLeft = false
    this.moveRight = false
    this.moveUp = false
    this.moveDown = false

    this.viewHalfX = 0
    this.viewHalfY = 0

    // private variables

    this.lat = 0
    this.lon = 0

    this.lookDirection = new Vector3()
    this.spherical = new Spherical()
    this.target = new Vector3()

    //

    if (this.domElement !== (document as any)) {
      this.domElement.setAttribute('tabindex', '-1')
    }

    this.dispose = function () {
      this.domElement.removeEventListener('contextmenu', this.contextmenu)
      this.domElement.removeEventListener('mousedown', _onMouseDown)
      this.domElement.removeEventListener('mousemove', _onMouseMove)
      this.domElement.removeEventListener('mouseup', _onMouseUp)

      window.removeEventListener('keydown', _onKeyDown)
      window.removeEventListener('keyup', _onKeyUp)
    }

    var _onMouseMove = bind(this, this.onMouseMove)
    var _onMouseDown = bind(this, this.onMouseDown)
    var _onMouseUp = bind(this, this.onMouseUp)
    var _onKeyDown = bind(this, this.onKeyDown)
    var _onKeyUp = bind(this, this.onKeyUp)

    this.domElement.addEventListener('contextmenu', this.contextmenu)
    this.domElement.addEventListener('mousemove', _onMouseMove)
    this.domElement.addEventListener('mousedown', _onMouseDown)
    this.domElement.addEventListener('mouseup', _onMouseUp)

    window.addEventListener('keydown', _onKeyDown)
    window.addEventListener('keyup', _onKeyUp)

    function bind(scope: FirstPersonControls, fn: Function) {
      return function () {
        fn.apply(scope, arguments)
      }
    }

    this.handleResize()

    this.setOrientation(this)
  }

  handleResize = () => {
    if (this.domElement === (document as any)) {
      this.viewHalfX = window.innerWidth / 2
      this.viewHalfY = window.innerHeight / 2
    } else {
      this.viewHalfX = this.domElement.offsetWidth / 2
      this.viewHalfY = this.domElement.offsetHeight / 2
    }
  }

  onMouseDown = (event: MouseEvent) => {
    if ((this.domElement as any) !== document) {
      this.domElement.focus()
    }

    event.preventDefault()

    if (this.activeLook) {
      switch (event.button) {
        case 0:
          this.moveForward = true
          break
        case 2:
          this.moveBackward = true
          break
      }
    }

    this.mouseDragOn = true
  }

  onMouseUp = (event: MouseEvent) => {
    event.preventDefault()

    if (this.activeLook) {
      switch (event.button) {
        case 0:
          this.moveForward = false
          break
        case 2:
          this.moveBackward = false
          break
      }
    }

    this.mouseDragOn = false
  }

  onMouseMove = (event: MouseEvent) => {
    if ((this.domElement as any) === document) {
      this.mouseX = event.pageX - this.viewHalfX
      this.mouseY = event.pageY - this.viewHalfY
    } else {
      this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX
      this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY
    }
  }

  onKeyDown = (event: KeyboardEvent) => {
    //event.preventDefault();

    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = true
        break

      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = true
        break

      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = true
        break

      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = true
        break

      case 'KeyR':
        this.moveUp = true
        break
      case 'KeyF':
        this.moveDown = true
        break
    }
  }

  onKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = false
        break

      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = false
        break

      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = false
        break

      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = false
        break

      case 'KeyR':
        this.moveUp = false
        break
      case 'KeyF':
        this.moveDown = false
        break
    }
  }

  lookAt = (x: Vector3 | number, y?: number, z?: number) => {
    if (x instanceof Vector3) {
      x.isVector3
      this.target.copy(x)
    } else if (y && z) {
      this.target.set(x, y, z)
    }

    this.object.lookAt(this.target)

    this.setOrientation(this)

    return this
  }

  update = (() => {
    const targetPosition = new Vector3()

    return (delta: number) => {
      if (this.enabled === false) return

      if (this.heightSpeed) {
        const y = MathUtils.clamp(this.object.position.y, this.heightMin, this.heightMax)
        const heightDelta = y - this.heightMin

        this.autoSpeedFactor = delta * (heightDelta * this.heightCoef)
      } else {
        this.autoSpeedFactor = 0.0
      }

      const actualMoveSpeed = delta * this.movementSpeed

      if (this.moveForward || (this.autoForward && !this.moveBackward)) {
        this.object.translateZ(-(actualMoveSpeed + this.autoSpeedFactor))
      }
      if (this.moveBackward) this.object.translateZ(actualMoveSpeed)

      if (this.moveLeft) this.object.translateX(-actualMoveSpeed)
      if (this.moveRight) this.object.translateX(actualMoveSpeed)

      if (this.moveUp) this.object.translateY(actualMoveSpeed)
      if (this.moveDown) this.object.translateY(-actualMoveSpeed)

      let actualLookSpeed = delta * this.lookSpeed

      if (!this.activeLook) {
        actualLookSpeed = 0
      }

      let verticalLookRatio = 1

      if (this.constrainVertical) {
        verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin)
      }

      this.lon -= this.mouseX * actualLookSpeed
      if (this.lookVertical) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio

      this.lat = Math.max(-85, Math.min(85, this.lat))

      let phi = MathUtils.degToRad(90 - this.lat)
      const theta = MathUtils.degToRad(this.lon)

      if (this.constrainVertical) {
        phi = MathUtils.mapLinear(phi, 0, Math.PI, this.verticalMin, this.verticalMax)
      }

      const position = this.object.position

      targetPosition.setFromSphericalCoords(1, phi, theta).add(position)

      this.object.lookAt(targetPosition)
    }
  })()

  contextmenu = (event: Event) => event.preventDefault()

  setOrientation = (controls: FirstPersonControls) => {
    const quaternion = controls.object.quaternion

    this.lookDirection.set(0, 0, -1).applyQuaternion(quaternion)
    this.spherical.setFromVector3(this.lookDirection)
    this.lat = 90 - MathUtils.radToDeg(this.spherical.phi)
    this.lon = MathUtils.radToDeg(this.spherical.theta)
  }
}

export { FirstPersonControls }
