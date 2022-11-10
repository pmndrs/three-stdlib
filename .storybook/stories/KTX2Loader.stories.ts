import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'
import { useEffect } from '@storybook/client-api'

import { useThree } from '../setup'

import { KTX2Loader } from '../../src'

type Args = {}

const Template: {
  (args: Args): string
  args?: Args
  storyName?: string
} = () => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const { renderer, scene, camera } = useThree()

    const loader = new KTX2Loader()
      .detectSupport(renderer)
      .setTranscoderPath('https://threejs.org/examples/js/libs/basis/')

    // /textures/colors.ktx2
    // https://threejs.org/examples/textures/compressed/sample_uastc_zstd.ktx2
    loader.load('/textures/colors.ktx2', (texture) => {
      const geometry = new PlaneGeometry()
      const material = new MeshBasicMaterial({
        map: texture,
        side: DoubleSide,
      })
      const plane = new Mesh(geometry, material)
      plane.rotation.y = Math.PI
      plane.rotation.z = Math.PI
      scene.add(plane)
    })

    camera.position.z = 4
    camera.lookAt(0, 0, 0)

    return () => {
      renderer.dispose()
    }
  }, [])

  return ''
}

export const Default = Template.bind({})

export default {
  title: 'Loaders/KTX2Loader',
  argTypes: {},
}
