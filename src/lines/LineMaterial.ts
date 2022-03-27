import { ShaderLib, ShaderMaterial, UniformsLib, UniformsUtils, Vector2, Color } from 'three'
import type { ShaderMaterialParameters } from 'three'

export type ColorOptions = Color | string | number

export interface LineMaterialParameters extends ShaderMaterialParameters {
  color?: ColorOptions
  dashed?: boolean
  dashOffset?: number
  dashScale?: number
  dashSize?: number
  gapSize?: number
  linewidth?: number
  resolution?: Vector2
}

/**
 * parameters = {
 *  color: <hex>,
 *  linewidth: <float>,
 *  dashed: <boolean>,
 *  dashScale: <float>,
 *  dashSize: <float>,
 *  dashOffset: <float>,
 *  gapSize: <float>,
 *  resolution: <Vector2>, // to be set by renderer
 * }
 */

const LineUniforms = {
  linewidth: { value: 1 },
  resolution: { value: new Vector2(1, 1) },
  dashScale: { value: 1 },
  dashSize: { value: 1 },
  dashOffset: { value: 0 },
  gapSize: { value: 1 }, // todo FIX - maybe change to totalSize
  opacity: { value: 1 },
}

ShaderLib['line'] = {
  uniforms: UniformsUtils.merge([UniformsLib.common, UniformsLib.fog, LineUniforms]),

  vertexShader: /* glsl */ `
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		varying vec2 vUv;

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			vUv = uv;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec2 ndcStart = clipStart.xy / clipStart.w;
			vec2 ndcEnd = clipEnd.xy / clipEnd.w;

			// direction
			vec2 dir = ndcEnd - ndcStart;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			// perpendicular to dir
			vec2 offset = vec2( dir.y, - dir.x );

			// undo aspect ratio adjustment
			dir.x /= aspect;
			offset.x /= aspect;

			// sign flip
			if ( position.x < 0.0 ) offset *= - 1.0;

			// endcaps
			if ( position.y < 0.0 ) {

				offset += - dir;

			} else if ( position.y > 1.0 ) {

				offset += dir;

			}

			// adjust for linewidth
			offset *= linewidth;

			// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
			offset /= resolution.y;

			// select end
			vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

			// back to clip space
			offset *= clip.w;

			clip.xy += offset;

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,

  fragmentShader: /* glsl */ `
		uniform vec3 diffuse;
		uniform float opacity;

		#ifdef USE_DASH

			uniform float dashSize;
			uniform float dashOffset;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		varying vec2 vUv;

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef ALPHA_TO_COVERAGE

			// artifacts appear on some hardware if a derivative is taken within a conditional
			float a = vUv.x;
			float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
			float len2 = a * a + b * b;
			float dlen = fwidth( len2 );

			if ( abs( vUv.y ) > 1.0 ) {

				alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

			}

			#else

			if ( abs( vUv.y ) > 1.0 ) {

				float a = vUv.x;
				float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
				float len2 = a * a + b * b;

				if ( len2 > 1.0 ) discard;

			}

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <encodings_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`,
}

class LineMaterial extends ShaderMaterial {
  private readonly isLineMaterial = true

  public dashed = false

  public color: Color = new Color(0x000000)
  public lineWidth: number = 0
  public dashScale: number = 0
  public dashOffset: number = 0
  public dashSize: number = 0
  public opacity: number = 0
  public resolution: Vector2 = new Vector2()
  public alphaToCoverage: boolean = false

  constructor(parameters: LineMaterialParameters = {}) {
    super({
      uniforms: UniformsUtils.clone(ShaderLib['line'].uniforms),
      vertexShader: ShaderLib['line'].vertexShader,
      fragmentShader: ShaderLib['line'].fragmentShader,
      clipping: true, // required for clipping support
    })

    /**
     * Everytime I remove this, everything just breaks,
     * so I'm just gonna leave it here.
     */
    Object.defineProperties(this, {
      color: {
        enumerable: true,

        get: function () {
          return this.uniforms.diffuse.value
        },

        set: function (value) {
          const colorObj = new Color(value)
          this.uniforms.diffuse.value = colorObj.getHex()
        },
      },
      linewidth: {
        enumerable: true,

        get: function () {
          return this.uniforms.linewidth.value
        },

        set: function (value) {
          this.uniforms.linewidth.value = value
        },
      },
      dashScale: {
        enumerable: true,

        get: function () {
          return this.uniforms.dashScale.value
        },

        set: function (value) {
          this.uniforms.dashScale.value = value
        },
      },
      dashSize: {
        enumerable: true,

        get: function () {
          return this.uniforms.dashSize.value
        },

        set: function (value) {
          this.uniforms.dashSize.value = value
        },
      },
      dashOffset: {
        enumerable: true,

        get: function () {
          return this.uniforms.dashOffset.value
        },

        set: function (value) {
          this.uniforms.dashOffset.value = value
        },
      },
      gapSize: {
        enumerable: true,

        get: function () {
          return this.uniforms.gapSize.value
        },

        set: function (value) {
          this.uniforms.gapSize.value = value
        },
      },
      opacity: {
        enumerable: true,

        get: function () {
          return this.uniforms.opacity.value
        },

        set: function (value) {
          this.uniforms.opacity.value = value
        },
      },
      resolution: {
        enumerable: true,

        get: function () {
          return this.uniforms.resolution.value
        },

        set: function (value) {
          this.uniforms.resolution.value.copy(value)
        },
      },
      alphaToCoverage: {
        enumerable: true,

        get: function () {
          return Boolean('ALPHA_TO_COVERAGE' in this.defines)
        },

        set: function (value) {
          if (Boolean(value) !== Boolean('ALPHA_TO_COVERAGE' in this.defines)) {
            this.needsUpdate = true
          }

          if (value) {
            this.defines.ALPHA_TO_COVERAGE = ''
            this.extensions.derivatives = true
          } else {
            delete this.defines.ALPHA_TO_COVERAGE
            this.extensions.derivatives = false
          }
        },
      },
      dashed: {
        enumerable: true,

        get: function () {
          return Boolean('USE_DASH' in this.defines)
        },

        set: function (value) {
          if (Boolean(value) !== Boolean('USE_DASH' in this.defines)) {
            this.needsUpdate = true
          }

          if (value) {
            this.defines.USE_DASH = ''
          } else {
            delete this.defines.USE_DASH
          }
        },
      },
    })

    this.setValues(parameters)
  }
}

export { LineMaterial }
