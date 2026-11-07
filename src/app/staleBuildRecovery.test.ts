import { describe, expect, it, vi } from 'vitest'
import { isStaleChunkError, reloadOnceForStaleBuild } from './staleBuildRecovery'

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
  }
}

describe('stale build recovery', () => {
  it('recognises failed chunk loads in Safari, Chrome and Firefox', () => {
    expect(isStaleChunkError(new TypeError('Importing a module script failed.'))).toBe(true)
    expect(isStaleChunkError(new TypeError('Failed to fetch dynamically imported module: https://x/assets/AutumnScene-abc.js'))).toBe(true)
    expect(isStaleChunkError(new TypeError('error loading dynamically imported module'))).toBe(true)
    expect(isStaleChunkError(new Error('WebGL context lost'))).toBe(false)
  })

  it('reloads once, then not again within the cooldown', () => {
    const storage = memoryStorage()
    const reload = vi.fn()
    let time = 1_000_000

    expect(reloadOnceForStaleBuild({ storage, reload, now: () => time })).toBe(true)
    time += 5_000
    expect(reloadOnceForStaleBuild({ storage, reload, now: () => time })).toBe(false)
    time += 40_000
    expect(reloadOnceForStaleBuild({ storage, reload, now: () => time })).toBe(true)
    expect(reload).toHaveBeenCalledTimes(2)
  })
})
