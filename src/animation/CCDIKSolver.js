import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Line,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three'

class CCDIKHelper extends Object3D {
  _m = new Matrix4()
  _v = new Vector3()

  constructor(mesh, iks = [], sphereSize = 0.25) {
    super()

    this.root = mesh
    this.iks = iks

    this.matrix.copy(mesh.matrixWorld)
    this.matrixAutoUpdate = false

    this.sphereGeometry = new SphereGeometry(sphereSize, 16, 8)

    this.targetSphereMaterial = new MeshBasicMaterial({
      color: new Color(0xff8888),
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })

    this.effectorSphereMaterial = new MeshBasicMaterial({
      color: new Color(0x88ff88),
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })

    this.linkSphereMaterial = new MeshBasicMaterial({
      color: new Color(0x8888ff),
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })

    this.lineMaterial = new LineBasicMaterial({
      color: new Color(0xff0000),
      depthTest: false,
      depthWrite: false,
      transparent: true,
    })

    function createLineGeometry(ik) {
      const geometry = new BufferGeometry()
      const vertices = new Float32Array((2 + ik.links.length) * 3)
      geometry.setAttribute('position', new BufferAttribute(vertices, 3))

      return geometry
    }

    const scope = this
    function createTargetMesh() {
      return new Mesh(scope.sphereGeometry, scope.targetSphereMaterial)
    }

    function createEffectorMesh() {
      return new Mesh(scope.sphereGeometry, scope.effectorSphereMaterial)
    }

    function createLinkMesh() {
      return new Mesh(scope.sphereGeometry, scope.linkSphereMaterial)
    }

    function createLine(ik) {
      return new Line(createLineGeometry(ik), scope.lineMaterial)
    }

    for (let i = 0, il = iks.length; i < il; i++) {
      const ik = iks[i]

      this.add(createTargetMesh())
      this.add(createEffectorMesh())

      for (let j = 0, jl = ik.links.length; j < jl; j++) {
        this.add(createLinkMesh())
      }

      this.add(createLine(ik))
    }
  }

  _getPosition(bone, matrixWorldInv) {
    return this._v.setFromMatrixPosition(bone.matrixWorld).applyMatrix4(matrixWorldInv)
  }

  _setPositionOfBoneToAttributeArray(array, index, bone, matrixWorldInv) {
    const v = this._getPosition(bone, matrixWorldInv)

    array[index * 3 + 0] = v.x
    array[index * 3 + 1] = v.y
    array[index * 3 + 2] = v.z
  }

  updateMatrixWorld(force) {
    const mesh = this.root

    if (this.visible) {
      let offset = 0

      const iks = this.iks
      const bones = mesh.skeleton.bones

      this._m.copy(mesh.matrixWorld).invert()

      for (let i = 0, il = iks.length; i < il; i++) {
        const ik = iks[i]

        const targetBone = bones[ik.target]
        const effectorBone = bones[ik.effector]

        const targetMesh = this.children[offset++]
        const effectorMesh = this.children[offset++]

        targetMesh.position.copy(this._getPosition(targetBone, this._m))
        effectorMesh.position.copy(this._getPosition(effectorBone, this._m))

        for (let j = 0, jl = ik.links.length; j < jl; j++) {
          const link = ik.links[j]
          const linkBone = bones[link.index]

          const linkMesh = this.children[offset++]

          linkMesh.position.copy(this._getPosition(linkBone, this._m))
        }

        const line = this.children[offset++]
        const array = line.geometry.attributes.position.array

        this._setPositionOfBoneToAttributeArray(array, 0, targetBone, this._m)
        this._setPositionOfBoneToAttributeArray(array, 1, effectorBone, this._m)

        for (let j = 0, jl = ik.links.length; j < jl; j++) {
          const link = ik.links[j]
          const linkBone = bones[link.index]
          this._setPositionOfBoneToAttributeArray(array, j + 2, linkBone, this._m)
        }

        line.geometry.attributes.position.needsUpdate = true
      }
    }

    this.matrix.copy(mesh.matrixWorld)

    super.updateMatrixWorld(force)
  }
}

/**
 * CCD Algorithm
 *  - https://sites.google.com/site/auraliusproject/ccd-algorithm
 *
 * // ik parameter example
 * //
 * // target, effector, index in links are bone index in skeleton.bones.
 * // the bones relation should be
 * // <-- parent                                  child -->
 * // links[ n ], links[ n - 1 ], ..., links[ 0 ], effector
 * iks = [ {
 *	target: 1,
 *	effector: 2,
 *	links: [ { index: 5, limitation: new Vector3( 1, 0, 0 ) }, { index: 4, enabled: false }, { index : 3 } ],
 *	iteration: 10,
 *	minAngle: 0.0,
 *	maxAngle: 1.0,
 * } ];
 */

