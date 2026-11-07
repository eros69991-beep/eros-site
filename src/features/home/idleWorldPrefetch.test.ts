import { describe, expect, it, vi } from 'vitest'
import { startIdleWorldPrefetch } from './idleWorldPrefetch'

function manualScheduler() {
  const pending: Array<{ callback: () => void; delayMs: number }> = []
  return {
    pending,
    schedule: (callback: () => void, delayMs: number) => {
      const entry = { callback, delayMs }
      pending.push(entry)
      return () => {
        const index = pending.indexOf(entry)
        if (index >= 0) pending.splice(index, 1)
      }
    },
    async runNext() {
      pending.shift()?.callback()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    },
  }
}

describe('startIdleWorldPrefetch', () => {
  it('waits for the homepage to settle, then prefetches one world at a time', async () => {
    const scheduler = manualScheduler()
    const preload = vi.fn().mockResolvedValue(undefined)

    startIdleWorldPrefetch({ preload, schedule: scheduler.schedule, worlds: ['spring', 'summer'], delayMs: 3_000 })

    expect(scheduler.pending[0]!.delayMs).toBe(3_000)
    expect(preload).not.toHaveBeenCalled()

    await scheduler.runNext()
    expect(preload.mock.calls).toEqual([['spring']])

    await scheduler.runNext()
    expect(preload.mock.calls).toEqual([['spring'], ['summer']])
  })

  it('keeps going after one world fails', async () => {
    const scheduler = manualScheduler()
    const preload = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined)

    startIdleWorldPrefetch({ preload, schedule: scheduler.schedule, worlds: ['spring', 'summer'] })
    await scheduler.runNext()
    await scheduler.runNext()

    expect(preload.mock.calls).toEqual([['spring'], ['summer']])
  })

  it('stops when the homepage unmounts', async () => {
    const scheduler = manualScheduler()
    const preload = vi.fn().mockResolvedValue(undefined)

    const cancel = startIdleWorldPrefetch({ preload, schedule: scheduler.schedule, worlds: ['spring', 'summer'] })
    cancel()

    expect(scheduler.pending).toHaveLength(0)
    expect(preload).not.toHaveBeenCalled()
  })
})
