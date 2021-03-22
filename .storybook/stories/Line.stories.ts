import { Color, CatmullRomCurve3, Vector3, Scene, Vector2 } from 'three'
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
    const { scene, renderer } = useThree()

    // Position and THREE.Color Data

    const positions = []
    const colors = []

    const points = hilbert3D(new Vector3(0, 0, 0), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7)

    const spline = new CatmullRomCurve3(points)
    const divisions = Math.round(12 * points.length)
    const point = new Vector3()
    const color = new Color()

    console.log(spline)

    for (let i = 0, l = divisions; i < l; i++) {
      const t = i / l

      spline.getPoint(t, point)
      positions.push(point.x, point.y, point.z)

      color.setHSL(t, 1.0, 0.5)
      colors.push(color.r, color.g, color.b)
    }

    const geometry = new LineGeometry()
    geometry.setPositions(positions)
    geometry.setColors(colors)

    const matLine = new LineMaterial({
      color: 0xffffff,
      linewidth: 5, // in pixels
      vertexColors: true,
      resolution: new Vector2(window.innerWidth, window.innerHeight),
      dashed: false,
    })

    const line = new Line2(geometry, matLine)
    line.computeLineDistances()
    line.scale.set(1, 1, 1)

    scene.add(line)

    return () => {
      renderer.dispose()
    }
  }, [])

  return ''
}
