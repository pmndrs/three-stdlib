import { MathUtils, Spherical, Vector3, EventDispatcher, Camera } from 'three'

class FirstPersonControls extends EventDispatcher {
  object: Camera
  domElement: HTMLElement | Document

  enabled = true

  movementSpeed = 1.0
  lookSpeed = 0.005

  lookVertical = true
  autoForward = false

  activeLook = true

  heightSpeed = false
  heightCoef = 1.0
  heightMin = 0.0
  heightMax = 1.0

  constrainVertical = false
  verticalMin = 0
  verticalMax = Math.PI

  mouseDragOn = false

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
  private target = new Vector3()

  constructor(object: Camera, domElement: HTMLElement | Document) {
    super()

    if (domElement === undefined) {
      console.warn('THREE.FirstPersonControls: The second parameter "domElement" is now mandatory.')
      domElement = document
    }

    this.object = object
    this.domElement = domElement

    if (this.domElement instanceof HTMLElement) {
      this.domElement.setAttribute('tabindex', '-1')
    }

    this.handleResize()

    this.setOrientation(this)

    this.domElement.addEventListener('contextmenu', this.contextmenu)
    ;(this.domElement as HTMLElement).addEventListener('mousemove', this.onMouseMove)
    ;(this.domElement as HTMLElement).addEventListener('mousedown', this.onMouseDown)
    ;(this.domElement as HTMLElement).addEventListener('mouseup', this.onMouseUp)

    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
  }

  dispose = (): void => {
    this.domElement.removeEventListener('contextmenu', this.contextmenu)
    ;(this.domElement as HTMLElement).removeEventListener('mousedown', this.onMouseDown)
    ;(this.domElement as HTMLElement).removeEventListener('mousemove', this.onMouseMove)
    ;(this.domElement as HTMLElement).removeEventListener('mouseup', this.onMouseUp)

    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }

  handleResize = (): void => {
    if (this.domElement instanceof Document) {
      this.viewHalfX = window.innerWidth / 2
      this.viewHalfY = window.innerHeight / 2
    } else {
      this.viewHalfX = this.domElement.offsetWidth / 2
      this.viewHalfY = this.domElement.offsetHeight / 2
    }
  }

  private onMouseDown = (event: MouseEvent): void => {
    if (this.domElement instanceof HTMLElement) {
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

  private onMouseUp = (event: MouseEvent): void => {
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

  private onMouseMove = (event: MouseEvent): void => {
    if (this.domElement instanceof Document) {
      this.mouseX = event.pageX - this.viewHalfX
      this.mouseY = event.pageY - this.viewHalfY
    } else {
      this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX
      this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY
    }
  }

  private onKeyDown = (event: KeyboardEvent): void => {
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

  lookAt = (x: Vector3 | number, y?: number, z?: number): this => {
    if (x instanceof Vector3) {
      this.target.copy(x)
    } else if (y && z) {
      this.target.set(x, y, z)
    }

    this.object.lookAt(this.target)

    this.setOrientation(this)

    return this
  }

  private targetPosition = new Vector3()

  update = (delta: number): void => {
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

    this.targetPosition.setFromSphericalCoords(1, phi, theta).add(position)

    this.object.lookAt(this.targetPosition)
  }

  private contextmenu = (event: Event): void => event.preventDefault()

  private setOrientation = (controls: FirstPersonControls): void => {
    const quaternion = controls.object.quaternion

    this.lookDirection.set(0, 0, -1).applyQuaternion(quaternion)
    this.spherical.setFromVector3(this.lookDirection)
    this.lat = 90 - MathUtils.radToDeg(this.spherical.phi)
    this.lon = MathUtils.radToDeg(this.spherical.theta)
  }
}

export { FirstPersonControls }
