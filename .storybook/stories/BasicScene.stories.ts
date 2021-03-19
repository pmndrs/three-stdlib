import {
  AmbientLight,
  DirectionalLight,
  PointLight,
  SpotLight,
  Mesh,
  IcosahedronBufferGeometry,
  MeshStandardMaterial,
  Color,
} from 'three'
import { useEffect } from '@storybook/client-api'

import { useThree } from '../setup'

export default {
  title: 'Basic/Scene',
}

export const Default = () => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const mesh = new Mesh(new IcosahedronBufferGeometry(1), new MeshStandardMaterial({ color: 'pink' }))

    const ambientLight = new AmbientLight('white', 0.2)
    const directionalLight = new DirectionalLight('pink', 2)
    directionalLight.position.set(0, -5, 0)
    const pointLight1 = new PointLight('pink', 0.4)
    pointLight1.position.set(-10, -10, 10)
    const pointLight2 = new PointLight('white', 0.2)
    pointLight2.position.set(-10, -10, 10)
    const spotLight = new SpotLight('white', 2, 35, Math.PI / 4, 2, 3.5)
    spotLight.position.set(-3, 6, -4)

    const { scene, renderer } = useThree({
      useFrame: (_, delta) => {
        mesh.rotation.x += delta
        mesh.rotation.y += delta
      },
    })

    scene.background = new Color(0x0000ff).convertSRGBToLinear()
    scene.add(ambientLight, directionalLight, pointLight1, pointLight2, spotLight, mesh)

    return () => {
      renderer.dispose()
    }
  }, [])

  return ''
}
