import { Color, BoxGeometry, MeshBasicMaterial, Mesh } from 'three'
import { useEffect } from '@storybook/client-api'

import { useThree } from '../setup'

import { OrbitControls } from '../../src'

type Args = {
  azimuthalAngle?: number
  enabled?: boolean
  polarAngle?: number
}

const Template: {
  (args: Args): string
  args?: Args
  storyName?: string
} = ({ azimuthalAngle = 0, enabled = true, polarAngle = 0 }) => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const { renderer, scene, camera } = useThree({
      useFrame: () => {
        if (controls && enabled) {
          controls.update()
        }
        if (!enabled && controls) {
          controls.setAzimuthalAngle(azimuthalAngle * Math.PI)
          controls.setPolarAngle(polarAngle * Math.PI)
        }
      },
    })

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enabled = enabled
    controls.enableDamping = true

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
  }, [enabled, azimuthalAngle, polarAngle])

  return ''
}

export const Default = Template.bind({})
Default.args = { azimuthalAngle: 0, enabled: true, polarAngle: 0 }

export default {
  title: 'Controls/Orbit',
  argTypes: {
    enabled: {
      name: 'enabled',
      control: {
        type: 'boolean',
      },
    },
    polarAngle: { name: 'polar', control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    azimuthalAngle: { name: 'azimuthal', control: { type: 'range', min: 0, max: 1, step: 0.01 } },
  },
}

export const ProgrammaticAngle = Template.bind({})
ProgrammaticAngle.args = { azimuthalAngle: 0, enabled: false, polarAngle: 0 }
ProgrammaticAngle.storyName = 'Programmatic Angle'
