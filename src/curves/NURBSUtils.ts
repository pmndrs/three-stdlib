import { Vector3, Vector4 } from 'three'

/**
 * Finds knot vector span.
 *
 * @param p degree
 * @param u parametric value
 * @param U knot vector
 *
 * @returns the span
 */
export function findSpan(p: number, u: number, U: number[]) {
  const n = U.length - p - 1

  if (u >= U[n]) {
    return n - 1
  }

  if (u <= U[p]) {
    return p
  }

  let low = p
  let high = n
  let mid = Math.floor((low + high) / 2)

  while (u < U[mid] || u >= U[mid + 1]) {
    if (u < U[mid]) {
      high = mid
    } else {
      low = mid
    }

    mid = Math.floor((low + high) / 2)
  }

  return mid
}

/**
 * Calculate basis functions. See The NURBS Book, page 70, algorithm A2.2
 *
 * @param span span in which u lies
 * @param p degree
 * @param u parametric value
 * @param U knot vector
 */
export function calcBasisFunctions(span: number, u: number, p: number, U: number[]) {
  const N = [1.0]
  const left: number[] = []
  const right: number[] = []

  for (let j = 1; j <= p; ++j) {
    left[j] = u - U[span + 1 - j]
    right[j] = U[span + j] - u

    let saved = 0.0

    for (let r = 0; r < j; ++r) {
      const rv = right[r + 1]
      const lv = left[j - r]
      const temp = N[r] / (rv + lv)
      N[r] = saved + rv * temp
      saved = lv * temp
    }

    N[j] = saved
  }

  return N
}

/**
 * Calculate B-Spline curve points. See The NURBS Book, page 82, algorithm A3.1.
 *
 * @param p degree of B-Spline
 * @param U knot vector
 * @param P control points (x, y, z, w)
 * @param u parametric point
 *
 * @returns point for given u
 */
export function calcBSplinePoint(p: number, U: number[], P: Vector4[], u: number) {
  const span = findSpan(p, u, U)
  const N = calcBasisFunctions(span, u, p, U)
  const C = new Vector4(0, 0, 0, 0)

  for (let j = 0; j <= p; ++j) {
    const point = P[span - p + j]
    const Nj = N[j]
    const wNj = point.w * Nj
    C.x += point.x * wNj
    C.y += point.y * wNj
    C.z += point.z * wNj
    C.w += point.w * Nj
  }

  return C
}

/**
 * Calculate basis functions derivatives. See The NURBS Book, page 72, algorithm A2.3.
 *
 * @param span span in which u lies
 * @param u parametric point
 * @param p degree
 * @param n number of derivatives to calculate
 * @param U knot vector
 */
export function calcBasisFunctionDerivatives(span: number, u: number, p: number, n: number, U: number[]) {
  const zeroArr: number[] = []
  for (let i = 0; i <= p; ++i) zeroArr[i] = 0.0

  const ders: number[][] = []
  for (let i = 0; i <= n; ++i) ders[i] = zeroArr.slice(0)

  const ndu = []
  for (let i = 0; i <= p; ++i) ndu[i] = zeroArr.slice(0)

  ndu[0][0] = 1.0

  const left = zeroArr.slice(0)
  const right = zeroArr.slice(0)

  for (let j = 1; j <= p; ++j) {
    left[j] = u - U[span + 1 - j]
    right[j] = U[span + j] - u

    let saved = 0.0

    for (let r = 0; r < j; ++r) {
      const rv = right[r + 1]
      const lv = left[j - r]
      ndu[j][r] = rv + lv

      const temp = ndu[r][j - 1] / ndu[j][r]
      ndu[r][j] = saved + rv * temp
      saved = lv * temp
    }

    ndu[j][j] = saved
  }

  for (let j = 0; j <= p; ++j) {
    ders[0][j] = ndu[j][p]
  }

  for (let r = 0; r <= p; ++r) {
    let s1 = 0
    let s2 = 1

    const a = []
    for (let i = 0; i <= p; ++i) {
      a[i] = zeroArr.slice(0)
    }

    a[0][0] = 1.0

    for (let k = 1; k <= n; ++k) {
      let d = 0.0
      const rk = r - k
      const pk = p - k

      if (r >= k) {
        a[s2][0] = a[s1][0] / ndu[pk + 1][rk]
        d = a[s2][0] * ndu[rk][pk]
      }

      const j1 = rk >= -1 ? 1 : -rk
      const j2 = r - 1 <= pk ? k - 1 : p - r

      for (let j = j1; j <= j2; ++j) {
        a[s2][j] = (a[s1][j] - a[s1][j - 1]) / ndu[pk + 1][rk + j]
        d += a[s2][j] * ndu[rk + j][pk]
      }

      if (r <= pk) {
        a[s2][k] = -a[s1][k - 1] / ndu[pk + 1][r]
        d += a[s2][k] * ndu[r][pk]
      }

      ders[k][r] = d

      const j = s1
      s1 = s2
      s2 = j
    }
  }

  let r = p

  for (let k = 1; k <= n; ++k) {
    for (let j = 0; j <= p; ++j) {
      ders[k][j] *= r
    }

    r *= p - k
  }

  return ders
}