class CCDIKSolver {
  q = new Quaternion()
  targetPos = new Vector3()
  targetVec = new Vector3()
  effectorPos = new Vector3()
  effectorVec = new Vector3()
  linkPos = new Vector3()
  invLinkQ = new Quaternion()
  linkScale = new Vector3()
  axis = new Vector3()
  vector = new Vector3()

  constructor(mesh, iks) {
    this.mesh = mesh
    this.iks = iks

    const bones = this.mesh.skeleton.bones

    for (let i = 0, il = this.iks.length; i < il; i++) {
      const ik = this.iks[i]
      const effector = bones[ik.effector]
      const links = ik.links
      let link0, link1

      link0 = effector

      for (let j = 0, jl = links.length; j < jl; j++) {
        link1 = bones[links[j].index]

        if (link0.parent !== link1) {
          console.warn(`THREE.CCDIKSolver: bone ${link0.name} is not the child of bone ${link1.name}`)
        }

        link0 = link1
      }
    }
  }

  update() {
    const bones = this.mesh.skeleton.bones
    const iks = this.iks

    // for reference overhead reduction in loop
    const math = Math

    for (let i = 0, il = iks.length; i < il; i++) {
      const ik = iks[i]
      const effector = bones[ik.effector]
      const target = bones[ik.target]

      // don't use getWorldPosition() here for the performance
      // because it calls updateMatrixWorld( true ) inside.
      this.targetPos.setFromMatrixPosition(target.matrixWorld)

      const links = ik.links
      const iteration = ik.iteration !== undefined ? ik.iteration : 1

      for (let j = 0; j < iteration; j++) {
        let rotated = false

        for (let k = 0, kl = links.length; k < kl; k++) {
          const link = bones[links[k].index]

          // skip this link and following links.
          // this skip is used for MMD performance optimization.
          if (links[k].enabled === false) break

          const limitation = links[k].limitation
          const rotationMin = links[k].rotationMin
          const rotationMax = links[k].rotationMax

          // don't use getWorldPosition/Quaternion() here for the performance
          // because they call updateMatrixWorld( true ) inside.
          link.matrixWorld.decompose(this.linkPos, this.invLinkQ, this.linkScale)
          this.invLinkQ.invert()
          this.effectorPos.setFromMatrixPosition(effector.matrixWorld)

          // work in link world
          this.effectorVec.subVectors(this.effectorPos, this.linkPos)
          this.effectorVec.applyQuaternion(this.invLinkQ)
          this.effectorVec.normalize()

          this.targetVec.subVectors(this.targetPos, this.linkPos)
          this.targetVec.applyQuaternion(this.invLinkQ)
          this.targetVec.normalize()

          let angle = this.targetVec.dot(this.effectorVec)

          if (angle > 1.0) {
            angle = 1.0
          } else if (angle < -1.0) {
            angle = -1.0
          }

          angle = math.acos(angle)

          // skip if changing angle is too small to prevent vibration of bone
          // Refer to http://www20.atpages.jp/katwat/three.js_r58/examples/mytest37/mmd.three.js
          if (angle < 1e-5) continue

          if (ik.minAngle !== undefined && angle < ik.minAngle) {
            angle = ik.minAngle
          }

          if (ik.maxAngle !== undefined && angle > ik.maxAngle) {
            angle = ik.maxAngle
          }

          this.axis.crossVectors(this.effectorVec, this.targetVec)
          this.axis.normalize()

          this.q.setFromAxisAngle(this.axis, angle)
          link.quaternion.multiply(this.q)

          // TODO: re-consider the limitation specification
          if (limitation !== undefined) {
            let c = link.quaternion.w

            if (c > 1.0) c = 1.0

            const c2 = math.sqrt(1 - c * c)
            link.quaternion.set(limitation.x * c2, limitation.y * c2, limitation.z * c2, c)
          }

          if (rotationMin !== undefined) {
            link.rotation.setFromVector3(this.vector.setFromEuler(link.rotation).max(rotationMin))
          }

          if (rotationMax !== undefined) {
            link.rotation.setFromVector3(this.vector.setFromEuler(link.rotation).min(rotationMax))
          }

          link.updateMatrixWorld(true)

          rotated = true
        }

        if (!rotated) break
      }
    }

    return this
  }

  createHelper() {
    return new CCDIKHelper(this.mesh, this.mesh.geometry.userData.MMD.iks)
  }
}

export { CCDIKSolver, CCDIKHelper }
