import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Euler,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OctahedronGeometry,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  SphereGeometry,
  Intersection,
  TorusGeometry,
  Vector3,
} from 'three'

export interface TransformControlsPointerObject {
  x: number
  y: number
  button: number
}

class TransformControls extends Object3D {
  public readonly isTransformControls = true

  public visible = false

  private domElement: HTMLElement | Document

  private raycaster = new Raycaster()

  private _gizmo: TransformControlsGizmo
  private _plane: TransformControlsPlane

  private _tempVector = new Vector3()
  private _tempVector2 = new Vector3()
  private _tempQuaternion = new Quaternion()
  private _unit = {
    X: new Vector3(1, 0, 0),
    Y: new Vector3(0, 1, 0),
    Z: new Vector3(0, 0, 1),
  }

  private _pointStart = new Vector3()
  private _pointEnd = new Vector3()
  private _offset = new Vector3()
  private _rotationAxis = new Vector3()
  private _startNorm = new Vector3()
  private _endNorm = new Vector3()
  private _rotationAngle = 0

  private _cameraPosition = new Vector3()
  private _cameraQuaternion = new Quaternion()
  private _cameraScale = new Vector3()

  private _parentPosition = new Vector3()
  private _parentQuaternion = new Quaternion()
  private _parentQuaternionInv = new Quaternion()
  private _parentScale = new Vector3()

  private _worldPositionStart = new Vector3()
  private _worldQuaternionStart = new Quaternion()
  private _worldScaleStart = new Vector3()

  private _worldPosition = new Vector3()
  private _worldQuaternion = new Quaternion()
  private _worldQuaternionInv = new Quaternion()
  private _worldScale = new Vector3()

  private _eye = new Vector3()

  private _positionStart = new Vector3()
  private _quaternionStart = new Quaternion()
  private _scaleStart = new Vector3()

  private _camera: PerspectiveCamera | OrthographicCamera
  private _object: Object3D | undefined
  private _enabled = true
  private _axis: string | null = null
  private _mode: 'translate' | 'rotate' | 'scale' = 'translate'
  private _translationSnap: number | null = null
  private _rotationSnap: number | null = null
  private _scaleSnap: number | null = null
  private _space = 'world'
  private _size = 1
  private _dragging = false
  private _showX = true
  private _showY = true
  private _showZ = true

  // events
  private changeEvent = { type: 'change' }
  private mouseDownEvent = { type: 'mouseDown' }
  private mouseUpEvent = { type: 'mouseUp', mode: this._mode }
  private objectChangeEvent = { type: 'objectChange' }

  constructor(camera: PerspectiveCamera | OrthographicCamera, domElement: HTMLElement) {
    super()

    if (domElement === undefined) {
      console.warn('THREE.TransformControls: The second parameter "domElement" is now mandatory.')
      this.domElement = document
    }

    this.domElement = domElement
    this._camera = camera

    this._gizmo = new TransformControlsGizmo()
    this.add(this._gizmo)

    this._plane = new TransformControlsPlane()
    this.add(this._plane)

    // Defined getter, setter and store for a property
    const defineProperty = <TValue>(propName: string, defaultValue: TValue): void => {
      let propValue = defaultValue

      Object.defineProperty(this, propName, {
        get: function () {
          return propValue !== undefined ? propValue : defaultValue
        },

        set: function (value) {
          if (propValue !== value) {
            propValue = value
            this._plane[propName] = value
            this._gizmo[propName] = value

            this.dispatchEvent({ type: propName + '-changed', value: value })
            this.dispatchEvent(this.changeEvent)
          }
        },
      })

      //@ts-ignore
      this[propName] = defaultValue
      // @ts-ignore
      this._plane[propName] = defaultValue
      // @ts-ignore
      this._gizmo[propName] = defaultValue
    }

    defineProperty('_camera', this._camera)
    defineProperty('_object', this._object)
    defineProperty('_enabled', this._enabled)
    defineProperty('_axis', this._axis)
    defineProperty('_mode', this._mode)
    defineProperty('_translationSnap', this._translationSnap)
    defineProperty('_rotationSnap', this._rotationSnap)
    defineProperty('_scaleSnap', this._scaleSnap)
    defineProperty('_space', this._space)
    defineProperty('_size', this._size)
    defineProperty('_dragging', this._dragging)
    defineProperty('_showX', this._showX)
    defineProperty('_showY', this._showY)
    defineProperty('_showZ', this._showZ)
    defineProperty('_worldPosition', this._worldPosition)
    defineProperty('_worldPositionStart', this._worldPositionStart)
    defineProperty('_worldQuaternion', this._worldQuaternion)
    defineProperty('_worldQuaternionStart', this._worldQuaternionStart)
    defineProperty('_cameraPosition', this._cameraPosition)
    defineProperty('_cameraQuaternion', this._cameraQuaternion)
    defineProperty('_pointStart', this._pointStart)
    defineProperty('_pointEnd', this._pointEnd)
    defineProperty('_rotationAxis', this._rotationAxis)
    defineProperty('_rotationAngle', this._rotationAngle)
    defineProperty('_eye', this._eye)

    {
      domElement.addEventListener('pointerdown', this.onPointerDown)
      domElement.addEventListener('pointermove', this.onPointerHover)
      this.domElement.ownerDocument.addEventListener('pointerup', this.onPointerUp)
    }
  }

  private intersectObjectWithRay = (
    object: Object3D,
    raycaster: Raycaster,
    includeInvisible?: boolean,
  ): false | Intersection => {
    const allIntersections = raycaster.intersectObject(object, true)

    for (let i = 0; i < allIntersections.length; i++) {
      if (allIntersections[i].object.visible || includeInvisible) {
        return allIntersections[i]
      }
    }

    return false
  }

  // Set current object
  public attach = (object: Object3D): this => {
    this._object = object
    this.visible = true

    return this
  }

  // Detatch from object
  public detach = (): this => {
    this._object = undefined
    this.visible = false
    this._axis = null

    return this
  }

  public updateMatrixWorld = (): void => {
    if (this._object !== undefined) {
      this._object.updateMatrixWorld()

      if (this._object.parent === null) {
        console.error('TransformControls: The attached 3D object must be a part of the scene graph.')
      } else {
        this._object.parent.matrixWorld.decompose(this._parentPosition, this._parentQuaternion, this._parentScale)
      }

      this._object.matrixWorld.decompose(this._worldPosition, this._worldQuaternion, this._worldScale)

      this._parentQuaternionInv.copy(this._parentQuaternion).invert()
      this._worldQuaternionInv.copy(this._worldQuaternion).invert()
    }

    this._camera.updateMatrixWorld()
    this._camera.matrixWorld.decompose(this._cameraPosition, this._cameraQuaternion, this._cameraScale)

    this._eye.copy(this._cameraPosition).sub(this._worldPosition).normalize()

    super.updateMatrixWorld()
  }

