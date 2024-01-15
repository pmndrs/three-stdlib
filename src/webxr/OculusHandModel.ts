import { Object3D, Sphere, Box3, Mesh, Texture, Vector3 } from 'three'
import { XRHandMeshModel } from './XRHandMeshModel'

const TOUCH_RADIUS = 0.01
const POINTING_JOINT = 'index-finger-tip'

export interface XRButton extends Object3D {
  onPress(): void
  onClear(): void
  isPressed(): boolean
  whilePressed(): void
}

class OculusHandModel extends Object3D {
  controller: Object3D
  motionController: XRHandMeshModel | null
  envMap: Texture | null
  mesh: Mesh | null
  xrInputSource: XRInputSource | null

  constructor(controller: Object3D, leftModelPath?: string, rightModelPath?: string) {
    super()

    this.controller = controller
    this.motionController = null
    this.envMap = null

    this.mesh = null
    this.xrInputSource = null

    controller.addEventListener('connected', (event) => {
      const xrInputSource = (event as any).data

      if (xrInputSource.hand && !this.motionController) {
        this.xrInputSource = xrInputSource

        this.motionController = new XRHandMeshModel(
          this,
          controller,
          undefined,
          xrInputSource.handedness,
          xrInputSource.handedness === 'left' ? leftModelPath : rightModelPath,
        )
      }
    })

    controller.addEventListener('disconnected', () => {
      this.dispose()
    })
  }

  updateMatrixWorld(force?: boolean): void {
    super.updateMatrixWorld(force)

    if (this.motionController) {
      this.motionController.updateMesh()
    }
  }

  getPointerPosition(): Vector3 | null {
    // @ts-ignore XRController needs to extend Group
    const indexFingerTip = this.controller.joints[POINTING_JOINT]
    if (indexFingerTip) {
      return indexFingerTip.position
    } else {
      return null
    }
  }

  intersectBoxObject(boxObject: Object3D): boolean {
    const pointerPosition = this.getPointerPosition()
    if (pointerPosition) {
      const indexSphere = new Sphere(pointerPosition, TOUCH_RADIUS)
      const box = new Box3().setFromObject(boxObject)
      return indexSphere.intersectsBox(box)
    } else {
      return false
    }
  }

  checkButton(button: XRButton): void {
    if (this.intersectBoxObject(button)) {
      button.onPress()
    } else {
      button.onClear()
    }

    if (button.isPressed()) {
      button.whilePressed()
    }
  }

  dispose(): void {
    this.clear()
    this.motionController = null
  }
}

export { OculusHandModel }
