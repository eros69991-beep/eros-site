import { useFrame } from '@react-three/fiber'
import { useEffect } from 'react'
import { homeOrbitClock } from './homeOrbitClock'

interface HomeTestWindow extends Window {
  __EROS_HOME_TEST_API__?: {
    setOrbitTime(seconds: number): void
    setOrbitTimeScale(scale: number): void
  }
}

export function HomeOrbitClockDriver({ reducedMotion }: { reducedMotion: boolean }) {
  useEffect(() => {
    homeOrbitClock.setPaused('reduced-motion', reducedMotion)
    return () => homeOrbitClock.setPaused('reduced-motion', false)
  }, [reducedMotion])

  useEffect(() => {
    const updateVisibilityPause = () => {
      homeOrbitClock.setPaused('visibility', document.visibilityState !== 'visible')
    }
    updateVisibilityPause()
    document.addEventListener('visibilitychange', updateVisibilityPause)
    return () => {
      document.removeEventListener('visibilitychange', updateVisibilityPause)
      homeOrbitClock.setPaused('visibility', false)
    }
  }, [])

  useEffect(() => {
    if (!(import.meta.env.DEV || import.meta.env.MODE === 'test')) return undefined
    const testWindow = window as HomeTestWindow
    testWindow.__EROS_HOME_TEST_API__ = {
      setOrbitTime: (seconds) => homeOrbitClock.setElapsed(seconds),
      setOrbitTimeScale: (scale) => homeOrbitClock.setTimeScale(scale),
    }
    return () => {
      delete testWindow.__EROS_HOME_TEST_API__
      homeOrbitClock.setTimeScale(1)
    }
  }, [])

  useFrame(() => {
    homeOrbitClock.advance(performance.now())
  }, -100)

  return null
}
