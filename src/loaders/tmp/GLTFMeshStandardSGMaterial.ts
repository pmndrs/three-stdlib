import { MeshStandardMaterial } from 'three'

/**
 * A sub class of StandardMaterial with some of the functionality
 * changed via the `onBeforeCompile` callback
 * @pailhead
 */
export class GLTFMeshStandardSGMaterial extends MeshStandardMaterial {
  constructor(params) {
    super()

    this.isGLTFSpecularGlossinessMaterial = true

    //various chunks that need replacing
    const specularMapParsFragmentChunk = ['#ifdef USE_SPECULARMAP', '	uniform sampler2D specularMap;', '#endif'].join(
      '\n',
    )

    const glossinessMapParsFragmentChunk = [
      '#ifdef USE_GLOSSINESSMAP',
      '	uniform sampler2D glossinessMap;',
      '#endif',
    ].join('\n')

    const specularMapFragmentChunk = [
      'vec3 specularFactor = specular;',
      '#ifdef USE_SPECULARMAP',
      '	vec4 texelSpecular = texture2D( specularMap, vUv );',
      '	// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture',
      '	specularFactor *= texelSpecular.rgb;',
      '#endif',
    ].join('\n')

    const glossinessMapFragmentChunk = [
      'float glossinessFactor = glossiness;',
      '#ifdef USE_GLOSSINESSMAP',
      '	vec4 texelGlossiness = texture2D( glossinessMap, vUv );',
      '	// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture',
      '	glossinessFactor *= texelGlossiness.a;',
      '#endif',
    ].join('\n')

    const lightPhysicalFragmentChunk = [
      'PhysicalMaterial material;',
      'material.diffuseColor = diffuseColor.rgb * ( 1. - max( specularFactor.r, max( specularFactor.g, specularFactor.b ) ) );',
      'vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );',
      'float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );',
      'material.roughness = max( 1.0 - glossinessFactor, 0.0525 ); // 0.0525 corresponds to the base mip of a 256 cubemap.',
      'material.roughness += geometryRoughness;',
      'material.roughness = min( material.roughness, 1.0 );',
      'material.specularColor = specularFactor;',
    ].join('\n')

    const uniforms = {
      specular: { value: new Color().setHex(0xffffff) },
      glossiness: { value: 1 },
      specularMap: { value: null },
      glossinessMap: { value: null },
    }

    this._extraUniforms = uniforms

    this.onBeforeCompile = function (shader) {
      for (const uniformName in uniforms) {
        shader.uniforms[uniformName] = uniforms[uniformName]
      }

      shader.fragmentShader = shader.fragmentShader
        .replace('uniform float roughness;', 'uniform vec3 specular;')
        .replace('uniform float metalness;', 'uniform float glossiness;')
        .replace('#include <roughnessmap_pars_fragment>', specularMapParsFragmentChunk)
        .replace('#include <metalnessmap_pars_fragment>', glossinessMapParsFragmentChunk)
        .replace('#include <roughnessmap_fragment>', specularMapFragmentChunk)
        .replace('#include <metalnessmap_fragment>', glossinessMapFragmentChunk)
        .replace('#include <lights_physical_fragment>', lightPhysicalFragmentChunk)
    }

    Object.defineProperties(this, {
      specular: {
        get: function () {
          return uniforms.specular.value
        },
        set: function (v) {
          uniforms.specular.value = v
        },
      },

      specularMap: {
        get: function () {
          return uniforms.specularMap.value
        },
        set: function (v) {
          uniforms.specularMap.value = v

          if (v) {
            this.defines.USE_SPECULARMAP = '' // USE_UV is set by the renderer for specular maps
          } else {
            delete this.defines.USE_SPECULARMAP
          }
        },
      },

      glossiness: {
        get: function () {
          return uniforms.glossiness.value
        },
        set: function (v) {
          uniforms.glossiness.value = v
        },
      },

      glossinessMap: {
        get: function () {
          return uniforms.glossinessMap.value
        },
        set: function (v) {
          uniforms.glossinessMap.value = v

          if (v) {
            this.defines.USE_GLOSSINESSMAP = ''
            this.defines.USE_UV = ''
          } else {
            delete this.defines.USE_GLOSSINESSMAP
            delete this.defines.USE_UV
          }
        },
      },
    })

    delete this.metalness
    delete this.roughness
    delete this.metalnessMap
    delete this.roughnessMap

    this.setValues(params)
  }

  copy(source) {
    super.copy(source)

    this.specularMap = source.specularMap
    this.specular.copy(source.specular)
    this.glossinessMap = source.glossinessMap
    this.glossiness = source.glossiness
    delete this.metalness
    delete this.roughness
    delete this.metalnessMap
    delete this.roughnessMap
    return this
  }
}
