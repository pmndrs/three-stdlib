import { Color, BoxGeometry, MeshBasicMaterial, Mesh } from 'three'
import { useEffect } from '@storybook/client-api'

import { useThree } from '../setup'

import { OrbitControls } from '../../src'

type TemplateProps = {
  polarAngle: number
  azimuthalAngle: number
  enabled: boolean
}

const Template = (props: TemplateProps) => {
  const { polarAngle = 0, azimuthalAngle = 0, enabled } = props
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const { renderer, scene, camera } = useThree({
      useFrame: () => {
        if (controls && enabled) {
          controls.update()
        }
        if (!enabled && controls) {
          controls.setAzimuthalAngle(azimuthalAngle)
          controls.setPolarAngle(polarAngle)
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
// Default.args = { enabled: true }

export default {
  title: 'Controls/Orbit',
  argTypes: {
    enabled: {
      name: 'enabled',
      control: {
        type: 'boolean',
      },
      defaultValue: true,
    },
    polarAngle: { name: 'polar', control: { type: 'range', min: 0, max: 3.14, step: 0.01 }, defaultValue: 0 },
    azimuthalAngle: { name: 'azimuthal', control: { type: 'range', min: 0, max: 3.14, step: 0.01 }, defaultValue: 0 },
  },
}

export const Angle = Template.bind({})
Angle.args = {
  enabled: false,
}
Angle.storyName = 'Programmatic Angle'

// export default {
//   title: 'Controls/Orbit',
//   component: Angle,
//   argTypes: {
//     polarAngle: { name: 'polar', control: { type: 'range', min: 0, max: 3.14, step: 0.01 } },
//     azimuthalAngle: { name: 'azimuthal', control: { type: 'range', min: 0, max: 3.14, step: 0.01 } },
//   },
// }
