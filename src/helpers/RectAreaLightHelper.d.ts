import { Line, RectAreaLight, ColorRepresentation } from 'three'

export class RectAreaLightHelper extends Line {
  readonly type: 'RectAreaLightHelper'
  constructor(light: RectAreaLight, color?: ColorRepresentation)

  light: RectAreaLight
  color: ColorRepresentation | undefined

  dispose(): void
}
