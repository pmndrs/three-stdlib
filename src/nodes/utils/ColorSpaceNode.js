import { LinearEncoding, sRGBEncoding } from 'three'

import { TempNode } from '../core/TempNode'
import { ConstNode } from '../core/ConstNode'
import { FunctionNode } from '../core/FunctionNode'

function ColorSpaceNode(input, method) {
  TempNode.call(this, 'v4')

  this.input = input

  this.method = method || ColorSpaceNode.LINEAR_TO_LINEAR
}

ColorSpaceNode.Nodes = (function () {
  var LinearToLinear = new FunctionNode(['vec4 LinearToLinear( in vec4 value ) {', '	return value;', '}'].join('\n'))

  var sRGBToLinear = new FunctionNode(
    [
      'vec4 sRGBToLinear( in vec4 value ) {',

      '	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.w );',

      '}',
    ].join('\n'),
  )

  var LinearTosRGB = new FunctionNode(
    [
      'vec4 LinearTosRGB( in vec4 value ) {',

      '	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.w );',

      '}',
    ].join('\n'),
  )

  // LogLuv reference: http://graphicrants.blogspot.ca/2009/04/rgbm-color-encoding.html

  // M matrix, for encoding

  var cLogLuvM = new ConstNode(
    'const mat3 cLogLuvM = mat3( 0.2209, 0.3390, 0.4184, 0.1138, 0.6780, 0.7319, 0.0102, 0.1130, 0.2969 );',
  )

  var LinearToLogLuv = new FunctionNode(
    [
      'vec4 LinearToLogLuv( in vec4 value ) {',

      '	vec3 Xp_Y_XYZp = cLogLuvM * value.rgb;',
      '	Xp_Y_XYZp = max(Xp_Y_XYZp, vec3(1e-6, 1e-6, 1e-6));',
      '	vec4 vResult;',
      '	vResult.xy = Xp_Y_XYZp.xy / Xp_Y_XYZp.z;',
      '	float Le = 2.0 * log2(Xp_Y_XYZp.y) + 127.0;',
      '	vResult.w = fract(Le);',
      '	vResult.z = (Le - (floor(vResult.w*255.0))/255.0)/255.0;',
      '	return vResult;',

      '}',
    ].join('\n'),
    [cLogLuvM],
  )

  // Inverse M matrix, for decoding

  var cLogLuvInverseM = new ConstNode(
    'const mat3 cLogLuvInverseM = mat3( 6.0014, -2.7008, -1.7996, -1.3320, 3.1029, -5.7721, 0.3008, -1.0882, 5.6268 );',
  )

  var LogLuvToLinear = new FunctionNode(
    [
      'vec4 LogLuvToLinear( in vec4 value ) {',

      '	float Le = value.z * 255.0 + value.w;',
      '	vec3 Xp_Y_XYZp;',
      '	Xp_Y_XYZp.y = exp2((Le - 127.0) / 2.0);',
      '	Xp_Y_XYZp.z = Xp_Y_XYZp.y / value.y;',
      '	Xp_Y_XYZp.x = value.x * Xp_Y_XYZp.z;',
      '	vec3 vRGB = cLogLuvInverseM * Xp_Y_XYZp.rgb;',
      '	return vec4( max(vRGB, 0.0), 1.0 );',

      '}',
    ].join('\n'),
    [cLogLuvInverseM],
  )

  return {
    LinearToLinear: LinearToLinear,
    sRGBToLinear: sRGBToLinear,
    LinearTosRGB: LinearTosRGB,
    cLogLuvM: cLogLuvM,
    LinearToLogLuv: LinearToLogLuv,
    cLogLuvInverseM: cLogLuvInverseM,
    LogLuvToLinear: LogLuvToLinear,
  }
})()

ColorSpaceNode.LINEAR_TO_LINEAR = 'LinearToLinear'

ColorSpaceNode.SRGB_TO_LINEAR = 'sRGBToLinear'
ColorSpaceNode.LINEAR_TO_SRGB = 'LinearTosRGB'

ColorSpaceNode.RGBE_TO_LINEAR = 'RGBEToLinear'
ColorSpaceNode.LINEAR_TO_RGBE = 'LinearToRGBE'

ColorSpaceNode.LINEAR_TO_LOG_LUV = 'LinearToLogLuv'
ColorSpaceNode.LOG_LUV_TO_LINEAR = 'LogLuvToLinear'

ColorSpaceNode.getEncodingComponents = function (encoding) {
  switch (encoding) {
    case LinearEncoding:
      return ['Linear']
    case sRGBEncoding:
      return ['sRGB']
  }
}

ColorSpaceNode.prototype = Object.create(TempNode.prototype)
ColorSpaceNode.prototype.constructor = ColorSpaceNode
ColorSpaceNode.prototype.nodeType = 'ColorSpace'
ColorSpaceNode.prototype.hashProperties = ['method']

ColorSpaceNode.prototype.generate = function (builder, output) {
  var input = this.input.build(builder, 'v4')
  var outputType = this.getType(builder)

  var methodNode = ColorSpaceNode.Nodes[this.method]
  var method = builder.include(methodNode)

  if (method === ColorSpaceNode.LINEAR_TO_LINEAR) {
    return builder.format(input, outputType, output)
  } else {
    if (methodNode.inputs.length === 2) {
      var factor = this.factor.build(builder, 'f')

      return builder.format(method + '( ' + input + ', ' + factor + ' )', outputType, output)
    } else {
      return builder.format(method + '( ' + input + ' )', outputType, output)
    }
  }
}

ColorSpaceNode.prototype.fromEncoding = function (encoding) {
  var components = ColorSpaceNode.getEncodingComponents(encoding)

  this.method = 'LinearTo' + components[0]
  this.factor = components[1]
}

ColorSpaceNode.prototype.fromDecoding = function (encoding) {
  var components = ColorSpaceNode.getEncodingComponents(encoding)

  this.method = components[0] + 'ToLinear'
  this.factor = components[1]
}

ColorSpaceNode.prototype.copy = function (source) {
  TempNode.prototype.copy.call(this, source)

  this.input = source.input
  this.method = source.method

  return this
}

ColorSpaceNode.prototype.toJSON = function (meta) {
  var data = this.getJSONNode(meta)

  if (!data) {
    data = this.createJSONNode(meta)

    data.input = this.input.toJSON(meta).uuid
    data.method = this.method
  }

  return data
}

export { ColorSpaceNode }