  private pointerHover = (pointer: TransformControlsPointerObject): void => {
    if (this._object === undefined || this._dragging === true) return

    this.raycaster.setFromCamera(pointer, this._camera)

    const intersect = this.intersectObjectWithRay(this._gizmo.picker[this._mode], this.raycaster)

    if (intersect) {
      this._axis = intersect.object.name
    } else {
      this._axis = null
    }
  }

  private pointerDown = (pointer: TransformControlsPointerObject): void => {
    if (this._object === undefined || this._dragging === true || pointer.button !== 0) return

    if (this._axis !== null) {
      this.raycaster.setFromCamera(pointer, this._camera)

      const planeIntersect = this.intersectObjectWithRay(this._plane, this.raycaster, true)

      if (planeIntersect) {
        let space = this._space

        if (this._mode === 'scale') {
          space = 'local'
        } else if (this._axis === 'E' || this._axis === 'XYZE' || this._axis === 'XYZ') {
          space = 'world'
        }

        if (space === 'local' && this._mode === 'rotate') {
          const snap = this._rotationSnap

          if (this._axis === 'X' && snap) this._object.rotation.x = Math.round(this._object.rotation.x / snap) * snap
          if (this._axis === 'Y' && snap) this._object.rotation.y = Math.round(this._object.rotation.y / snap) * snap
          if (this._axis === 'Z' && snap) this._object.rotation.z = Math.round(this._object.rotation.z / snap) * snap
        }

        this._object.updateMatrixWorld()

        if (this._object.parent) {
          this._object.parent.updateMatrixWorld()
        }

        this._positionStart.copy(this._object.position)
        this._quaternionStart.copy(this._object.quaternion)
        this._scaleStart.copy(this._object.scale)

        this._object.matrixWorld.decompose(this._worldPositionStart, this._worldQuaternionStart, this._worldScaleStart)

        this._pointStart.copy(planeIntersect.point).sub(this._worldPositionStart)
      }

      this._dragging = true
      this.mouseDownEvent.type = this._mode
      this.dispatchEvent(this.mouseDownEvent)
    }
  }

  private pointerMove = (pointer: TransformControlsPointerObject): void => {
    const axis = this._axis
    const mode = this._mode
    const object = this._object
    let space = this._space

    if (mode === 'scale') {
      space = 'local'
    } else if (axis === 'E' || axis === 'XYZE' || axis === 'XYZ') {
      space = 'world'
    }

    if (object === undefined || axis === null || this._dragging === false || pointer.button !== -1) return

    this.raycaster.setFromCamera(pointer, this._camera)

    const planeIntersect = this.intersectObjectWithRay(this._plane, this.raycaster, true)

    if (!planeIntersect) return

    this._pointEnd.copy(planeIntersect.point).sub(this._worldPositionStart)

    if (mode === 'translate') {
      // Apply translate

      this._offset.copy(this._pointEnd).sub(this._pointStart)

      if (space === 'local' && axis !== 'XYZ') {
        this._offset.applyQuaternion(this._worldQuaternionInv)
      }

      if (axis.indexOf('X') === -1) this._offset.x = 0
      if (axis.indexOf('Y') === -1) this._offset.y = 0
      if (axis.indexOf('Z') === -1) this._offset.z = 0

      if (space === 'local' && axis !== 'XYZ') {
        this._offset.applyQuaternion(this._quaternionStart).divide(this._parentScale)
      } else {
        this._offset.applyQuaternion(this._parentQuaternionInv).divide(this._parentScale)
      }

      object.position.copy(this._offset).add(this._positionStart)

      // Apply translation snap

      if (this._translationSnap) {
        if (space === 'local') {
          object.position.applyQuaternion(this._tempQuaternion.copy(this._quaternionStart).invert())

          if (axis.search('X') !== -1) {
            object.position.x = Math.round(object.position.x / this._translationSnap) * this._translationSnap
          }

          if (axis.search('Y') !== -1) {
            object.position.y = Math.round(object.position.y / this._translationSnap) * this._translationSnap
          }

          if (axis.search('Z') !== -1) {
            object.position.z = Math.round(object.position.z / this._translationSnap) * this._translationSnap
          }

          object.position.applyQuaternion(this._quaternionStart)
        }

        if (space === 'world') {
          if (object.parent) {
            object.position.add(this._tempVector.setFromMatrixPosition(object.parent.matrixWorld))
          }

          if (axis.search('X') !== -1) {
            object.position.x = Math.round(object.position.x / this._translationSnap) * this._translationSnap
          }

          if (axis.search('Y') !== -1) {
            object.position.y = Math.round(object.position.y / this._translationSnap) * this._translationSnap
          }

          if (axis.search('Z') !== -1) {
            object.position.z = Math.round(object.position.z / this._translationSnap) * this._translationSnap
          }

          if (object.parent) {
            object.position.sub(this._tempVector.setFromMatrixPosition(object.parent.matrixWorld))
          }
        }
      }
    } else if (mode === 'scale') {
      if (axis.search('XYZ') !== -1) {
        let d = this._pointEnd.length() / this._pointStart.length()

        if (this._pointEnd.dot(this._pointStart) < 0) d *= -1

        this._tempVector2.set(d, d, d)
      } else {
        this._tempVector.copy(this._pointStart)
        this._tempVector2.copy(this._pointEnd)

        this._tempVector.applyQuaternion(this._worldQuaternionInv)
        this._tempVector2.applyQuaternion(this._worldQuaternionInv)

        this._tempVector2.divide(this._tempVector)

        if (axis.search('X') === -1) {
          this._tempVector2.x = 1
        }

        if (axis.search('Y') === -1) {
          this._tempVector2.y = 1
        }

        if (axis.search('Z') === -1) {
          this._tempVector2.z = 1
        }
      }

      // Apply scale

      object.scale.copy(this._scaleStart).multiply(this._tempVector2)

      if (this._scaleSnap && this._object) {
        if (axis.search('X') !== -1) {
          this._object.scale.x = Math.round(object.scale.x / this._scaleSnap) * this._scaleSnap || this._scaleSnap
        }

        if (axis.search('Y') !== -1) {
          object.scale.y = Math.round(object.scale.y / this._scaleSnap) * this._scaleSnap || this._scaleSnap
        }

        if (axis.search('Z') !== -1) {
          object.scale.z = Math.round(object.scale.z / this._scaleSnap) * this._scaleSnap || this._scaleSnap
        }
      }
    } else if (mode === 'rotate') {
      this._offset.copy(this._pointEnd).sub(this._pointStart)

      const ROTATION_SPEED =
        20 / this._worldPosition.distanceTo(this._tempVector.setFromMatrixPosition(this._camera.matrixWorld))

      if (axis === 'E') {
        this._rotationAxis.copy(this._eye)
        this._rotationAngle = this._pointEnd.angleTo(this._pointStart)

        this._startNorm.copy(this._pointStart).normalize()
        this._endNorm.copy(this._pointEnd).normalize()

        this._rotationAngle *= this._endNorm.cross(this._startNorm).dot(this._eye) < 0 ? 1 : -1
      } else if (axis === 'XYZE') {
        this._rotationAxis.copy(this._offset).cross(this._eye).normalize()
        this._rotationAngle =
          this._offset.dot(this._tempVector.copy(this._rotationAxis).cross(this._eye)) * ROTATION_SPEED
      } else if (axis === 'X' || axis === 'Y' || axis === 'Z') {
        this._rotationAxis.copy(this._unit[axis])

        this._tempVector.copy(this._unit[axis])

        if (space === 'local') {
          this._tempVector.applyQuaternion(this._worldQuaternion)
        }

        this._rotationAngle = this._offset.dot(this._tempVector.cross(this._eye).normalize()) * ROTATION_SPEED
      }

      // Apply rotation snap

      if (this._rotationSnap) {
        this._rotationAngle = Math.round(this._rotationAngle / this._rotationSnap) * this._rotationSnap
      }

      // Apply rotate
      if (space === 'local' && axis !== 'E' && axis !== 'XYZE') {
        object.quaternion.copy(this._quaternionStart)
        object.quaternion
          .multiply(this._tempQuaternion.setFromAxisAngle(this._rotationAxis, this._rotationAngle))
          .normalize()
      } else {
        this._rotationAxis.applyQuaternion(this._parentQuaternionInv)
        object.quaternion.copy(this._tempQuaternion.setFromAxisAngle(this._rotationAxis, this._rotationAngle))
        object.quaternion.multiply(this._quaternionStart).normalize()
      }
    }

    this.dispatchEvent(this.changeEvent)
    this.dispatchEvent(this.objectChangeEvent)
  }

