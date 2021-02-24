import { Euler, EventDispatcher, Vector3 } from '../../../build/three.module.js'

class PointerLockControls extends EventDispatcher {
  constructor(camera, domElement) {
    if (domElement === undefined) {
      console.warn('THREE.PointerLockControls: The second parameter "domElement" is now mandatory.')
      domElement = document.body
    }

    this.domElement = domElement
    this.isLocked = false

    // Set to constrain the pitch of the camera
    // Range is 0 to Math.PI radians
    this.minPolarAngle = 0 // radians
    this.maxPolarAngle = Math.PI // radians

    //
    // internals
    //

    const scope = this

    const changeEvent = { type: 'change' }
    const lockEvent = { type: 'lock' }
    const unlockEvent = { type: 'unlock' }

    const euler = new Euler(0, 0, 0, 'YXZ')

    const PI_2 = Math.PI / 2

    const vec = new Vector3()

    function onMouseMove(event) {
      if (scope.isLocked === false) return

      const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
      const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0

      euler.setFromQuaternion(camera.quaternion)

      euler.y -= movementX * 0.002
      euler.x -= movementY * 0.002

      euler.x = Math.max(PI_2 - scope.maxPolarAngle, Math.min(PI_2 - scope.minPolarAngle, euler.x))

      camera.quaternion.setFromEuler(euler)

      scope.dispatchEvent(changeEvent)
    }

    function onPointerlockChange() {
      if (scope.domElement.ownerDocument.pointerLockElement === scope.domElement) {
        scope.dispatchEvent(lockEvent)

        scope.isLocked = true
      } else {
        scope.dispatchEvent(unlockEvent)

        scope.isLocked = false
      }
    }

    function onPointerlockError() {
      console.error('THREE.PointerLockControls: Unable to use Pointer Lock API')
    }

    this.connect = () => {
      scope.domElement.ownerDocument.addEventListener('mousemove', onMouseMove)
      scope.domElement.ownerDocument.addEventListener('pointerlockchange', onPointerlockChange)
      scope.domElement.ownerDocument.addEventListener('pointerlockerror', onPointerlockError)
    }

    this.disconnect = () => {
      scope.domElement.ownerDocument.removeEventListener('mousemove', onMouseMove)
      scope.domElement.ownerDocument.removeEventListener('pointerlockchange', onPointerlockChange)
      scope.domElement.ownerDocument.removeEventListener('pointerlockerror', onPointerlockError)
    }

    this.dispose = function () {
      this.disconnect()
    }

    this.getObject = () =>
      // retaining this method for backward compatibility

      camera

    this.getDirection = (() => {
      const direction = new Vector3(0, 0, -1)

      return (v) => v.copy(direction).applyQuaternion(camera.quaternion)
    })()

    this.moveForward = (distance) => {
      // move forward parallel to the xz-plane
      // assumes camera.up is y-up

      vec.setFromMatrixColumn(camera.matrix, 0)

      vec.crossVectors(camera.up, vec)

      camera.position.addScaledVector(vec, distance)
    }

    this.moveRight = (distance) => {
      vec.setFromMatrixColumn(camera.matrix, 0)

      camera.position.addScaledVector(vec, distance)
    }

    this.lock = function () {
      this.domElement.requestPointerLock()
    }

    this.unlock = () => {
      scope.domElement.ownerDocument.exitPointerLock()
    }

    this.connect()
  }
}

export { PointerLockControls }
