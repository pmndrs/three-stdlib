import { Line, RectAreaLight, ColorRepresentation } from 'three'

export class RectAreaLightHelper extends Line {
  constructor(light: RectAreaLight, color?: ColorRepresentation)

  light: RectAreaLight
  color: ColorRepresentation | undefined

  dispose(): void
}
