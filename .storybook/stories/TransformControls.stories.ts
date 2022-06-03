import { Color, BoxGeometry, MeshBasicMaterial, Mesh } from 'three'
import { useEffect } from '@storybook/client-api'

import { useThree } from '../setup'

import { TransformControls } from '../../src'

export default {
  title: 'Controls/Transform',
}

function onEscKey(e: KeyboardEvent, controls: TransformControls) {
  controls.reset()
}

export const Default = () => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const { renderer, scene, camera, render } = useThree({
      // @ts-ignore
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
    camera.position.set(0, 1.5, -4)
    camera.lookAt(mesh.position)
    scene.background = new Color(0x000000).convertSRGBToLinear()

    const cb = (e: KeyboardEvent) => e.key === 'Escape' && control.reset()
    document.addEventListener('keydown', cb)

    return () => {
      document.removeEventListener('keydown', cb)
      renderer.dispose()
    }
  }, [])

  return ''
}
Default.storyName = 'Translate'

export const RotateStory = () => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const { renderer, scene, camera, render } = useThree({
      //   useFrame: (_, delta) => {},
    })

    const geometry = new BoxGeometry(2, 2)
    const material = new MeshBasicMaterial({ wireframe: true })

    const control = new TransformControls(camera, renderer.domElement)
    control.addEventListener('change', render)

    const mesh = new Mesh(geometry, material)
    scene.add(mesh)
    control.attach(mesh)
    control.setMode('rotate')
    scene.add(control)
    camera.position.set(0, 1.5, -4)
    camera.lookAt(mesh.position)
    scene.background = new Color(0x000000).convertSRGBToLinear()

    const cb = (e: KeyboardEvent) => e.key === 'Escape' && control.reset()
    document.addEventListener('keydown', cb)

    return () => {
      document.removeEventListener('keydown', cb)
      renderer.dispose()
    }
  }, [])

  return ''
}
RotateStory.storyName = 'Rotate'

export const ScaleStory = () => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const { renderer, scene, camera, render } = useThree({
      // @ts-ignore
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
    control.setMode('scale')
    scene.add(control)
    camera.position.set(0, 1.5, -4)
    camera.lookAt(mesh.position)
    scene.background = new Color(0x000000).convertSRGBToLinear()

    const cb = (e: KeyboardEvent) => e.key === 'Escape' && control.reset()
    document.addEventListener('keydown', cb)

    return () => {
      document.removeEventListener('keydown', cb)
      renderer.dispose()
    }
  }, [])

  return ''
}
ScaleStory.storyName = 'Scale'
