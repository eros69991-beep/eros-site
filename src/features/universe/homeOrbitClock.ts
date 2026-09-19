export type HomeOrbitPauseReason =
  | 'visibility'
  | 'reduced-motion'
  | 'pointer'
  | 'focus'
  | 'navigation'
  | 'user'

export interface HomeOrbitClock {
  advance(nowMilliseconds: number): number
  getElapsed(): number
  getPauseReasons(): ReadonlySet<HomeOrbitPauseReason>
  setElapsed(seconds: number): void
  setPaused(reason: HomeOrbitPauseReason, paused: boolean): void
  setTimeScale(scale: number): void
}

const MAX_FRAME_SECONDS = 0.05

export function createHomeOrbitClock(initialElapsed = 0): HomeOrbitClock {
  let elapsed = initialElapsed
  let lastTimestamp: number | null = null
  let timeScale = 1
  const pauseReasons = new Set<HomeOrbitPauseReason>()

  return {
    advance(nowMilliseconds) {
      if (lastTimestamp === null || !Number.isFinite(nowMilliseconds)) {
        lastTimestamp = nowMilliseconds
        return elapsed
      }
      const delta = Math.min(Math.max((nowMilliseconds - lastTimestamp) / 1_000, 0), MAX_FRAME_SECONDS)
      lastTimestamp = nowMilliseconds
      if (pauseReasons.size === 0) elapsed += delta * timeScale
      return elapsed
    },
    getElapsed: () => elapsed,
    getPauseReasons: () => new Set(pauseReasons),
    setElapsed(seconds) {
      elapsed = Number.isFinite(seconds) ? Math.max(0, seconds) : 0
      lastTimestamp = null
    },
    setPaused(reason, paused) {
      if (paused) pauseReasons.add(reason)
      else pauseReasons.delete(reason)
    },
    setTimeScale(scale) {
      timeScale = Number.isFinite(scale) ? Math.max(0, scale) : 1
    },
  }
}

export const homeOrbitClock = createHomeOrbitClock()
