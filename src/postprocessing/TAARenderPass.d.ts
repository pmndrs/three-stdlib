import { Scene, Camera, ColorRepresentation } from 'three'

import { SSAARenderPass } from './SSAARenderPass'

export class TAARenderPass extends SSAARenderPass {
  constructor(scene: Scene, camera: Camera, clearColor: ColorRepresentation, clearAlpha: number)
  accumulate: boolean
}
