import { Camera, Euler, EventDispatcher, Vector3 } from 'three'

class PointerLockControls extends EventDispatcher {
  private camera: Camera
  public domElement?: HTMLElement

  public isLocked = false

  // Set to constrain the pitch of the camera
  // Range is 0 to Math.PI radians
  public minPolarAngle = 0 // radians
  public maxPolarAngle = Math.PI // radians

  private changeEvent = { type: 'change' }
  private lockEvent = { type: 'lock' }
  private unlockEvent = { type: 'unlock' }

  private euler = new Euler(0, 0, 0, 'YXZ')
  private PI_2 = Math.PI / 2
  private vec = new Vector3()

  constructor(camera: Camera, domElement?: HTMLElement) {
    super()
    this.domElement = domElement
    this.camera = camera
    if (this.domElement) this.connect(this.domElement)
  }

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.domElement || this.isLocked === false) return

    const movementX = event.movementX || (event as any).mozMovementX || (event as any).webkitMovementX || 0
    const movementY = event.movementY || (event as any).mozMovementY || (event as any).webkitMovementY || 0

    this.euler.setFromQuaternion(this.camera.quaternion)
    this.euler.y -= movementX * 0.002
    this.euler.x -= movementY * 0.002
    this.euler.x = Math.max(this.PI_2 - this.maxPolarAngle, Math.min(this.PI_2 - this.minPolarAngle, this.euler.x))
    this.camera.quaternion.setFromEuler(this.euler)
    this.dispatchEvent(this.changeEvent)
  }

  private onPointerlockChange = (): void => {
    if (!this.domElement) return
    if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
      this.dispatchEvent(this.lockEvent)
      this.isLocked = true
    } else {
      this.dispatchEvent(this.unlockEvent)
      this.isLocked = false
    }
  }

  private onPointerlockError = (): void => {
    console.error('THREE.PointerLockControls: Unable to use Pointer Lock API')
  }

  public connect = (domElement?: HTMLElement): void => {
    this.domElement = domElement || this.domElement
    if (!this.domElement) return
    this.domElement.ownerDocument.addEventListener('mousemove', this.onMouseMove)
    this.domElement.ownerDocument.addEventListener('pointerlockchange', this.onPointerlockChange)
    this.domElement.ownerDocument.addEventListener('pointerlockerror', this.onPointerlockError)
  }

  public disconnect = (): void => {
    if (!this.domElement) return
    this.domElement.ownerDocument.removeEventListener('mousemove', this.onMouseMove)
    this.domElement.ownerDocument.removeEventListener('pointerlockchange', this.onPointerlockChange)
    this.domElement.ownerDocument.removeEventListener('pointerlockerror', this.onPointerlockError)
  }

  public dispose = (): void => {
    this.disconnect()
  }

  private getObject = (): Camera =>
    // retaining this method for backward compatibility
    this.camera

  private direction = new Vector3(0, 0, -1)
  public getDirection = (v: Vector3): Vector3 => v.copy(this.direction).applyQuaternion(this.camera.quaternion)

  public moveForward = (distance: number): void => {
    // move forward parallel to the xz-plane
    // assumes this.camera.up is y-up
    this.vec.setFromMatrixColumn(this.camera.matrix, 0)
    this.vec.crossVectors(this.camera.up, this.vec)
    this.camera.position.addScaledVector(this.vec, distance)
  }

  public moveRight = (distance: number): void => {
    this.vec.setFromMatrixColumn(this.camera.matrix, 0)
    this.camera.position.addScaledVector(this.vec, distance)
  }

  public lock = (): void => {
    if (!this.domElement) return
    this.domElement.requestPointerLock()
  }

  public unlock = (): void => {
    if (!this.domElement) return
    this.domElement.ownerDocument.exitPointerLock()
  }
}

export { PointerLockControls }
