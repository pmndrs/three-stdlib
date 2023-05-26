import { Mesh, BufferGeometry, Color, TextureEncoding, WebGLRenderTarget, PerspectiveCamera } from 'three'

export interface ReflectorOptions {
  color?: Color | string | number
  textureWidth?: number
  textureHeight?: number
  clipBias?: number
  shader?: object
  encoding?: TextureEncoding
  multisample?: number
}

export class Reflector extends Mesh {
  type: 'Reflector'
  camera: PerspectiveCamera

  constructor(geometry?: BufferGeometry, options?: ReflectorOptions)

  getRenderTarget(): WebGLRenderTarget

  dispose(): void
}
