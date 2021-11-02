import { Color, CatmullRomCurve3, Vector3, Scene, Vector2 } from 'three'
import { useEffect } from '@storybook/client-api'

import { useThree } from '../setup'

//@ts-ignore
import { hilbert3D, Line2, LineMaterial, LineGeometry } from '../../src'

type TemplateProps = {
  dashed: boolean
  opacity: number
  useColorAlpha: boolean
  useVertexColors: boolean
}

export default {
  title: 'Geometry/Line',
  argTypes: {
    dashed: {
      name: 'dashed',
      control: {
        type: 'boolean',
      },
      defaultValue: true,
    },
    opacity: {
      name: 'opacity',
      control: {
        type: 'number',
        min: 0,
        max: 1,
        step: 0.1,
      },
      defaultValue: 1,
    },
    useVertexColors: {
      name: 'useVertexColors',
      control: {
        type: 'boolean',
      },
      defaultValue: true,
    },
    useColorAlpha: {
      name: 'useColorAlpha',
      control: {
        type: 'boolean',
      },
      defaultValue: true,
    },
  },
}

const Template = (props: TemplateProps) => {
  // must run in this so the canvas has mounted in the iframe & can be accessed by `three`
  useEffect(() => {
    const { scene, renderer } = useThree()
    const line = prepareLine(props)
    scene.add(line)

    return () => {
      renderer.dispose()
    }
  }, [props])

  return ''
}

export const Line = Template.bind({})

function prepareLine({ dashed, opacity, useColorAlpha, useVertexColors }: TemplateProps): Line2 {
  const positions = []
  const colors = []

  const points = hilbert3D(new Vector3(0, 0, 0), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7)

  const spline = new CatmullRomCurve3(points)
  const divisions = Math.round(12 * points.length)
  const point = new Vector3()
  const color = new Color()

  for (let i = 0, l = divisions; i < l; i++) {
    const t = i / l

    spline.getPoint(t, point)
    positions.push(point.x, point.y, point.z)

    color.setHSL(t, 1.0, 0.5)
    if (useColorAlpha) {
      colors.push(color.r, color.g, color.b, Math.sin(i) / 2 + 0.5)
    } else {
      colors.push(color.r, color.g, color.b)
    }
  }

  const geometry = new LineGeometry()
  geometry.setPositions(positions)
  geometry.setColors(colors, useColorAlpha ? 4 : 3)

  const transparent = useColorAlpha ? true : opacity < 1

  const matLine = new LineMaterial({
    color: useVertexColors ? 0xffffff : 0xff0000,
    linewidth: 5, // in pixels
    vertexColors: useVertexColors,
    resolution: new Vector2(window.innerWidth, window.innerHeight),
    dashed,
    transparent,
    opacity,
  })
  if (useColorAlpha) {
    matLine.defines.USE_COLOR_ALPHA = ''
    matLine.defines.USE_COLOR = ''
  } else if (useVertexColors) {
    //   TODO: It seems this uniform is not set even if vertexColors is passed as true to Material
    matLine.defines.USE_COLOR = ''
  }

  const line = new Line2(geometry, matLine)
  line.computeLineDistances()
  line.scale.set(0.1, 0.1, 0.1)

  return line
}
