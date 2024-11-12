import { Euler, Camera, EventDispatcher, Vector3 } from 'three'

const _euler = new Euler(0, 0, 0, 'YXZ')
const _vector = new Vector3()
const _changeEvent = { type: 'change' }
const _lockEvent = { type: 'lock' }
const _unlockEvent = { type: 'unlock' }
const _PI_2 = Math.PI / 2

class PointerLockControls extends EventDispatcher {
  public camera: Camera
  public domElement?: HTMLElement
  public isLocked: boolean
  public minPolarAngle: number
  public maxPolarAngle: number
  public pointerSpeed: number

  constructor(camera: Camera, domElement?: HTMLElement) {
    super()

    this.camera = camera
    this.domElement = domElement
    this.isLocked = false

    // Set to constrain the pitch of the camera
    // Range is 0 to Math.PI radians
    this.minPolarAngle = 0 // radians
    this.maxPolarAngle = Math.PI // radians

    this.pointerSpeed = 1.0
    if (domElement) this.connect(domElement)
  }

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.domElement || this.isLocked === false) return
    _euler.setFromQuaternion(this.camera.quaternion)
    _euler.y -= event.movementX * 0.002 * this.pointerSpeed
    _euler.x -= event.movementY * 0.002 * this.pointerSpeed
    _euler.x = Math.max(_PI_2 - this.maxPolarAngle, Math.min(_PI_2 - this.minPolarAngle, _euler.x))
    this.camera.quaternion.setFromEuler(_euler)
    // @ts-ignore
    this.dispatchEvent(_changeEvent)
  }

  private onPointerlockChange = (): void => {
    if (!this.domElement) return
    if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
      // @ts-ignore
      this.dispatchEvent(_lockEvent)
      this.isLocked = true
    } else {
      // @ts-ignore
      this.dispatchEvent(_unlockEvent)
      this.isLocked = false
    }
  }

  private onPointerlockError = (): void => {
    console.error('THREE.PointerLockControls: Unable to use Pointer Lock API')
  }

  public connect = (domElement: HTMLElement): void => {
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

  public getObject = (): Camera => {
    // retaining this method for backward compatibility
    return this.camera
  }

  private direction = new Vector3(0, 0, -1)
  public getDirection = (v: Vector3): Vector3 => {
    return v.copy(this.direction).applyQuaternion(this.camera.quaternion)
  }

  public moveForward = (distance: number): void => {
    // move forward parallel to the xz-plane
    // assumes camera.up is y-up
    _vector.setFromMatrixColumn(this.camera.matrix, 0)
    _vector.crossVectors(this.camera.up, _vector)
    this.camera.position.addScaledVector(_vector, distance)
  }

  public moveRight = (distance: number): void => {
    _vector.setFromMatrixColumn(this.camera.matrix, 0)
    this.camera.position.addScaledVector(_vector, distance)
  }

  public lock = (): void => {
    if (this.domElement) this.domElement.requestPointerLock()
  }

  public unlock = (): void => {
    if (this.domElement) this.domElement.ownerDocument.exitPointerLock()
  }
}

export { PointerLockControls }
