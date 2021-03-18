import { Camera, Euler, EventDispatcher, MathUtils, Quaternion, Vector3 } from 'three'

/**
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

class DeviceOrientationControls extends EventDispatcher {
  object: Camera

  private changeEvent = { type: 'change' }
  private EPS = 0.000001

  enabled = true
  deviceOrientation: Partial<DeviceOrientationEvent> = { alpha: 0, beta: 0, gamma: 0 }
  screenOrientation: string | number = 0
  alphaOffset = 0 // radians

  constructor(object: Camera) {
    super()

    this.object = object
    this.object.rotation.reorder('YXZ')

    this.connect()
  }

  private onDeviceOrientationChangeEvent = (event: DeviceOrientationEvent): void => {
    this.deviceOrientation = event
  }

  private onScreenOrientationChangeEvent = (): void => {
    this.screenOrientation = window.orientation || 0
  }

  // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

  private zee = new Vector3(0, 0, 1)
  private euler = new Euler()
  private q0 = new Quaternion()
  private q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)) // - PI/2 around the x-axis
  private setObjectQuaternion = (
    quaternion: Quaternion,
    alpha: number,
    beta: number,
    gamma: number,
    orient: number,
  ): void => {
    this.euler.set(beta, alpha, -gamma, 'YXZ') // 'ZXY' for the device, but 'YXZ' for us
    quaternion.setFromEuler(this.euler) // orient the device
    quaternion.multiply(this.q1) // camera looks out the back of the device, not the top
    quaternion.multiply(this.q0.setFromAxisAngle(this.zee, -orient)) // adjust for screen orientation
  }

  connect = (): void => {
    this.onScreenOrientationChangeEvent() // run once on load

    // iOS 13+

    if (
      window.DeviceOrientationEvent !== undefined &&
      typeof window.DeviceOrientationEvent.requestPermission === 'function'
    ) {
      window.DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response == 'granted') {
            window.addEventListener('orientationchange', this.onScreenOrientationChangeEvent)
            window.addEventListener('deviceorientation', this.onDeviceOrientationChangeEvent)
          }
        })
        .catch((error) => {
          console.error('THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error)
        })
    } else {
      window.addEventListener('orientationchange', this.onScreenOrientationChangeEvent)
      window.addEventListener('deviceorientation', this.onDeviceOrientationChangeEvent)
    }

    this.enabled = true
  }

  disconnect = (): void => {
    window.removeEventListener('orientationchange', this.onScreenOrientationChangeEvent)
    window.removeEventListener('deviceorientation', this.onDeviceOrientationChangeEvent)

    this.enabled = false
  }

  private lastQuaternion = new Quaternion()
  update = (): void => {
    if (this.enabled === false) return

    const device = this.deviceOrientation

    if (device) {
      const alpha = device.alpha ? MathUtils.degToRad(device.alpha) + this.alphaOffset : 0 // Z
      const beta = device.beta ? MathUtils.degToRad(device.beta) : 0 // X'
      const gamma = device.gamma ? MathUtils.degToRad(device.gamma) : 0 // Y''
      const orient = this.screenOrientation ? MathUtils.degToRad(this.screenOrientation as number) : 0 // O

      this.setObjectQuaternion(this.object.quaternion, alpha, beta, gamma, orient)

      if (8 * (1 - this.lastQuaternion.dot(this.object.quaternion)) > this.EPS) {
        this.lastQuaternion.copy(this.object.quaternion)
        this.dispatchEvent(this.changeEvent)
      }
    }
  }

  dispose = (): void => this.disconnect()
}

export { DeviceOrientationControls }
