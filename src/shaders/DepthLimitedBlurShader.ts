import { Vector2 } from 'three'
import type { IUniform, Texture } from 'three'
import type { IShader } from './types'

export type DepthLimitedBlurShaderDefines = {
  DEPTH_PACKING: number
  KERNEL_RADIUS: number
  PERSPECTIVE_CAMERA: number
}

export type DepthLimitedBlurShaderUniforms = {
  cameraFar: IUniform<number>
  cameraNear: IUniform<number>
  depthCutoff: IUniform<number>
  sampleUvOffsets: IUniform<Vector2[]>
  sampleWeights: IUniform<number[]>
  size: IUniform<Vector2>
  tDepth: IUniform<Texture | null>
  tDiffuse: IUniform<Texture | null>
}

export interface IDepthLimitedBlurShader
  extends IShader<DepthLimitedBlurShaderUniforms, DepthLimitedBlurShaderDefines> {
  defines: DepthLimitedBlurShaderDefines
  needsUpdate?: boolean
}

export const DepthLimitedBlurShader: IDepthLimitedBlurShader = {
  defines: {
    KERNEL_RADIUS: 4,
    DEPTH_PACKING: 1,
    PERSPECTIVE_CAMERA: 1,
  },
  uniforms: {
    tDiffuse: { value: null },
    size: { value: new Vector2(512, 512) },
    sampleUvOffsets: { value: [new Vector2(0, 0)] },
    sampleWeights: { value: [1.0] },
    tDepth: { value: null },
    cameraNear: { value: 10 },
    cameraFar: { value: 1000 },
    depthCutoff: { value: 10 },
  },
  vertexShader: [
    '#include <common>',

    'uniform vec2 size;',

    'varying vec2 vUv;',
    'varying vec2 vInvSize;',

    'void main() {',
    '	vUv = uv;',
    '	vInvSize = 1.0 / size;',

    '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}',
  ].join('\n'),
  fragmentShader: [
    '#include <common>',
    '#include <packing>',

    'uniform sampler2D tDiffuse;',
    'uniform sampler2D tDepth;',

    'uniform float cameraNear;',
    'uniform float cameraFar;',
    'uniform float depthCutoff;',

    'uniform vec2 sampleUvOffsets[ KERNEL_RADIUS + 1 ];',
    'uniform float sampleWeights[ KERNEL_RADIUS + 1 ];',

    'varying vec2 vUv;',
    'varying vec2 vInvSize;',

    'float getDepth( const in vec2 screenPosition ) {',
    '	#if DEPTH_PACKING == 1',
    '	return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );',
    '	#else',
    '	return texture2D( tDepth, screenPosition ).x;',
    '	#endif',
    '}',

    'float getViewZ( const in float depth ) {',
    '	#if PERSPECTIVE_CAMERA == 1',
    '	return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );',
    '	#else',
    '	return orthographicDepthToViewZ( depth, cameraNear, cameraFar );',
    '	#endif',
    '}',

    'void main() {',
    '	float depth = getDepth( vUv );',
    '	if( depth >= ( 1.0 - EPSILON ) ) {',
    '		discard;',
    '	}',

    '	float centerViewZ = -getViewZ( depth );',
    '	bool rBreak = false, lBreak = false;',

    '	float weightSum = sampleWeights[0];',
    '	vec4 diffuseSum = texture2D( tDiffuse, vUv ) * weightSum;',

    '	for( int i = 1; i <= KERNEL_RADIUS; i ++ ) {',

    '		float sampleWeight = sampleWeights[i];',
    '		vec2 sampleUvOffset = sampleUvOffsets[i] * vInvSize;',

    '		vec2 sampleUv = vUv + sampleUvOffset;',
    '		float viewZ = -getViewZ( getDepth( sampleUv ) );',

    '		if( abs( viewZ - centerViewZ ) > depthCutoff ) rBreak = true;',

    '		if( ! rBreak ) {',
    '			diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;',
    '			weightSum += sampleWeight;',
    '		}',

    '		sampleUv = vUv - sampleUvOffset;',
    '		viewZ = -getViewZ( getDepth( sampleUv ) );',

    '		if( abs( viewZ - centerViewZ ) > depthCutoff ) lBreak = true;',

    '		if( ! lBreak ) {',
    '			diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;',
    '			weightSum += sampleWeight;',
    '		}',

    '	}',

    '	gl_FragColor = diffuseSum / weightSum;',
    '}',
  ].join('\n'),
}

export const BlurShaderUtils = {
  createSampleWeights: (kernelRadius: number, stdDev: number): number[] => {
    const gaussian = (x: number, stdDev: number): number => {
      return Math.exp(-(x * x) / (2.0 * (stdDev * stdDev))) / (Math.sqrt(2.0 * Math.PI) * stdDev)
    }

    const weights: number[] = []

    for (let i = 0; i <= kernelRadius; i++) {
      weights.push(gaussian(i, stdDev))
    }

    return weights
  },

  createSampleOffsets: (kernelRadius: number, uvIncrement: Vector2): Vector2[] => {
    const offsets: Vector2[] = []

    for (let i = 0; i <= kernelRadius; i++) {
      offsets.push(uvIncrement.clone().multiplyScalar(i))
    }

    return offsets
  },

  configure: (shader: IDepthLimitedBlurShader, kernelRadius: number, stdDev: number, uvIncrement: Vector2): void => {
    shader.defines['KERNEL_RADIUS'] = kernelRadius
    shader.uniforms['sampleUvOffsets'].value = BlurShaderUtils.createSampleOffsets(kernelRadius, uvIncrement)
    shader.uniforms['sampleWeights'].value = BlurShaderUtils.createSampleWeights(kernelRadius, stdDev)
    shader.needsUpdate = true
  },
}
