import { BufferAttribute, Color } from 'three'

export type TUniform<TValue = any> = {
  type?: string
  value: TValue
}

export type GenericUniforms = { [key: string]: TUniform<any> }

export type GenericAttibutes = { [key: string]: BufferAttribute }

export type GenericShader<TShaderUniforms = GenericUniforms> = {
  defines?: {
    [key: string]: any
  }
  uniforms?: TShaderUniforms
  fragmentShader: string
  vertexShader: string
}

export type ColorOptions = Color | string | number

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array

export type TypedArrayConstructors =
  | Int8Array['constructor']
  | Uint8Array['constructor']
  | Uint8ClampedArray['constructor']
  | Int16Array['constructor']
  | Uint16Array['constructor']
  | Int32Array['constructor']
  | Uint32Array['constructor']
  | Float32Array['constructor']
  | Float64Array['constructor']
