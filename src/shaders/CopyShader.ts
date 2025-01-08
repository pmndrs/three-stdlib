/**
 * Full-screen textured quad shader
 */

import type { IUniform, Texture } from 'three'
import type { IShader } from './types'

export type CopyShaderUniforms = {
  opacity: IUniform<number>
  tDiffuse: IUniform<Texture | null>
}

export interface ICopyShader extends IShader<CopyShaderUniforms> {}

export const CopyShader: ICopyShader = {
  uniforms: {
    tDiffuse: { value: null },
    opacity: { value: 1.0 },
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {

    	vUv = uv;
    	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    }
  `,

  fragmentShader: /* glsl */ `
    uniform float opacity;

    uniform sampler2D tDiffuse;

    varying vec2 vUv;

    void main() {

    	vec4 texel = texture2D( tDiffuse, vUv );
    	gl_FragColor = opacity * texel;

    }
  `,
}