/**
 * Calculate derivatives of a B-Spline. See The NURBS Book, page 93, algorithm A3.2.
 *
 * @param p degree
 * @param U knot vector
 * @param P control points
 * @param u Parametric points
 * @param nd number of derivatives
 */
export function calcBSplineDerivatives(p: number, U: number[], P: Vector4[], u: number, nd: number) {
  const du = nd < p ? nd : p
  const CK: Vector4[] = []
  const span = findSpan(p, u, U)
  const nders = calcBasisFunctionDerivatives(span, u, p, du, U)
  const Pw: Vector4[] = []

  for (let i = 0; i < P.length; ++i) {
    const point = P[i].clone()
    const w = point.w

    point.x *= w
    point.y *= w
    point.z *= w

    Pw[i] = point
  }

  for (let k = 0; k <= du; ++k) {
    const point = Pw[span - p].clone().multiplyScalar(nders[k][0])

    for (let j = 1; j <= p; ++j) {
      point.add(Pw[span - p + j].clone().multiplyScalar(nders[k][j]))
    }

    CK[k] = point
  }

  for (let k = du + 1; k <= nd + 1; ++k) {
    CK[k] = new Vector4(0, 0, 0)
  }

  return CK
}

/**
 * Calculate "K over I"
 *
 * @param k number
 * @param i number
 *
 * @returns k!/(i!(k-i)!)
 */
export function calcKoverI(k: number, i: number) {
  let nom = 1

  for (let j = 2; j <= k; ++j) {
    nom *= j
  }

  let denom = 1

  for (let j = 2; j <= i; ++j) {
    denom *= j
  }

  for (let j = 2; j <= k - i; ++j) {
    denom *= j
  }

  return nom / denom
}

/**
 * Calculate derivatives (0-nd) of rational curve. See The NURBS Book, page 127, algorithm A4.2.
 *
 * @param Pders result of function calcBSplineDerivatives
 *
 * @returns array with derivatives for rational curve.
 */
export function calcRationalCurveDerivatives(Pders: Vector4[]) {
  const nd = Pders.length
  const Aders: Vector3[] = []
  const wders: number[] = []

  for (let i = 0; i < nd; ++i) {
    const point = Pders[i]
    Aders[i] = new Vector3(point.x, point.y, point.z)
    wders[i] = point.w
  }

  const CK: Vector3[] = []

  for (let k = 0; k < nd; ++k) {
    const v = Aders[k].clone()

    for (let i = 1; i <= k; ++i) {
      v.sub(CK[k - i].clone().multiplyScalar(calcKoverI(k, i) * wders[i]))
    }

    CK[k] = v.divideScalar(wders[0])
  }

  return CK
}

/**
 * Calculate NURBS curve derivatives. See The NURBS Book, page 127, algorithm A4.2.
 *
 * @param p degree
 * @param U knot vector
 * @param P control points in homogeneous space
 * @param u parametric points
 * @param nd number of derivatives
 *
 * @returns array with derivatives.
 */
export function calcNURBSDerivatives(p: number, U: number[], P: Vector4[], u: number, nd: number) {
  const Pders = calcBSplineDerivatives(p, U, P, u, nd)
  return calcRationalCurveDerivatives(Pders)
}

/**
 * Calculate rational B-Spline surface point. See The NURBS Book, page 134, algorithm A4.3.
 *
 * @param p
 * @param q
 * @param U
 * @param V
 * @param P
 * @param u
 * @param v
 * @param target
 *
 * @returns point for given (u, v)
 */
export function calcSurfacePoint(
  p: number,
  q: number,
  U: number[],
  V: number[],
  P: Vector4[][],
  u: number,
  v: number,
  target: Vector3,
) {
  const uspan = findSpan(p, u, U)
  const vspan = findSpan(q, v, V)
  const Nu = calcBasisFunctions(uspan, u, p, U)
  const Nv = calcBasisFunctions(vspan, v, q, V)
  const temp: Vector4[] = []

  for (let l = 0; l <= q; ++l) {
    temp[l] = new Vector4(0, 0, 0, 0)
    for (let k = 0; k <= p; ++k) {
      const point = P[uspan - p + k][vspan - q + l].clone()
      const w = point.w
      point.x *= w
      point.y *= w
      point.z *= w
      temp[l].add(point.multiplyScalar(Nu[k]))
    }
  }

  const Sw = new Vector4(0, 0, 0, 0)
  for (let l = 0; l <= q; ++l) {
    Sw.add(temp[l].multiplyScalar(Nv[l]))
  }

  Sw.divideScalar(Sw.w)
  target.set(Sw.x, Sw.y, Sw.z)
}