  private pointerUp = (pointer: TransformControlsPointerObject): void => {
    if (pointer.button !== 0) return

    if (this._dragging && this._axis !== null) {
      this.mouseUpEvent.mode = this._mode
      this.dispatchEvent(this.mouseUpEvent)
    }

    this._dragging = false
    this._axis = null
  }

  private getPointer = (event: Event): TransformControlsPointerObject => {
    if (this.domElement && this.domElement.ownerDocument?.pointerLockElement) {
      return {
        x: 0,
        y: 0,
        button: (event as MouseEvent).button,
      }
    } else {
      const pointer = (event as TouchEvent).changedTouches
        ? (event as TouchEvent).changedTouches[0]
        : (event as MouseEvent)

      const rect = (this.domElement as HTMLElement)?.getBoundingClientRect()

      return {
        x: ((pointer.clientX - rect.left) / rect.width) * 2 - 1,
        y: (-(pointer.clientY - rect.top) / rect.height) * 2 + 1,
        button: (event as MouseEvent).button,
      }
    }
  }

  private onPointerHover = (event: Event): void => {
    if (!this._enabled) return

    switch ((event as PointerEvent).pointerType) {
      case 'mouse':
      case 'pen':
        this.pointerHover(this.getPointer(event))
        break
    }
  }

  private onPointerDown = (event: Event): void => {
    if (!this._enabled) return
    ;(this.domElement as HTMLElement).style.touchAction = 'none' // disable touch scroll
    this.domElement.ownerDocument?.addEventListener('pointermove', this.onPointerMove)

    this.pointerHover(this.getPointer(event))
    this.pointerDown(this.getPointer(event))
  }

  private onPointerMove = (event: Event): void => {
    if (!this._enabled) return

    this.pointerMove(this.getPointer(event))
  }

  private onPointerUp = (event: Event): void => {
    if (!this._enabled) return
    ;(this.domElement as HTMLElement).style.touchAction = ''
    this.domElement.ownerDocument?.removeEventListener('pointermove', this.onPointerMove)

    this.pointerUp(this.getPointer(event))
  }

  public getMode = (): TransformControls['_mode'] => this._mode

  public setMode = (mode: TransformControls['_mode']): void => {
    this._mode = mode
  }

  public setTranslationSnap = (translationSnap: number): void => {
    this._translationSnap = translationSnap
  }

  public setRotationSnap = (rotationSnap: number): void => {
    this._rotationSnap = rotationSnap
  }

  public setScaleSnap = (scaleSnap: number): void => {
    this._scaleSnap = scaleSnap
  }

  public setSize = (size: number): void => {
    this._size = size
  }

  public setSpace = (space: string): void => {
    this._space = space
  }

  public update = (): void => {
    console.warn(
      'THREE.TransformControls: update function has no more functionality and therefore has been deprecated.',
    )
  }

  public dispose = (): void => {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown)
    this.domElement.removeEventListener('pointermove', this.onPointerHover)
    this.domElement.ownerDocument?.removeEventListener('pointermove', this.onPointerMove)
    this.domElement.ownerDocument?.removeEventListener('pointerup', this.onPointerUp)

    this.traverse((child) => {
      const mesh = child as Mesh<BufferGeometry, Material>
      if (mesh.geometry) {
        mesh.geometry.dispose()
      }
      if (mesh.material) {
        mesh.material.dispose()
      }
    })
  }
}

type TransformControlsGizmoPrivateGizmos = {
  ['translate']: Object3D
  ['scale']: Object3D
  ['rotate']: Object3D
  ['visible']: boolean
}

class TransformControlsGizmo extends Object3D {
  private isTransformControlsGizmo = true
  public type = 'TransformControlsGizmo'

  private tempVector = new Vector3(0, 0, 0)
  private tempEuler = new Euler()
  private alignVector = new Vector3(0, 1, 0)
  private zeroVector = new Vector3(0, 0, 0)
  private lookAtMatrix = new Matrix4()
  private tempQuaternion = new Quaternion()
  private tempQuaternion2 = new Quaternion()
  private identityQuaternion = new Quaternion()

