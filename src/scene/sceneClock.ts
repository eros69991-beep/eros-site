const clockOrigin = typeof performance === 'undefined' ? 0 : performance.now()
let frozenTime: number | null = null
const canControlClock = import.meta.env.DEV || import.meta.env.MODE === 'test'
const sceneClockChangeEvent = 'eros:scene-clock-change'

export function getSceneTime(): number {
  if (frozenTime !== null) return frozenTime
  return typeof performance === 'undefined' ? 0 : (performance.now() - clockOrigin) / 1_000
}

export function isSceneTimeFrozen(): boolean {
  return frozenTime !== null
}

export function subscribeSceneClock(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined
  window.addEventListener(sceneClockChangeEvent, listener)
  return () => window.removeEventListener(sceneClockChangeEvent, listener)
}

if (canControlClock && typeof window !== 'undefined') {
  window.__EROS_TEST_API__ = {
    ...window.__EROS_TEST_API__,
    setSceneTime(seconds: number) {
      frozenTime = Number.isFinite(seconds) ? seconds : 0
      window.dispatchEvent(new Event(sceneClockChangeEvent))
    },
  }
}
