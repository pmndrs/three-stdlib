import WebGPUBinding from './WebGPUBinding'
import { GPUBindingType } from './constants'

class WebGPUSampler extends WebGPUBinding {
  constructor(name, texture) {
    super(name)

    this.texture = texture

    this.type = GPUBindingType.Sampler
    this.visibility = GPUShaderStage.FRAGMENT

    this.samplerGPU = null // set by the renderer

    Object.defineProperty(this, 'isSampler', { value: true })
  }
}

export default WebGPUSampler
