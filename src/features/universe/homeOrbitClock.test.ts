import { describe, expect, it } from 'vitest'
import { createHomeOrbitClock } from './homeOrbitClock'

describe('homepage orbit clock', () => {
  it('caps a rendered frame delta at 50ms', () => {
    const clock = createHomeOrbitClock()
    clock.advance(1_000)
    expect(clock.advance(2_000)).toBeCloseTo(0.05)
  })

  it('does not absorb wall time while any pause reason is active', () => {
    const clock = createHomeOrbitClock()
    clock.advance(1_000)
    clock.advance(1_016)
    const beforePause = clock.getElapsed()

    clock.setPaused('pointer', true)
    clock.advance(61_016)
    clock.setPaused('focus', true)
    clock.setPaused('pointer', false)
    clock.advance(121_016)
    expect(clock.getElapsed()).toBe(beforePause)

    clock.setPaused('focus', false)
    clock.advance(121_032)
    expect(clock.getElapsed() - beforePause).toBeCloseTo(0.016)
  })

  it('reports the complete set of active pause reasons', () => {
    const clock = createHomeOrbitClock()
    clock.setPaused('visibility', true)
    clock.setPaused('reduced-motion', true)
    expect(clock.getPauseReasons()).toEqual(new Set(['visibility', 'reduced-motion']))
  })

  it('supports deterministic local preview time and acceleration controls', () => {
    const clock = createHomeOrbitClock()
    clock.setElapsed(360)
    clock.setTimeScale(20)
    clock.advance(1_000)
    expect(clock.advance(1_050)).toBeCloseTo(361)
  })
})
