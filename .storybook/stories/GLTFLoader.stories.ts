import { DirectionalLight, Group } from 'three'
import { useEffect } from '@storybook/client-api'

import { useThree } from '../setup'

import { GLTFLoader, DRACOLoader, KTX2Loader, MeshoptDecoder } from '../../src'

export default {
  title: 'Loaders/GLTFLoader',
}

type Args = {}

export const Default = () => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    let suzanne: Group
    const { renderer, scene, camera } = useThree({
      useFrame: () => {
        if (suzanne) {
          suzanne.rotation.y += 0.005
          suzanne.rotation.z += 0.01
        }
      },
    })

    const loader = new GLTFLoader()

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.3/')
    loader.setDRACOLoader(dracoLoader)

    loader.load('/models/DamagedHelmet/glTF/DamagedHelmet.gltf', (obj) => {
      console.log(obj)
      suzanne = obj.scene
      // suzanne.children[0].geometry.center()
      scene.add(suzanne)
    })

    const dirLight = new DirectionalLight()
    dirLight.position.set(-4, 3, 4)
    scene.add(dirLight)

    camera.position.z = 4
    camera.lookAt(0, 0, 0)

    return () => {
      renderer.dispose()
    }
  }, [])

  return ''
}

Default.storyName = 'Default'

export const RotateStory = () => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    let perseverance: Group
    const { renderer, scene, camera } = useThree({
      useFrame: () => {
        if (perseverance) {
          perseverance.rotation.y += 0.005
          perseverance.rotation.z += 0.01
        }
      },
    })
    const loader = new GLTFLoader()

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.3/')
    loader.setDRACOLoader(dracoLoader)

    const ktx2Loader = new KTX2Loader()
      .detectSupport(renderer)
      .setTranscoderPath('https://threejs.org/examples/js/libs/basis/')

    loader.setKTX2Loader(ktx2Loader)
    const a = MeshoptDecoder()
    console.log(a)

    loader.setMeshoptDecoder(a)

    loader.load('/models/Perseverance/Perseverance.glb', (obj) => {
      console.log(obj)
      perseverance = obj.scene
      // perseverance.children[0].geometry.center()
      scene.add(perseverance)
    })

    const dirLight = new DirectionalLight()
    dirLight.position.set(-4, 3, 4)
    scene.add(dirLight)

    camera.position.z = 4
    camera.lookAt(0, 0, 0)

    return () => {
      renderer.dispose()
      ktx2Loader.dispose()
    }
  }, [])

  return ''
}
RotateStory.storyName = 'Compressed'
