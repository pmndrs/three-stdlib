import { Color, BoxGeometry, MeshBasicMaterial, Mesh } from 'three'
import { useEffect } from '@storybook/client-api'
import { Story, Meta } from '@storybook/react'

import { useThree } from '../setup'

import { OrbitControls } from '../../src'

export default {
  title: 'Controls/Orbit',
}

export const Default = () => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const { renderer, scene, camera, render } = useThree({
      orbit: true,
      //   useFrame: (_, delta) => {},
    })

    const geometry = new BoxGeometry(2, 2)
    const material = new MeshBasicMaterial({ wireframe: true })

    const mesh = new Mesh(geometry, material)
    scene.add(mesh)

    camera.position.set(0, 1.5, -4)
    camera.lookAt(mesh.position)
    scene.background = new Color(0x000000).convertSRGBToLinear()

    return () => {
      renderer.dispose()
    }
  }, [])

  return ''
}

Default.storyName = 'Controls'

export const Angle = ({ polarAngle, azimuthalAngle } = { polarAngle: 0, azimuthalAngle: 0 }) => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const { renderer, scene, camera, render, controls } = useThree({
      orbit: true,
      useFrame: ({ controls }) => {
        controls?.setAzimuthalAngle(azimuthalAngle)
        controls?.setPolarAngle(polarAngle)
      },
    })

    const geometry = new BoxGeometry(2, 2)
    const material = new MeshBasicMaterial({ wireframe: true })

    const mesh = new Mesh(geometry, material)
    scene.add(mesh)

    camera.position.set(0, 1.5, -4)
    camera.lookAt(mesh.position)
    scene.background = new Color(0x000000).convertSRGBToLinear()

    return () => {
      renderer.dispose()
    }
  }, [])

  return ''
}

Angle.storyName = 'Programmatic Angle'

Angle.argTypes = {
  polarAngle: { name: 'polar', control: { type: 'range', min: 0, max: 3.14 } },
  azimuthalAngle: { name: 'azimuthal', control: { type: 'range', min: 0, max: 3.14 } },
}
