const clockOrigin = typeof performance === 'undefined' ? 0 : performance.now()
let frozenTime: number | null = null
const canControlClock = import.meta.env.DEV || import.meta.env.MODE === 'test'

export function getSceneTime(): number {
  if (frozenTime !== null) return frozenTime
  return typeof performance === 'undefined' ? 0 : (performance.now() - clockOrigin) / 1_000
}

if (canControlClock && typeof window !== 'undefined') {
  window.__EROS_TEST_API__ = {
    ...window.__EROS_TEST_API__,
    setSceneTime(seconds: number) {
      frozenTime = Number.isFinite(seconds) ? seconds : 0
    },
  }
}
