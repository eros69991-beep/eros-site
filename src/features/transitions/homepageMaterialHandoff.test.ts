import { describe, expect, it, vi } from 'vitest'
import { HOMEPAGE_HANDOFF_MS, handoffHomepageMaterial } from './homepageMaterialHandoff'

describe('handoffHomepageMaterial', () => {
  it('covers the homepage and leaves the takeover for the shell to fade out', async () => {
    const setHomepageMaterialHandoff = vi.fn()
    const wait = vi.fn().mockResolvedValue(undefined)

    await handoffHomepageMaterial('winter', { setHomepageMaterialHandoff, wait })

    expect(setHomepageMaterialHandoff.mock.calls).toEqual([
      [{ world: 'winter', source: 'universe' }],
    ])
    expect(wait).toHaveBeenCalledWith(HOMEPAGE_HANDOFF_MS)
  })
})
