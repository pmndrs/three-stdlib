export type TUniform<TValue = any> = {
  type?: string
  value: TValue
}

export type GenericUniforms = { [key: string]: TUniform<any> }

export type GenericShader<TShaderUniforms = GenericUniforms> = {
  defines?: {
    [key: string]: any
  }
  uniforms?: TShaderUniforms
  fragmentShader: string
  vertexShader: string
}
