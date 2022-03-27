import type { IUniform } from 'three';

export interface IShader<U extends { [key: string]: IUniform }> {
  defines?: {
    [key: string]: any
  }
  fragmentShader: string
  uniforms: U
  vertexShader: string
}
