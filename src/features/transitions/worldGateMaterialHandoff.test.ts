import { describe, expect, it, vi } from 'vitest'
import { handoffWorldGateMaterial, WORLD_GATE_HANDOFF_MS } from './worldGateMaterialHandoff'

describe('handoffWorldGateMaterial', () => {
  it('holds the selected World material for a bounded handoff before clearing it', async () => {
    const setWorldHandoff = vi.fn()
    const wait = vi.fn().mockResolvedValue(undefined)

    await handoffWorldGateMaterial('autumn', { setWorldHandoff, wait })

    expect(setWorldHandoff.mock.calls).toEqual([['autumn'], [null]])
    expect(wait).toHaveBeenCalledWith(WORLD_GATE_HANDOFF_MS)
  })

  it('uses an immediate handoff when reduced motion is active', async () => {
    const wait = vi.fn().mockResolvedValue(undefined)

    await handoffWorldGateMaterial('winter', { reducedMotion: true, setWorldHandoff: () => undefined, wait })

    expect(wait).toHaveBeenCalledWith(0)
  })
})