  private unitX = new Vector3(1, 0, 0)
  private unitY = new Vector3(0, 1, 0)
  private unitZ = new Vector3(0, 0, 1)

  private gizmo: TransformControlsGizmoPrivateGizmos
  public picker: TransformControlsGizmoPrivateGizmos
  private helper: TransformControlsGizmoPrivateGizmos

  // these are set from parent class TransformControls
  private _rotationAxis = new Vector3()

  private _cameraPosition = new Vector3()

  private _worldPositionStart = new Vector3()
  private _worldQuaternionStart = new Quaternion()

  private _worldPosition = new Vector3()
  private _worldQuaternion = new Quaternion()

  private _eye = new Vector3()

  private _camera: PerspectiveCamera | OrthographicCamera = null!
  private _enabled = true
  private _axis: string | null = null
  private _mode: 'translate' | 'rotate' | 'scale' = 'translate'
  private _space = 'world'
  private _size = 1
  private _dragging = false
  private _showX = true
  private _showY = true
  private _showZ = true

  constructor() {
    super()

    const gizmoMaterial = new MeshBasicMaterial({
      depthTest: false,
      depthWrite: false,
      transparent: true,
      side: DoubleSide,
      fog: false,
      toneMapped: false,
    })

    const gizmoLineMaterial = new LineBasicMaterial({
      depthTest: false,
      depthWrite: false,
      transparent: true,
      linewidth: 1,
      fog: false,
      toneMapped: false,
    })

    // Make unique material for each axis/color

    const matInvisible = gizmoMaterial.clone()
    matInvisible.opacity = 0.15

    const matHelper = gizmoMaterial.clone()
    matHelper.opacity = 0.33

    const matRed = gizmoMaterial.clone() as MeshBasicMaterial
    matRed.color.set(0xff0000)

    const matGreen = gizmoMaterial.clone() as MeshBasicMaterial
    matGreen.color.set(0x00ff00)

    const matBlue = gizmoMaterial.clone() as MeshBasicMaterial
    matBlue.color.set(0x0000ff)

    const matWhiteTransparent = gizmoMaterial.clone() as MeshBasicMaterial
    matWhiteTransparent.opacity = 0.25

    const matYellowTransparent = matWhiteTransparent.clone() as MeshBasicMaterial
    matYellowTransparent.color.set(0xffff00)

    const matCyanTransparent = matWhiteTransparent.clone() as MeshBasicMaterial
    matCyanTransparent.color.set(0x00ffff)

    const matMagentaTransparent = matWhiteTransparent.clone() as MeshBasicMaterial
    matMagentaTransparent.color.set(0xff00ff)

    const matYellow = gizmoMaterial.clone() as MeshBasicMaterial
    matYellow.color.set(0xffff00)

    const matLineRed = gizmoLineMaterial.clone() as LineBasicMaterial
    matLineRed.color.set(0xff0000)

    const matLineGreen = gizmoLineMaterial.clone() as LineBasicMaterial
    matLineGreen.color.set(0x00ff00)

    const matLineBlue = gizmoLineMaterial.clone() as LineBasicMaterial
    matLineBlue.color.set(0x0000ff)

    const matLineCyan = gizmoLineMaterial.clone() as LineBasicMaterial
    matLineCyan.color.set(0x00ffff)

    const matLineMagenta = gizmoLineMaterial.clone() as LineBasicMaterial
    matLineMagenta.color.set(0xff00ff)

    const matLineYellow = gizmoLineMaterial.clone() as LineBasicMaterial
    matLineYellow.color.set(0xffff00)

    const matLineGray = gizmoLineMaterial.clone() as LineBasicMaterial
    matLineGray.color.set(0x787878)

    const matLineYellowTransparent = matLineYellow.clone() as LineBasicMaterial
    matLineYellowTransparent.opacity = 0.25

    // reusable geometry

    const arrowGeometry = new CylinderGeometry(0, 0.05, 0.2, 12, 1, false)

    const scaleHandleGeometry = new BoxGeometry(0.125, 0.125, 0.125)

    const lineGeometry = new BufferGeometry()
    lineGeometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3))

    const CircleGeometry = (radius: number, arc: number): BufferGeometry => {
      const geometry = new BufferGeometry()
      const vertices = []

      for (let i = 0; i <= 64 * arc; ++i) {
        vertices.push(0, Math.cos((i / 32) * Math.PI) * radius, Math.sin((i / 32) * Math.PI) * radius)
      }

      geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))

      return geometry
    }

    // Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position

    const TranslateHelperGeometry = (): BufferGeometry => {
      const geometry = new BufferGeometry()

      geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3))

      return geometry
    }

    // Gizmo definitions - custom hierarchy definitions for setupGizmo() function

    const gizmoTranslate = {
      X: [
        [new Mesh(arrowGeometry, matRed), [1, 0, 0], [0, 0, -Math.PI / 2], null, 'fwd'],
        [new Mesh(arrowGeometry, matRed), [1, 0, 0], [0, 0, Math.PI / 2], null, 'bwd'],
        [new Line(lineGeometry, matLineRed)],
      ],
      Y: [
        [new Mesh(arrowGeometry, matGreen), [0, 1, 0], null, null, 'fwd'],
        [new Mesh(arrowGeometry, matGreen), [0, 1, 0], [Math.PI, 0, 0], null, 'bwd'],
        [new Line(lineGeometry, matLineGreen), null, [0, 0, Math.PI / 2]],
      ],
      Z: [
        [new Mesh(arrowGeometry, matBlue), [0, 0, 1], [Math.PI / 2, 0, 0], null, 'fwd'],
        [new Mesh(arrowGeometry, matBlue), [0, 0, 1], [-Math.PI / 2, 0, 0], null, 'bwd'],
        [new Line(lineGeometry, matLineBlue), null, [0, -Math.PI / 2, 0]],
      ],
      XYZ: [[new Mesh(new OctahedronGeometry(0.1, 0), matWhiteTransparent.clone()), [0, 0, 0], [0, 0, 0]]],
      XY: [
        [new Mesh(new PlaneGeometry(0.295, 0.295), matYellowTransparent.clone()), [0.15, 0.15, 0]],
        [new Line(lineGeometry, matLineYellow), [0.18, 0.3, 0], null, [0.125, 1, 1]],
        [new Line(lineGeometry, matLineYellow), [0.3, 0.18, 0], [0, 0, Math.PI / 2], [0.125, 1, 1]],
      ],
      YZ: [
        [new Mesh(new PlaneGeometry(0.295, 0.295), matCyanTransparent.clone()), [0, 0.15, 0.15], [0, Math.PI / 2, 0]],
        [new Line(lineGeometry, matLineCyan), [0, 0.18, 0.3], [0, 0, Math.PI / 2], [0.125, 1, 1]],
        [new Line(lineGeometry, matLineCyan), [0, 0.3, 0.18], [0, -Math.PI / 2, 0], [0.125, 1, 1]],
      ],
      XZ: [
        [
          new Mesh(new PlaneGeometry(0.295, 0.295), matMagentaTransparent.clone()),
          [0.15, 0, 0.15],
          [-Math.PI / 2, 0, 0],
        ],
        [new Line(lineGeometry, matLineMagenta), [0.18, 0, 0.3], null, [0.125, 1, 1]],
        [new Line(lineGeometry, matLineMagenta), [0.3, 0, 0.18], [0, -Math.PI / 2, 0], [0.125, 1, 1]],
      ],
    }

    const pickerTranslate = {
      X: [[new Mesh(new CylinderGeometry(0.2, 0, 1, 4, 1, false), matInvisible), [0.6, 0, 0], [0, 0, -Math.PI / 2]]],
      Y: [[new Mesh(new CylinderGeometry(0.2, 0, 1, 4, 1, false), matInvisible), [0, 0.6, 0]]],
      Z: [[new Mesh(new CylinderGeometry(0.2, 0, 1, 4, 1, false), matInvisible), [0, 0, 0.6], [Math.PI / 2, 0, 0]]],
      XYZ: [[new Mesh(new OctahedronGeometry(0.2, 0), matInvisible)]],
      XY: [[new Mesh(new PlaneGeometry(0.4, 0.4), matInvisible), [0.2, 0.2, 0]]],
      YZ: [[new Mesh(new PlaneGeometry(0.4, 0.4), matInvisible), [0, 0.2, 0.2], [0, Math.PI / 2, 0]]],
      XZ: [[new Mesh(new PlaneGeometry(0.4, 0.4), matInvisible), [0.2, 0, 0.2], [-Math.PI / 2, 0, 0]]],
    }

    const helperTranslate = {
      START: [[new Mesh(new OctahedronGeometry(0.01, 2), matHelper), null, null, null, 'helper']],
      END: [[new Mesh(new OctahedronGeometry(0.01, 2), matHelper), null, null, null, 'helper']],
      DELTA: [[new Line(TranslateHelperGeometry(), matHelper), null, null, null, 'helper']],
      X: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']],
      Y: [[new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']],
      Z: [[new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']],
    }

    const gizmoRotate = {
      X: [
        [new Line(CircleGeometry(1, 0.5), matLineRed)],
        [new Mesh(new OctahedronGeometry(0.04, 0), matRed), [0, 0, 0.99], null, [1, 3, 1]],
      ],
      Y: [
        [new Line(CircleGeometry(1, 0.5), matLineGreen), null, [0, 0, -Math.PI / 2]],
        [new Mesh(new OctahedronGeometry(0.04, 0), matGreen), [0, 0, 0.99], null, [3, 1, 1]],
      ],
      Z: [
        [new Line(CircleGeometry(1, 0.5), matLineBlue), null, [0, Math.PI / 2, 0]],
        [new Mesh(new OctahedronGeometry(0.04, 0), matBlue), [0.99, 0, 0], null, [1, 3, 1]],
      ],
      E: [
        [new Line(CircleGeometry(1.25, 1), matLineYellowTransparent), null, [0, Math.PI / 2, 0]],
        [
          new Mesh(new CylinderGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent),
          [1.17, 0, 0],
          [0, 0, -Math.PI / 2],
          [1, 1, 0.001],
        ],
        [
          new Mesh(new CylinderGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent),
          [-1.17, 0, 0],
          [0, 0, Math.PI / 2],
          [1, 1, 0.001],
        ],
        [
          new Mesh(new CylinderGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent),
          [0, -1.17, 0],
          [Math.PI, 0, 0],
          [1, 1, 0.001],
        ],
        [
          new Mesh(new CylinderGeometry(0.03, 0, 0.15, 4, 1, false), matLineYellowTransparent),
          [0, 1.17, 0],
          [0, 0, 0],
          [1, 1, 0.001],
        ],
      ],
      XYZE: [[new Line(CircleGeometry(1, 1), matLineGray), null, [0, Math.PI / 2, 0]]],
    }

    const helperRotate = {
      AXIS: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']],
    }

    const pickerRotate = {
      X: [[new Mesh(new TorusGeometry(1, 0.1, 4, 24), matInvisible), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]]],
      Y: [[new Mesh(new TorusGeometry(1, 0.1, 4, 24), matInvisible), [0, 0, 0], [Math.PI / 2, 0, 0]]],
      Z: [[new Mesh(new TorusGeometry(1, 0.1, 4, 24), matInvisible), [0, 0, 0], [0, 0, -Math.PI / 2]]],
      E: [[new Mesh(new TorusGeometry(1.25, 0.1, 2, 24), matInvisible)]],
      XYZE: [[new Mesh(new SphereGeometry(0.7, 10, 8), matInvisible)]],
    }

    const gizmoScale = {
      X: [
        [new Mesh(scaleHandleGeometry, matRed), [0.8, 0, 0], [0, 0, -Math.PI / 2]],
        [new Line(lineGeometry, matLineRed), null, null, [0.8, 1, 1]],
      ],
      Y: [
        [new Mesh(scaleHandleGeometry, matGreen), [0, 0.8, 0]],
        [new Line(lineGeometry, matLineGreen), null, [0, 0, Math.PI / 2], [0.8, 1, 1]],
      ],
      Z: [
        [new Mesh(scaleHandleGeometry, matBlue), [0, 0, 0.8], [Math.PI / 2, 0, 0]],
        [new Line(lineGeometry, matLineBlue), null, [0, -Math.PI / 2, 0], [0.8, 1, 1]],
      ],
      XY: [
        [new Mesh(scaleHandleGeometry, matYellowTransparent), [0.85, 0.85, 0], null, [2, 2, 0.2]],
        [new Line(lineGeometry, matLineYellow), [0.855, 0.98, 0], null, [0.125, 1, 1]],
        [new Line(lineGeometry, matLineYellow), [0.98, 0.855, 0], [0, 0, Math.PI / 2], [0.125, 1, 1]],
      ],
      YZ: [
        [new Mesh(scaleHandleGeometry, matCyanTransparent), [0, 0.85, 0.85], null, [0.2, 2, 2]],
        [new Line(lineGeometry, matLineCyan), [0, 0.855, 0.98], [0, 0, Math.PI / 2], [0.125, 1, 1]],
        [new Line(lineGeometry, matLineCyan), [0, 0.98, 0.855], [0, -Math.PI / 2, 0], [0.125, 1, 1]],
      ],
      XZ: [
        [new Mesh(scaleHandleGeometry, matMagentaTransparent), [0.85, 0, 0.85], null, [2, 0.2, 2]],
        [new Line(lineGeometry, matLineMagenta), [0.855, 0, 0.98], null, [0.125, 1, 1]],
        [new Line(lineGeometry, matLineMagenta), [0.98, 0, 0.855], [0, -Math.PI / 2, 0], [0.125, 1, 1]],
      ],
      XYZX: [[new Mesh(new BoxGeometry(0.125, 0.125, 0.125), matWhiteTransparent.clone()), [1.1, 0, 0]]],
      XYZY: [[new Mesh(new BoxGeometry(0.125, 0.125, 0.125), matWhiteTransparent.clone()), [0, 1.1, 0]]],
      XYZZ: [[new Mesh(new BoxGeometry(0.125, 0.125, 0.125), matWhiteTransparent.clone()), [0, 0, 1.1]]],
    }

    const pickerScale = {
      X: [[new Mesh(new CylinderGeometry(0.2, 0, 0.8, 4, 1, false), matInvisible), [0.5, 0, 0], [0, 0, -Math.PI / 2]]],
      Y: [[new Mesh(new CylinderGeometry(0.2, 0, 0.8, 4, 1, false), matInvisible), [0, 0.5, 0]]],
      Z: [[new Mesh(new CylinderGeometry(0.2, 0, 0.8, 4, 1, false), matInvisible), [0, 0, 0.5], [Math.PI / 2, 0, 0]]],
      XY: [[new Mesh(scaleHandleGeometry, matInvisible), [0.85, 0.85, 0], null, [3, 3, 0.2]]],
      YZ: [[new Mesh(scaleHandleGeometry, matInvisible), [0, 0.85, 0.85], null, [0.2, 3, 3]]],
      XZ: [[new Mesh(scaleHandleGeometry, matInvisible), [0.85, 0, 0.85], null, [3, 0.2, 3]]],
      XYZX: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.2), matInvisible), [1.1, 0, 0]]],
      XYZY: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.2), matInvisible), [0, 1.1, 0]]],
      XYZZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.2), matInvisible), [0, 0, 1.1]]],
    }

    const helperScale = {
      X: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']],
      Y: [[new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']],
      Z: [[new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']],
    }

    // Creates an Object3D with gizmos described in custom hierarchy definition.
    // this is nearly impossible to Type so i'm leaving it
    const setupGizmo = (gizmoMap: any): Object3D => {
      const gizmo = new Object3D()

      for (let name in gizmoMap) {
        for (let i = gizmoMap[name].length; i--; ) {
          const object = gizmoMap[name][i][0].clone() as Mesh
          const position = gizmoMap[name][i][1]
          const rotation = gizmoMap[name][i][2]
          const scale = gizmoMap[name][i][3]
          const tag = gizmoMap[name][i][4]

          // name and tag properties are essential for picking and updating logic.
          object.name = name
          // @ts-ignore
          object.tag = tag

          if (position) {
            object.position.set(position[0], position[1], position[2])
          }

          if (rotation) {
            object.rotation.set(rotation[0], rotation[1], rotation[2])
          }

          if (scale) {
            object.scale.set(scale[0], scale[1], scale[2])
          }

          object.updateMatrix()

          const tempGeometry = object.geometry.clone()
          tempGeometry.applyMatrix4(object.matrix)
          object.geometry = tempGeometry
          object.renderOrder = Infinity

          object.position.set(0, 0, 0)
          object.rotation.set(0, 0, 0)
          object.scale.set(1, 1, 1)

          gizmo.add(object)
        }
      }

      return gizmo
    }

    this.gizmo = {} as TransformControlsGizmoPrivateGizmos
    this.picker = {} as TransformControlsGizmoPrivateGizmos
    this.helper = {} as TransformControlsGizmoPrivateGizmos

    this.add((this.gizmo['translate'] = setupGizmo(gizmoTranslate)))
    this.add((this.gizmo['rotate'] = setupGizmo(gizmoRotate)))
    this.add((this.gizmo['scale'] = setupGizmo(gizmoScale)))
    this.add((this.picker['translate'] = setupGizmo(pickerTranslate)))
    this.add((this.picker['rotate'] = setupGizmo(pickerRotate)))
    this.add((this.picker['scale'] = setupGizmo(pickerScale)))
    this.add((this.helper['translate'] = setupGizmo(helperTranslate)))
    this.add((this.helper['rotate'] = setupGizmo(helperRotate)))
    this.add((this.helper['scale'] = setupGizmo(helperScale)))

    // Pickers should be hidden always

    this.picker['translate'].visible = false
    this.picker['rotate'].visible = false
    this.picker['scale'].visible = false
  }

  // updateMatrixWorld will update transformations and appearance of individual handles
  public updateMatrixWorld = (): void => {
    let space = this._space

    if (this._mode === 'scale') {
      space = 'local' // scale always oriented to local rotation
    }

    const quaternion = space === 'local' ? this._worldQuaternion : this.identityQuaternion

    // Show only gizmos for current transform mode

    this.gizmo['translate'].visible = this._mode === 'translate'
    this.gizmo['rotate'].visible = this._mode === 'rotate'
    this.gizmo['scale'].visible = this._mode === 'scale'

    this.helper['translate'].visible = this._mode === 'translate'
    this.helper['rotate'].visible = this._mode === 'rotate'
    this.helper['scale'].visible = this._mode === 'scale'

    let handles: Array<Object3D & { tag?: string }> = []
    handles = handles.concat(this.picker[this._mode].children)
    handles = handles.concat(this.gizmo[this._mode].children)
    handles = handles.concat(this.helper[this._mode].children)

    for (let i = 0; i < handles.length; i++) {
      const handle = handles[i]

      // hide aligned to camera

      handle.visible = true
      handle.rotation.set(0, 0, 0)
      handle.position.copy(this._worldPosition)

      let factor

      if ((this._camera as OrthographicCamera).isOrthographicCamera) {
        factor =
          ((this._camera as OrthographicCamera).top - (this._camera as OrthographicCamera).bottom) /
          (this._camera as OrthographicCamera).zoom
      } else {
        factor =
          this._worldPosition.distanceTo(this._cameraPosition) *
          Math.min((1.9 * Math.tan((Math.PI * (this._camera as PerspectiveCamera).fov) / 360)) / this._camera.zoom, 7)
      }

      handle.scale.set(1, 1, 1).multiplyScalar((factor * this._size) / 7)

      // TODO: simplify helpers and consider decoupling from gizmo

      if (handle.tag === 'helper') {
        handle.visible = false

        if (handle.name === 'AXIS') {
          handle.position.copy(this._worldPositionStart)
          handle.visible = !!this._axis

          if (this._axis === 'X') {
            this.tempQuaternion.setFromEuler(this.tempEuler.set(0, 0, 0))
            handle.quaternion.copy(quaternion).multiply(this.tempQuaternion)

            if (Math.abs(this.alignVector.copy(this.unitX).applyQuaternion(quaternion).dot(this._eye)) > 0.9) {
              handle.visible = false
            }
          }

          if (this._axis === 'Y') {
            this.tempQuaternion.setFromEuler(this.tempEuler.set(0, 0, Math.PI / 2))
            handle.quaternion.copy(quaternion).multiply(this.tempQuaternion)

            if (Math.abs(this.alignVector.copy(this.unitY).applyQuaternion(quaternion).dot(this._eye)) > 0.9) {
              handle.visible = false
            }
          }

          if (this._axis === 'Z') {
            this.tempQuaternion.setFromEuler(this.tempEuler.set(0, Math.PI / 2, 0))
            handle.quaternion.copy(quaternion).multiply(this.tempQuaternion)

            if (Math.abs(this.alignVector.copy(this.unitZ).applyQuaternion(quaternion).dot(this._eye)) > 0.9) {
              handle.visible = false
            }
          }

          if (this._axis === 'XYZE') {
            this.tempQuaternion.setFromEuler(this.tempEuler.set(0, Math.PI / 2, 0))
            this.alignVector.copy(this._rotationAxis)
            handle.quaternion.setFromRotationMatrix(
              this.lookAtMatrix.lookAt(this.zeroVector, this.alignVector, this.unitY),
            )
            handle.quaternion.multiply(this.tempQuaternion)
            handle.visible = this._dragging
          }

          if (this._axis === 'E') {
            handle.visible = false
          }
        } else if (handle.name === 'START') {
          handle.position.copy(this._worldPositionStart)
          handle.visible = this._dragging
        } else if (handle.name === 'END') {
          handle.position.copy(this._worldPosition)
          handle.visible = this._dragging
        } else if (handle.name === 'DELTA') {
          handle.position.copy(this._worldPositionStart)
          handle.quaternion.copy(this._worldQuaternionStart)
          this.tempVector
            .set(1e-10, 1e-10, 1e-10)
            .add(this._worldPositionStart)
            .sub(this._worldPosition)
            .multiplyScalar(-1)
          this.tempVector.applyQuaternion(this._worldQuaternionStart.clone().invert())
          handle.scale.copy(this.tempVector)
          handle.visible = this._dragging
        } else {
          handle.quaternion.copy(quaternion)

          if (this._dragging) {
            handle.position.copy(this._worldPositionStart)
          } else {
            handle.position.copy(this._worldPosition)
          }

          if (this._axis) {
            handle.visible = this._axis.search(handle.name) !== -1
          }
        }

        // If updating helper, skip rest of the loop
        continue
      }

      // Align handles to current local or world rotation

      handle.quaternion.copy(quaternion)

      if (this._mode === 'translate' || this._mode === 'scale') {
        // Hide translate and scale axis facing the camera

        const AXIS_HIDE_TRESHOLD = 0.99
        const PLANE_HIDE_TRESHOLD = 0.2
        const AXIS_FLIP_TRESHOLD = 0.0

        if (handle.name === 'X' || handle.name === 'XYZX') {
          if (
            Math.abs(this.alignVector.copy(this.unitX).applyQuaternion(quaternion).dot(this._eye)) > AXIS_HIDE_TRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === 'Y' || handle.name === 'XYZY') {
          if (
            Math.abs(this.alignVector.copy(this.unitY).applyQuaternion(quaternion).dot(this._eye)) > AXIS_HIDE_TRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === 'Z' || handle.name === 'XYZZ') {
          if (
            Math.abs(this.alignVector.copy(this.unitZ).applyQuaternion(quaternion).dot(this._eye)) > AXIS_HIDE_TRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === 'XY') {
          if (
            Math.abs(this.alignVector.copy(this.unitZ).applyQuaternion(quaternion).dot(this._eye)) < PLANE_HIDE_TRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === 'YZ') {
          if (
            Math.abs(this.alignVector.copy(this.unitX).applyQuaternion(quaternion).dot(this._eye)) < PLANE_HIDE_TRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        if (handle.name === 'XZ') {
          if (
            Math.abs(this.alignVector.copy(this.unitY).applyQuaternion(quaternion).dot(this._eye)) < PLANE_HIDE_TRESHOLD
          ) {
            handle.scale.set(1e-10, 1e-10, 1e-10)
            handle.visible = false
          }
        }

        // Flip translate and scale axis ocluded behind another axis

        if (handle.name.search('X') !== -1) {
          if (this.alignVector.copy(this.unitX).applyQuaternion(quaternion).dot(this._eye) < AXIS_FLIP_TRESHOLD) {
            if (handle.tag === 'fwd') {
              handle.visible = false
            } else {
              handle.scale.x *= -1
            }
          } else if (handle.tag === 'bwd') {
            handle.visible = false
          }
        }

        if (handle.name.search('Y') !== -1) {
          if (this.alignVector.copy(this.unitY).applyQuaternion(quaternion).dot(this._eye) < AXIS_FLIP_TRESHOLD) {
            if (handle.tag === 'fwd') {
              handle.visible = false
            } else {
              handle.scale.y *= -1
            }
          } else if (handle.tag === 'bwd') {
            handle.visible = false
          }
        }

        if (handle.name.search('Z') !== -1) {
          if (this.alignVector.copy(this.unitZ).applyQuaternion(quaternion).dot(this._eye) < AXIS_FLIP_TRESHOLD) {
            if (handle.tag === 'fwd') {
              handle.visible = false
            } else {
              handle.scale.z *= -1
            }
          } else if (handle.tag === 'bwd') {
            handle.visible = false
          }
        }
      } else if (this._mode === 'rotate') {
        // Align handles to current local or world rotation

        this.tempQuaternion2.copy(quaternion)
        this.alignVector.copy(this._eye).applyQuaternion(this.tempQuaternion.copy(quaternion).invert())

        if (handle.name.search('E') !== -1) {
          handle.quaternion.setFromRotationMatrix(this.lookAtMatrix.lookAt(this._eye, this.zeroVector, this.unitY))
        }

        if (handle.name === 'X') {
          this.tempQuaternion.setFromAxisAngle(this.unitX, Math.atan2(-this.alignVector.y, this.alignVector.z))
          this.tempQuaternion.multiplyQuaternions(this.tempQuaternion2, this.tempQuaternion)
          handle.quaternion.copy(this.tempQuaternion)
        }

        if (handle.name === 'Y') {
          this.tempQuaternion.setFromAxisAngle(this.unitY, Math.atan2(this.alignVector.x, this.alignVector.z))
          this.tempQuaternion.multiplyQuaternions(this.tempQuaternion2, this.tempQuaternion)
          handle.quaternion.copy(this.tempQuaternion)
        }

        if (handle.name === 'Z') {
          this.tempQuaternion.setFromAxisAngle(this.unitZ, Math.atan2(this.alignVector.y, this.alignVector.x))
          this.tempQuaternion.multiplyQuaternions(this.tempQuaternion2, this.tempQuaternion)
          handle.quaternion.copy(this.tempQuaternion)
        }
      }

      // Hide disabled axes
      handle.visible = handle.visible && (handle.name.indexOf('X') === -1 || this._showX)
      handle.visible = handle.visible && (handle.name.indexOf('Y') === -1 || this._showY)
      handle.visible = handle.visible && (handle.name.indexOf('Z') === -1 || this._showZ)
      handle.visible =
        handle.visible && (handle.name.indexOf('E') === -1 || (this._showX && this._showY && this._showZ))

      // highlight selected axis

      //@ts-ignore
      handle.material._opacity = handle.material._opacity || handle.material.opacity
      //@ts-ignore
      handle.material._color = handle.material._color || handle.material.color.clone()
      //@ts-ignore
      handle.material.color.copy(handle.material._color)
      //@ts-ignore
      handle.material.opacity = handle.material._opacity

      if (!this._enabled) {
        //@ts-ignore
        handle.material.opacity *= 0.5
        //@ts-ignore
        handle.material.color.lerp(new Color(1, 1, 1), 0.5)
      } else if (this._axis) {
        if (handle.name === this._axis) {
          //@ts-ignore
          handle.material.opacity = 1.0
          //@ts-ignore
          handle.material.color.lerp(new Color(1, 1, 1), 0.5)
        } else if (
          this._axis.split('').some(function (a) {
            return handle.name === a
          })
        ) {
          //@ts-ignore
          handle.material.opacity = 1.0
          //@ts-ignore
          handle.material.color.lerp(new Color(1, 1, 1), 0.5)
        } else {
          //@ts-ignore
          handle.material.opacity *= 0.25
          //@ts-ignore
          handle.material.color.lerp(new Color(1, 1, 1), 0.5)
        }
      }
    }

    super.updateMatrixWorld()
  }
}

class TransformControlsPlane extends Mesh<PlaneGeometry, MeshBasicMaterial> {
  private isTransformControlsPlane = true
  public type = 'TransformControlsPlane'

  constructor() {
    super(
      new PlaneGeometry(100000, 100000, 2, 2),
      new MeshBasicMaterial({
        visible: false,
        wireframe: true,
        side: DoubleSide,
        transparent: true,
        opacity: 0.1,
        toneMapped: false,
      }),
    )
  }

  private unitX = new Vector3(1, 0, 0)
  private unitY = new Vector3(0, 1, 0)
  private unitZ = new Vector3(0, 0, 1)

  private tempVector = new Vector3()
  private dirVector = new Vector3()
  private alignVector = new Vector3()
  private tempMatrix = new Matrix4()
  private identityQuaternion = new Quaternion()

  // these are set from parent class TransformControls
  private _cameraQuaternion = new Quaternion()

  private _worldPosition = new Vector3()
  private _worldQuaternion = new Quaternion()

  private _eye = new Vector3()

  private _axis: string | null = null
  private _mode: 'translate' | 'rotate' | 'scale' = 'translate'
  private _space = 'world'

  public updateMatrixWorld = (): void => {
    let space = this._space

    this.position.copy(this._worldPosition)

    if (this._mode === 'scale') space = 'local' // scale always oriented to local rotation

    this.unitX.set(1, 0, 0).applyQuaternion(space === 'local' ? this._worldQuaternion : this.identityQuaternion)
    this.unitY.set(0, 1, 0).applyQuaternion(space === 'local' ? this._worldQuaternion : this.identityQuaternion)
    this.unitZ.set(0, 0, 1).applyQuaternion(space === 'local' ? this._worldQuaternion : this.identityQuaternion)

    // Align the plane for current transform mode, axis and space.

    this.alignVector.copy(this.unitY)

    switch (this._mode) {
      case 'translate':
      case 'scale':
        switch (this._axis) {
          case 'X':
            this.alignVector.copy(this._eye).cross(this.unitX)
            this.dirVector.copy(this.unitX).cross(this.alignVector)
            break
          case 'Y':
            this.alignVector.copy(this._eye).cross(this.unitY)
            this.dirVector.copy(this.unitY).cross(this.alignVector)
            break
          case 'Z':
            this.alignVector.copy(this._eye).cross(this.unitZ)
            this.dirVector.copy(this.unitZ).cross(this.alignVector)
            break
          case 'XY':
            this.dirVector.copy(this.unitZ)
            break
          case 'YZ':
            this.dirVector.copy(this.unitX)
            break
          case 'XZ':
            this.alignVector.copy(this.unitZ)
            this.dirVector.copy(this.unitY)
            break
          case 'XYZ':
          case 'E':
            this.dirVector.set(0, 0, 0)
            break
        }

        break
      case 'rotate':
      default:
        // special case for rotate
        this.dirVector.set(0, 0, 0)
    }

    if (this.dirVector.length() === 0) {
      // If in rotate mode, make the plane parallel to camera
      this.quaternion.copy(this._cameraQuaternion)
    } else {
      this.tempMatrix.lookAt(this.tempVector.set(0, 0, 0), this.dirVector, this.alignVector)

      this.quaternion.setFromRotationMatrix(this.tempMatrix)
    }

    super.updateMatrixWorld()
  }
}

export { TransformControls, TransformControlsGizmo, TransformControlsPlane }
