import type { IUniform, Shader } from 'three'

type Defines = { [key: string]: boolean | number | string }
type Uniforms = { [key: string]: IUniform }

export interface IShader<U extends Uniforms, D extends Defines | undefined = undefined> extends Shader {
  defines?: D
  fragmentShader: string
  uniforms: U
  vertexShader: string
}
