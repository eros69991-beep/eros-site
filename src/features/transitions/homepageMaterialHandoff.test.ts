import { describe, expect, it, vi } from 'vitest'
import { HOMEPAGE_HANDOFF_MS, handoffHomepageMaterial } from './homepageMaterialHandoff'

describe('handoffHomepageMaterial', () => {
  it('covers the homepage before it clears the handoff', async () => {
    const setHomepageMaterialHandoff = vi.fn()
    const wait = vi.fn().mockResolvedValue(undefined)

    await handoffHomepageMaterial('winter', { setHomepageMaterialHandoff, wait })

    expect(setHomepageMaterialHandoff.mock.calls).toEqual([
      [{ world: 'winter', source: 'universe' }],
      [null],
    ])
    expect(wait).toHaveBeenCalledWith(HOMEPAGE_HANDOFF_MS)
  })
})
