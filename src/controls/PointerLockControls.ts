import { Camera, Euler, EventDispatcher, Vector3 } from 'three'

class PointerLockControls extends EventDispatcher {
  private camera: Camera
  domElement: HTMLElement

  isLocked = false

  // Set to constrain the pitch of the camera
  // Range is 0 to Math.PI radians
  minPolarAngle = 0 // radians
  maxPolarAngle = Math.PI // radians

  private changeEvent = { type: 'change' }
  private lockEvent = { type: 'lock' }
  private unlockEvent = { type: 'unlock' }

  private euler = new Euler(0, 0, 0, 'YXZ')

  private PI_2 = Math.PI / 2

  private vec = new Vector3()

  constructor(camera: Camera, domElement: HTMLElement) {
    super()

    if (domElement === undefined) {
      console.warn('THREE.PointerLockControls: The second parameter "domElement" is now mandatory.')
      domElement = document.body
    }

    this.domElement = domElement
    this.camera = camera

    this.connect()
  }

  private onMouseMove = (event: MouseEvent) => {
    if (this.isLocked === false) return

    const movementX = event.movementX || (event as any).mozMovementX || (event as any).webkitMovementX || 0
    const movementY = event.movementY || (event as any).mozMovementY || (event as any).webkitMovementY || 0

    this.euler.setFromQuaternion(this.camera.quaternion)

    this.euler.y -= movementX * 0.002
    this.euler.x -= movementY * 0.002

    this.euler.x = Math.max(this.PI_2 - this.maxPolarAngle, Math.min(this.PI_2 - this.minPolarAngle, this.euler.x))

    this.camera.quaternion.setFromEuler(this.euler)

    this.dispatchEvent(this.changeEvent)
  }

  private onPointerlockChange = () => {
    if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
      this.dispatchEvent(this.lockEvent)

      this.isLocked = true
    } else {
      this.dispatchEvent(this.unlockEvent)

      this.isLocked = false
    }
  }

  private onPointerlockError = () => {
    console.error('THREE.PointerLockControls: Unable to use Pointer Lock API')
  }

  connect = () => {
    this.domElement.ownerDocument.addEventListener('mousemove', this.onMouseMove)
    this.domElement.ownerDocument.addEventListener('pointerlockchange', this.onPointerlockChange)
    this.domElement.ownerDocument.addEventListener('pointerlockerror', this.onPointerlockError)
  }

  disconnect = () => {
    this.domElement.ownerDocument.removeEventListener('mousemove', this.onMouseMove)
    this.domElement.ownerDocument.removeEventListener('pointerlockchange', this.onPointerlockChange)
    this.domElement.ownerDocument.removeEventListener('pointerlockerror', this.onPointerlockError)
  }

  dispose = () => {
    this.disconnect()
  }

  private getObject = () =>
    // retaining this method for backward compatibility
    this.camera

  private direction = new Vector3(0, 0, -1)
  getDirection = (v: Vector3) => v.copy(this.direction).applyQuaternion(this.camera.quaternion)

  moveForward = (distance: number) => {
    // move forward parallel to the xz-plane
    // assumes this.camera.up is y-up

    this.vec.setFromMatrixColumn(this.camera.matrix, 0)

    this.vec.crossVectors(this.camera.up, this.vec)

    this.camera.position.addScaledVector(this.vec, distance)
  }

  moveRight = (distance: number) => {
    this.vec.setFromMatrixColumn(this.camera.matrix, 0)

    this.camera.position.addScaledVector(this.vec, distance)
  }

  lock = () => {
    this.domElement.requestPointerLock()
  }

  unlock = () => {
    this.domElement.ownerDocument.exitPointerLock()
  }
}

export { PointerLockControls }
