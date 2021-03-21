import { Color, AmbientLight, DirectionalLight, PointLight, SpotLight, Vector3 } from 'three'
import { useEffect } from '@storybook/client-api'

import { useThree } from '../setup'

//@ts-ignore
import { hilbert3D, Line2, LineMaterial, LineGeometry } from '../../src'

export default {
  title: 'Geometry/Line',
}

export const Default = () => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    console.log('calling effect')
    const points = hilbert3D(new Vector3(0), 5).map((p: Vector3) => [p.x, p.y, p.z]) as [number, number, number][]

    const lineGeometry = new LineGeometry()
    const pValues = points.map((p) => (p instanceof Vector3 ? p.toArray() : p))
    lineGeometry.setPositions(pValues.flat())

    const line2 = new Line2(
      lineGeometry,
      new LineMaterial({
        color: 'red',
        lineWidth: 3,
      }),
    )
    line2.computeLineDistances()

    const ambientLight = new AmbientLight('white', 0.2)
    const directionalLight = new DirectionalLight('pink', 2)
    directionalLight.position.set(0, -5, 0)
    const pointLight1 = new PointLight('pink', 0.4)
    pointLight1.position.set(-10, -10, 10)
    const pointLight2 = new PointLight('white', 0.2)
    pointLight2.position.set(-10, -10, 10)
    const spotLight = new SpotLight('white', 2, 35, Math.PI / 4, 2, 3.5)
    spotLight.position.set(-3, 6, -4)

    const { renderer, scene } = useThree({
      // useFrame: (_, delta) => {},
    })

    scene.background = new Color(0x000000).convertSRGBToLinear()
    scene.add(ambientLight, directionalLight, pointLight1, pointLight2, spotLight, line2)

    return () => {
      renderer.dispose()
    }
  }, [])

  return ''
}
