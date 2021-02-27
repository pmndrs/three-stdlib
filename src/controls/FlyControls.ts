import { Camera, EventDispatcher, Quaternion, Vector3 } from 'three'

function contextmenu(event: Event) {
  event.preventDefault()
}

class FlyControls extends EventDispatcher {
  object: Camera
  domElement: HTMLElement | Document

  movementSpeed = 1.0
  rollSpeed = 0.005

  dragToLook = false
  autoForward = false

  scope = this
  changeEvent = { type: 'change' }
  EPS = 0.000001

  tmpQuaternion = new Quaternion()

  mouseStatus = 0

  movementSpeedMultiplier = 1

  moveState = {
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
  moveVector = new Vector3(0, 0, 0)
  rotationVector = new Vector3(0, 0, 0)

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

    // API

    // disable default target object behavior

    // internals

    this.domElement.addEventListener('contextmenu', contextmenu)

    this.domElement.addEventListener('mousemove', this.mousemove as any)
    this.domElement.addEventListener('mousedown', this.mousedown as any)
    this.domElement.addEventListener('mouseup', this.mouseup as any)

    window.addEventListener('keydown', this.keydown)
    window.addEventListener('keyup', this.keyup)

    this.updateMovementVector()
    this.updateRotationVector()
  }

  keydown = (event: KeyboardEvent) => {
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

  keyup = (event: KeyboardEvent) => {
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

  mousedown = (event: MouseEvent) => {
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

  mousemove = (event: MouseEvent) => {
    if (!this.dragToLook || this.mouseStatus > 0) {
      const container = this.getContainerDimensions()
      const halfWidth = container.size[0] / 2
      const halfHeight = container.size[1] / 2

      this.moveState.yawLeft = -(event.pageX - container.offset[0] - halfWidth) / halfWidth
      this.moveState.pitchDown = (event.pageY - container.offset[1] - halfHeight) / halfHeight

      this.updateRotationVector()
    }
  }

  mouseup = (event: MouseEvent) => {
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

  update = (() => {
    const lastQuaternion = new Quaternion()
    const lastPosition = new Vector3()
    const scope = this

    return (delta: number) => {
      const moveMult = delta * scope.movementSpeed
      const rotMult = delta * scope.rollSpeed

      scope.object.translateX(scope.moveVector.x * moveMult)
      scope.object.translateY(scope.moveVector.y * moveMult)
      scope.object.translateZ(scope.moveVector.z * moveMult)

      scope.tmpQuaternion
        .set(scope.rotationVector.x * rotMult, scope.rotationVector.y * rotMult, scope.rotationVector.z * rotMult, 1)
        .normalize()
      scope.object.quaternion.multiply(scope.tmpQuaternion)

      if (
        lastPosition.distanceToSquared(scope.object.position) > this.EPS ||
        8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > this.EPS
      ) {
        scope.dispatchEvent(this.changeEvent)
        lastQuaternion.copy(scope.object.quaternion)
        lastPosition.copy(scope.object.position)
      }
    }
  })()

  updateMovementVector = () => {
    const forward = this.moveState.forward || (this.autoForward && !this.moveState.back) ? 1 : 0

    this.moveVector.x = -this.moveState.left + this.moveState.right
    this.moveVector.y = -this.moveState.down + this.moveState.up
    this.moveVector.z = -forward + this.moveState.back

    //console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );
  }

  updateRotationVector = () => {
    this.rotationVector.x = -this.moveState.pitchDown + this.moveState.pitchUp
    this.rotationVector.y = -this.moveState.yawRight + this.moveState.yawLeft
    this.rotationVector.z = -this.moveState.rollRight + this.moveState.rollLeft

    //console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );
  }

  getContainerDimensions = () => {
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

  dispose = () => {
    this.domElement.removeEventListener('contextmenu', contextmenu)
    this.domElement.removeEventListener('mousemove', this.mousemove as any)
    this.domElement.removeEventListener('mousedown', this.mousedown as any)
    this.domElement.removeEventListener('mouseup', this.mouseup as any)

    window.removeEventListener('keydown', this.keydown)
    window.removeEventListener('keyup', this.keyup)
  }
}

export { FlyControls }
