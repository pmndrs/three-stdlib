import { Mesh, BufferGeometry, ColorRepresentation, TextureEncoding, WebGLRenderTarget } from 'three'

export interface RefractorOptions {
  color?: ColorRepresentation
  textureWidth?: number
  textureHeight?: number
  clipBias?: number
  shader?: object
  encoding?: TextureEncoding
  multisample?: number
}

export class Refractor extends Mesh {
  constructor(geometry?: BufferGeometry, options?: RefractorOptions)

  getRenderTarget(): WebGLRenderTarget

  dispose(): void
}
