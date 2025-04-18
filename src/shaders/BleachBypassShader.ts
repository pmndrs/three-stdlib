/**
 * Bleach bypass shader [http://en.wikipedia.org/wiki/Bleach_bypass]
 * - based on Nvidia example
 * http://developer.download.nvidia.com/shaderlibrary/webpages/shader_library.html#post_bleach_bypass
 */

import type { IUniform, Texture } from 'three'
import type { IShader } from './types'

export type BleachBypassShaderUniforms = {
  opacity: IUniform<number>
  tDiffuse: IUniform<Texture | null>
}

export interface IBleachBypassShader extends IShader<BleachBypassShaderUniforms> {}

export const BleachBypassShader: IBleachBypassShader = {
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

    	vec4 base = texture2D( tDiffuse, vUv );

    	vec3 lumCoeff = vec3( 0.25, 0.65, 0.1 );
    	float lum = dot( lumCoeff, base.rgb );
    	vec3 blend = vec3( lum );

    	float L = min( 1.0, max( 0.0, 10.0 * ( lum - 0.45 ) ) );

    	vec3 result1 = 2.0 * base.rgb * blend;
    	vec3 result2 = 1.0 - 2.0 * ( 1.0 - blend ) * ( 1.0 - base.rgb );

    	vec3 newColor = mix( result1, result2, L );

    	float A2 = opacity * base.a;
    	vec3 mixRGB = A2 * newColor.rgb;
    	mixRGB += ( ( 1.0 - A2 ) * base.rgb );

    	gl_FragColor = vec4( mixRGB, base.a );

    }
  `,
}
