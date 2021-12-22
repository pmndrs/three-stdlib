import { Color, BoxGeometry, MeshBasicMaterial, Mesh } from 'three'
import { useEffect } from '@storybook/client-api'

import { useThree } from '../setup'

import { PointerLockControls } from '../../src'

export const Default = () => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const { renderer, scene, camera } = useThree({})

    const controls = new PointerLockControls(camera, renderer.domElement)

    const geometry = new BoxGeometry(2, 2)
    const material = new MeshBasicMaterial({ wireframe: true })

    const mesh = new Mesh(geometry, material)
    scene.add(mesh)

    camera.position.set(0, 1.5, -4)
    camera.lookAt(mesh.position)
    scene.background = new Color(0x000000).convertSRGBToLinear()

    renderer.domElement.addEventListener('click', function () {
      controls.lock()
    })

    return () => {
      renderer.dispose()
    }
  }, [])

  return ''
}

export default {
  title: 'Controls/PointerLock',
}
