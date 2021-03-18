import { Camera, EventDispatcher, Quaternion, Vector3 } from 'three'

function contextmenu(event: Event): void {
  event.preventDefault()
}

class FlyControls extends EventDispatcher {
  object: Camera
  domElement: HTMLElement | Document

  movementSpeed = 1.0
  rollSpeed = 0.005

  dragToLook = false
  autoForward = false

  private changeEvent = { type: 'change' }
  private EPS = 0.000001

  private tmpQuaternion = new Quaternion()

  private mouseStatus = 0

  private movementSpeedMultiplier = 1

  private moveState = {
    up: 0,
    down: 0,
    left: 0,
    right: 0,
    forward: 0,
    back: 0,
    pitchUp: 0,
    pitchDown: 0,
    yawLeft: 0,
    yawRight: 0,
    rollLeft: 0,
    rollRight: 0,
  }
  private moveVector = new Vector3(0, 0, 0)
  private rotationVector = new Vector3(0, 0, 0)

  constructor(object: Camera, domElement: HTMLElement | Document) {
    super()

    if (domElement === undefined) {
      console.warn('THREE.FlyControls: The second parameter "domElement" is now mandatory.')
      domElement = document
    }

    this.object = object
    this.domElement = domElement

    if (domElement && !(domElement instanceof Document)) {
      domElement.setAttribute('tabindex', -1 as any)
    }

    this.domElement.addEventListener('contextmenu', contextmenu)
    ;(this.domElement as HTMLElement).addEventListener('mousemove', this.mousemove)
    ;(this.domElement as HTMLElement).addEventListener('mousedown', this.mousedown)
    ;(this.domElement as HTMLElement).addEventListener('mouseup', this.mouseup)

    window.addEventListener('keydown', this.keydown)
    window.addEventListener('keyup', this.keyup)

    this.updateMovementVector()
    this.updateRotationVector()
  }

  private keydown = (event: KeyboardEvent): void => {
    if (event.altKey) {
      return
    }

    //event.preventDefault();

    switch (event.code) {
      case 'ShiftLeft':
      case 'ShiftRight':
        this.movementSpeedMultiplier = 0.1
        break

      case 'KeyW':
        this.moveState.forward = 1
        break
      case 'KeyS':
        this.moveState.back = 1
        break

      case 'KeyA':
        this.moveState.left = 1
        break
      case 'KeyD':
        this.moveState.right = 1
        break

      case 'KeyR':
        this.moveState.up = 1
        break
      case 'KeyF':
        this.moveState.down = 1
        break

      case 'ArrowUp':
        this.moveState.pitchUp = 1
        break
      case 'ArrowDown':
        this.moveState.pitchDown = 1
        break

      case 'ArrowLeft':
        this.moveState.yawLeft = 1
        break
      case 'ArrowRight':
        this.moveState.yawRight = 1
        break

      case 'KeyQ':
        this.moveState.rollLeft = 1
        break
      case 'KeyE':
        this.moveState.rollRight = 1
        break
    }

    this.updateMovementVector()
    this.updateRotationVector()
  }

  private keyup = (event: KeyboardEvent): void => {
    switch (event.code) {
      case 'ShiftLeft':
      case 'ShiftRight':
        this.movementSpeedMultiplier = 1
        break

      case 'KeyW':
        this.moveState.forward = 0
        break
      case 'KeyS':
        this.moveState.back = 0
        break

      case 'KeyA':
        this.moveState.left = 0
        break
      case 'KeyD':
        this.moveState.right = 0
        break

      case 'KeyR':
        this.moveState.up = 0
        break
      case 'KeyF':
        this.moveState.down = 0
        break

      case 'ArrowUp':
        this.moveState.pitchUp = 0
        break
      case 'ArrowDown':
        this.moveState.pitchDown = 0
        break

      case 'ArrowLeft':
        this.moveState.yawLeft = 0
        break
      case 'ArrowRight':
        this.moveState.yawRight = 0
        break

      case 'KeyQ':
        this.moveState.rollLeft = 0
        break
      case 'KeyE':
        this.moveState.rollRight = 0
        break
    }

    this.updateMovementVector()
    this.updateRotationVector()
  }

