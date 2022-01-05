import { useEffect } from '@storybook/client-api'
import { AmbientLight, DirectionalLight, PointLight, SpotLight, Mesh, MeshStandardMaterial, Color } from 'three'

import { FontLoader, TextGeometry } from '../../src'

import { useThree } from '../setup'

export default {
  title: 'Geometry/TextGeometry',
}

const Default = ({ size = 1 }) => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    let mesh: Mesh | null = null

    new FontLoader().load('helvetiker_regular.typeface.json', (font) => {
      const geometry = new TextGeometry('three-stdlib', { font, size, height: 0.25 })

      geometry.rotateZ(Math.PI)
      geometry.center()

      mesh = new Mesh(geometry, new MeshStandardMaterial({ color: 'orange' }))

      scene.add(mesh)
    })

    const ambientLight = new AmbientLight('white', 0.2)
    const directionalLight = new DirectionalLight('yellow', 2)
    directionalLight.position.set(0, -5, 0)
    const pointLight1 = new PointLight('red', 0.4)
    pointLight1.position.set(-10, -10, 10)
    const pointLight2 = new PointLight('white', 0.2)
    pointLight2.position.set(-10, -10, 10)
    const spotLight = new SpotLight('white', 2, 35, Math.PI / 4, 2, 3.5)
    spotLight.position.set(-3, 6, -4)

    const { scene, renderer } = useThree({
      useFrame: (_, delta) => {
        if (mesh) mesh.rotation.x += delta
      },
    })

    scene.background = new Color('grey').convertSRGBToLinear()
    scene.add(ambientLight, directionalLight, pointLight1, pointLight2, spotLight)

    return () => {
      renderer.dispose()
    }
  }, [])

  return ''
}

export { Default }
