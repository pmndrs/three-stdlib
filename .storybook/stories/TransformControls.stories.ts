import { Color, BoxGeometry, MeshBasicMaterial, Mesh } from 'three'
import { useEffect } from '@storybook/client-api'

import { useThree } from '../setup'

import { TransformControls } from '../../src'

export default {
  title: 'Controls/Transform',
}

export const Default = () => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const { renderer, scene, camera, render } = useThree({
      orbit: false,
      //   useFrame: (_, delta) => {},
    })

    const geometry = new BoxGeometry(2, 2)
    const material = new MeshBasicMaterial({ wireframe: true })

    const control = new TransformControls(camera, renderer.domElement)
    control.addEventListener('change', render)

    const mesh = new Mesh(geometry, material)
    scene.add(mesh)

    control.attach(mesh)
    scene.add(control)

    scene.background = new Color(0x000000).convertSRGBToLinear()

    return () => {
      renderer.dispose()
    }
  }, [])

  return ''
}