  private mousedown = (event: MouseEvent): void => {
    if (this.domElement !== document && !(this.domElement instanceof Document)) {
      this.domElement.focus()
    }

    event.preventDefault()

    if (this.dragToLook) {
      this.mouseStatus++
    } else {
      switch (event.button) {
        case 0:
          this.moveState.forward = 1
          break
        case 2:
          this.moveState.back = 1
          break
      }

      this.updateMovementVector()
    }
  }

  private mousemove = (event: MouseEvent): void => {
    if (!this.dragToLook || this.mouseStatus > 0) {
      const container = this.getContainerDimensions()
      const halfWidth = container.size[0] / 2
      const halfHeight = container.size[1] / 2

      this.moveState.yawLeft = -(event.pageX - container.offset[0] - halfWidth) / halfWidth
      this.moveState.pitchDown = (event.pageY - container.offset[1] - halfHeight) / halfHeight

      this.updateRotationVector()
    }
  }

  private mouseup = (event: MouseEvent): void => {
    event.preventDefault()

    if (this.dragToLook) {
      this.mouseStatus--

      this.moveState.yawLeft = this.moveState.pitchDown = 0
    } else {
      switch (event.button) {
        case 0:
          this.moveState.forward = 0
          break
        case 2:
          this.moveState.back = 0
          break
      }

      this.updateMovementVector()
    }

    this.updateRotationVector()
  }

  private lastQuaternion = new Quaternion()
  private lastPosition = new Vector3()

  public update = (delta: number): void => {
    const moveMult = delta * this.movementSpeed
    const rotMult = delta * this.rollSpeed

    this.object.translateX(this.moveVector.x * moveMult)
    this.object.translateY(this.moveVector.y * moveMult)
    this.object.translateZ(this.moveVector.z * moveMult)

    this.tmpQuaternion
      .set(this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1)
      .normalize()
    this.object.quaternion.multiply(this.tmpQuaternion)

    if (
      this.lastPosition.distanceToSquared(this.object.position) > this.EPS ||
      8 * (1 - this.lastQuaternion.dot(this.object.quaternion)) > this.EPS
    ) {
      this.dispatchEvent(this.changeEvent)
      this.lastQuaternion.copy(this.object.quaternion)
      this.lastPosition.copy(this.object.position)
    }
  }

  private updateMovementVector = (): void => {
    const forward = this.moveState.forward || (this.autoForward && !this.moveState.back) ? 1 : 0

    this.moveVector.x = -this.moveState.left + this.moveState.right
    this.moveVector.y = -this.moveState.down + this.moveState.up
    this.moveVector.z = -forward + this.moveState.back
  }

  private updateRotationVector = (): void => {
    this.rotationVector.x = -this.moveState.pitchDown + this.moveState.pitchUp
    this.rotationVector.y = -this.moveState.yawRight + this.moveState.yawLeft
    this.rotationVector.z = -this.moveState.rollRight + this.moveState.rollLeft
  }

  private getContainerDimensions = (): {
    size: number[]
    offset: number[]
  } => {
    if (this.domElement != document && !(this.domElement instanceof Document)) {
      return {
        size: [this.domElement.offsetWidth, this.domElement.offsetHeight],
        offset: [this.domElement.offsetLeft, this.domElement.offsetTop],
      }
    } else {
      return {
        size: [window.innerWidth, window.innerHeight],
        offset: [0, 0],
      }
    }
  }

  public dispose = (): void => {
    this.domElement.removeEventListener('contextmenu', contextmenu)
    ;(this.domElement as HTMLElement).removeEventListener('mousemove', this.mousemove)
    ;(this.domElement as HTMLElement).removeEventListener('mousedown', this.mousedown)
    ;(this.domElement as HTMLElement).removeEventListener('mouseup', this.mouseup)

    window.removeEventListener('keydown', this.keydown)
    window.removeEventListener('keyup', this.keyup)
  }
}

export { FlyControls }
