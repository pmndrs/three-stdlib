/**
 * Afterimage shader
 * I created this effect inspired by a demo on codepen:
 * https://codepen.io/brunoimbrizi/pen/MoRJaN?page=1&
 */

import type { IUniform, Texture } from 'three'
import type { IShader } from './types'

export type AfterimageShaderUniforms = {
  damp: IUniform<number>
  tNew: IUniform<Texture | null>
  tOld: IUniform<Texture | null>
}

export interface IAfterimageShader extends IShader<AfterimageShaderUniforms> {}

export const AfterimageShader: IAfterimageShader = {
  uniforms: {
    damp: { value: 0.96 },
    tOld: { value: null },
    tNew: { value: null },
  },

  vertexShader: [
    'varying vec2 vUv;',

    'void main() {',

    '	vUv = uv;',
    '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}',
  ].join('\n'),

  fragmentShader: [
    'uniform float damp;',

    'uniform sampler2D tOld;',
    'uniform sampler2D tNew;',

    'varying vec2 vUv;',

    'vec4 when_gt( vec4 x, float y ) {',

    '	return max( sign( x - y ), 0.0 );',

    '}',

    'void main() {',

    '	vec4 texelOld = texture2D( tOld, vUv );',
    '	vec4 texelNew = texture2D( tNew, vUv );',

    '	texelOld *= damp * when_gt( texelOld, 0.1 );',

    '	gl_FragColor = max(texelNew, texelOld);',

    '}',
  ].join('\n'),
}
