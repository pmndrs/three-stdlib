import { WebGLRenderer, WebGLRenderTarget, ShaderMaterial, Vector2, IUniform, Texture } from 'three'
import { Pass, FullScreenQuad } from '../postprocessing/Pass'

/**
 * Simple underwater shader
 * 
 
 parameters:
 tex: texture
 time: this should increase with time passing
 factor: to what degree will the shader distort the screen 

 explaination:
 the shader is quite simple
 it chooses a center and start from there make pixels around it to "swell" then "shrink" then "swell"...
 this is of course nothing really similar to underwater scene
 but you can combine several this shaders together to create the effect you need...
 And yes, this shader could be used for something other than underwater effect, for example, magnifier effect :)

 * @author vergil Wang
 */

class WaterPass extends Pass {
  public material: ShaderMaterial
  public fsQuad: FullScreenQuad
  public factor: number
  public time: number
  public uniforms: {
    tex: IUniform<Texture>
    time: IUniform<number>
    factor: IUniform<number>
    resolution: IUniform<Vector2>
  }

  constructor() {
    super()
    this.uniforms = {
      tex: { value: null! },
      time: { value: 0.0 },
      factor: { value: 0.0 },
      resolution: { value: new Vector2(64, 64) },
    }
    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
      varying vec2 vUv;
      void main(){  
        vUv = uv; 
        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewPosition;
      }`,
      fragmentShader: `
      uniform float time;
      uniform float factor;
      uniform vec2 resolution;
      uniform sampler2D tex;
      varying vec2 vUv;
      void main() {  
        vec2 uv1 = vUv;
        vec2 uv = gl_FragCoord.xy/resolution.xy;
        float frequency = 6.0 * factor;
        float amplitude = 0.015 * factor;
        float x = uv1.y * frequency + time * .7; 
        float y = uv1.x * frequency + time * .3;
        uv1.x += cos(x+y) * amplitude * cos(y);
        uv1.y += sin(x-y) * amplitude * cos(y);
        vec4 rgba = texture2D(tex, uv1);
        gl_FragColor = rgba;
      }`,
    })
    this.fsQuad = new FullScreenQuad(this.material)
    this.factor = 0
    this.time = 0
  }

  public render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget): void {
    this.uniforms['tex'].value = readBuffer.texture
    this.uniforms['time'].value = this.time
    this.uniforms['factor'].value = this.factor
    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.fsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)
      if (this.clear) renderer.clear()
      this.fsQuad.render(renderer)
    }
  }
}

export { WaterPass }
