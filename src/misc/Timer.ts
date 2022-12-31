class Timer {
  private _previousTime: number
  private _currentTime: number
  private _delta: number
  private _elapsed: number
  private _timescale: number
  private _useFixedDelta: boolean
  private _fixedDelta: number
  private _usePageVisibilityAPI: boolean
  private _pageVisibilityHandler: ((...args: any[]) => void) | undefined

  constructor() {
    this._previousTime = 0
    this._currentTime = 0
    this._delta = 0
    this._elapsed = 0
    this._timescale = 1
    this._useFixedDelta = false
    this._fixedDelta = 16.67 // ms, corresponds to approx. 60 FPS
    this._usePageVisibilityAPI = typeof document !== 'undefined' && document.hidden !== undefined
  }

  // https://github.com/mrdoob/three.js/issues/20575
  // use Page Visibility API to avoid large time delta values
  connect(): this {
    if (this._usePageVisibilityAPI) {
      this._pageVisibilityHandler = handleVisibilityChange.bind(this)
      document.addEventListener('visibilitychange', this._pageVisibilityHandler, false)
    }
    return this
  }

  dispose(): this {
    if (this._usePageVisibilityAPI && this._pageVisibilityHandler) {
      document.removeEventListener('visibilitychange', this._pageVisibilityHandler)
    }
    return this
  }

  disableFixedDelta(): this {
    this._useFixedDelta = false
    return this
  }

  enableFixedDelta(): this {
    this._useFixedDelta = true
    return this
  }

  getDelta(): number {
    return this._delta / 1000
  }

  getElapsed(): number {
    return this._elapsed / 1000
  }

  getFixedDelta(): number {
    return this._fixedDelta / 1000
  }

  getTimescale(): number {
    return this._timescale
  }

  reset(): this {
    this._currentTime = this._now()
    return this
  }

  setFixedDelta(fixedDelta: number): this {
    this._fixedDelta = fixedDelta * 1000
    return this
  }

  setTimescale(timescale: number): this {
    this._timescale = timescale
    return this
  }

  update(): this {
    if (this._useFixedDelta === true) {
      this._delta = this._fixedDelta
    } else {
      this._previousTime = this._currentTime
      this._currentTime = this._now()
      this._delta = this._currentTime - this._previousTime
    }
    this._delta *= this._timescale
    this._elapsed += this._delta // _elapsed is the accumulation of all previous deltas
    return this
  }

  // private

  private _now(): number {
    return (typeof performance === 'undefined' ? Date : performance).now()
  }
}

function handleVisibilityChange(): void {
  if (document.hidden === false) this.reset()
}

export { Timer }
