import {
  AmbientLight,
  Mesh,
  MeshStandardMaterial,
  PlaneBufferGeometry,
  DoubleSide,
  CompressedTexture,
  LoadingManager,
} from 'three'
import { KTX2Loader } from '../../src'
import { useEffect } from '@storybook/client-api'

import { useThree } from '../setup'

export default {
  title: 'Loaders/KTX2Loader',
}

export const Default = () => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const { scene, renderer } = useThree()

    const manager = new LoadingManager()
    const loader = new KTX2Loader(manager)
    loader.setTranscoderPath('/basis/')
    loader.detectSupport(renderer)
    loader.load('/sample_etc1s.ktx2', (texture: CompressedTexture) => {
      const geometry = new PlaneBufferGeometry(2, 2)
      const material = new MeshStandardMaterial({
        map: texture,
        side: DoubleSide,
      })
      const plane = new Mesh(geometry, material)
      plane.position.set(0, 0, 0)

      const ambientLight = new AmbientLight('white', 1)
      scene.add(ambientLight, plane)
    })

    return () => {
      renderer.dispose()
    }
  }, [])

  return ''
}

export const MultipleLoaderInstances = () => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const { scene, renderer } = useThree()

    const manager = new LoadingManager()
    const loader1 = new KTX2Loader(manager)
    loader1.setTranscoderPath('/basis/')
    loader1.detectSupport(renderer)
    loader1.load('/sample_etc1s.ktx2', (texture: CompressedTexture) => {
      const geometry = new PlaneBufferGeometry(2, 2)
      const material = new MeshStandardMaterial({
        map: texture,
        side: DoubleSide,
      })
      const plane = new Mesh(geometry, material)
      plane.position.set(1, 0, 0)

      const ambientLight = new AmbientLight('white', 1)
      scene.add(ambientLight, plane)
    })

    const loader2 = new KTX2Loader(manager)
    loader2.setTranscoderPath('/basis/')
    loader2.detectSupport(renderer)
    loader2.load('/sample_uastc_zstd.ktx2', (texture: CompressedTexture) => {
      const geometry = new PlaneBufferGeometry(2, 2)
      const material = new MeshStandardMaterial({
        map: texture,
        side: DoubleSide,
      })
      const plane = new Mesh(geometry, material)
      plane.position.set(-1, 0, 0)

      const ambientLight = new AmbientLight('white', 1)
      scene.add(ambientLight, plane)
    })

    return () => {
      renderer.dispose()
    }
  }, [])

  return ''
}
