import { MathUtils, Spherical, Vector3, EventDispatcher, Camera } from 'three'

const targetPosition = new Vector3()

export class FirstPersonControls extends EventDispatcher {
  public object: Camera
  public domElement?: HTMLElement | null

  public enabled = true

  public movementSpeed = 1.0
  public lookSpeed = 0.005

  public lookVertical = true
  public autoForward = false

  public activeLook = true

  public heightSpeed = false
  public heightCoef = 1.0
  public heightMin = 0.0
  public heightMax = 1.0

  public constrainVertical = false
  public verticalMin = 0
  public verticalMax = Math.PI

  public mouseDragOn = false

  // internals

  private autoSpeedFactor = 0.0

  private mouseX = 0
  private mouseY = 0

  private moveForward = false
  private moveBackward = false
  private moveLeft = false
  private moveRight = false
  private moveUp = false
  private moveDown = false

  private viewHalfX = 0
  private viewHalfY = 0

  private lat = 0
  private lon = 0

  private lookDirection = new Vector3()
  private spherical = new Spherical()
  readonly target = new Vector3()

  constructor(object: Camera, domElement?: HTMLElement | null) {
    super()

    this.object = object
    this.domElement = domElement

    this.setOrientation()

    if (domElement) this.connect(domElement)
  }

  public connect = (domElement: HTMLElement): void => {
    domElement.setAttribute('tabindex', '-1')

    domElement.style.touchAction = 'none'

    domElement.addEventListener('contextmenu', this.contextmenu)
    domElement.addEventListener('mousemove', this.onMouseMove)
    domElement.addEventListener('mousedown', this.onMouseDown)
    domElement.addEventListener('mouseup', this.onMouseUp)

    this.domElement = domElement

    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)

    this.handleResize()
  }

  public dispose = (): void => {
    this.domElement?.removeEventListener('contextmenu', this.contextmenu)
    this.domElement?.removeEventListener('mousedown', this.onMouseDown)
    this.domElement?.removeEventListener('mousemove', this.onMouseMove)
    this.domElement?.removeEventListener('mouseup', this.onMouseUp)

    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }

  public handleResize = (): void => {
    if (this.domElement) {
      this.viewHalfX = this.domElement.offsetWidth / 2
      this.viewHalfY = this.domElement.offsetHeight / 2
    }
  }

  private onMouseDown = (event: MouseEvent): void => {
    this.domElement?.focus()

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

  private onMouseUp = (event: MouseEvent): void => {
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

  private onMouseMove = (event: MouseEvent): void => {
    if (this.domElement) {
      this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX
      this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY
    }
  }

  private onKeyDown = (event: KeyboardEvent): void => {
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

  private onKeyUp = (event: KeyboardEvent): void => {
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

  public lookAt = (x: Vector3 | number, y?: number, z?: number): this => {
    if (x instanceof Vector3) {
      this.target.copy(x)
    } else if (y && z) {
      this.target.set(x, y, z)
    }

    this.object.lookAt(this.target)

    this.setOrientation()

    return this
  }

  public update = (delta: number): void => {
    if (!this.enabled) return

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

  private contextmenu = (event: Event): void => event.preventDefault()

  private setOrientation = (): void => {
    this.lookDirection.set(0, 0, -1).applyQuaternion(this.object.quaternion)
    this.spherical.setFromVector3(this.lookDirection)
    this.lat = 90 - MathUtils.radToDeg(this.spherical.phi)
    this.lon = MathUtils.radToDeg(this.spherical.theta)
  }
}
