/*********************************/
/********** INTERPOLATION ********/
/*********************************/

import { Interpolant, Quaternion } from 'three'

// Spline Interpolation
// Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#appendix-c-spline-interpolation
export class GLTFCubicSplineInterpolant extends Interpolant {
  constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer)
  }

  copySampleValue_(index) {
    // Copies a sample value to the result buffer. See description of glTF
    // CUBICSPLINE values layout in interpolate_() function below.

    const result = this.resultBuffer,
      values = this.sampleValues,
      valueSize = this.valueSize,
      offset = index * valueSize * 3 + valueSize

    for (let i = 0; i !== valueSize; i++) {
      result[i] = values[offset + i]
    }

    return result
  }

  interpolate_(i1, t0, t, t1) {
    const result = this.resultBuffer
    const values = this.sampleValues
    const stride = this.valueSize

    const stride2 = stride * 2
    const stride3 = stride * 3

    const td = t1 - t0

    const p = (t - t0) / td
    const pp = p * p
    const ppp = pp * p

    const offset1 = i1 * stride3
    const offset0 = offset1 - stride3

    const s2 = -2 * ppp + 3 * pp
    const s3 = ppp - pp
    const s0 = 1 - s2
    const s1 = s3 - pp + p

    // Layout of keyframe output values for CUBICSPLINE animations:
    //   [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]
    for (let i = 0; i !== stride; i++) {
      const p0 = values[offset0 + i + stride] // splineVertex_k
      const m0 = values[offset0 + i + stride2] * td // outTangent_k * (t_k+1 - t_k)
      const p1 = values[offset1 + i + stride] // splineVertex_k+1
      const m1 = values[offset1 + i] * td // inTangent_k+1 * (t_k+1 - t_k)

      result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1
    }

    return result
  }
}

const _q = new Quaternion()

export class GLTFCubicSplineQuaternionInterpolant extends GLTFCubicSplineInterpolant {
  interpolate_(i1, t0, t, t1) {
    const result = super.interpolate_(i1, t0, t, t1)

    _q.fromArray(result).normalize().toArray(result)

    return result
  }
}
