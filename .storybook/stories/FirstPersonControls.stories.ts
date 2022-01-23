import { Color, BoxGeometry, MeshBasicMaterial, Mesh } from 'three'
import { useEffect } from '@storybook/client-api'

import { useThree } from '../setup'

import { FirstPersonControls } from '../../src'

const Template = ({ enabled = true }) => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const { renderer, scene, camera } = useThree({
      useFrame: (_, deltaTime) => {
        controls?.update(deltaTime)
      },
    })

    const controls = new FirstPersonControls(camera)
    controls.enabled = enabled
    controls.connect(renderer.domElement)

    const geometry = new BoxGeometry(2, 2)
    const material = new MeshBasicMaterial({ wireframe: true })

    const mesh = new Mesh(geometry, material)
    scene.add(mesh)

    camera.position.set(0, 1.5, -4)
    camera.lookAt(mesh.position)
    scene.background = new Color(0x000000).convertSRGBToLinear()

    return () => {
      controls.dispose()
      renderer.dispose()
    }
  }, [enabled])

  return ''
}

export const Default = Template.bind({})

export default {
  title: 'Controls/FirstPerson',
  argTypes: {
    enabled: {
      name: 'enabled',
      control: {
        type: 'boolean',
      },
      defaultValue: true,
    },
  },
}
