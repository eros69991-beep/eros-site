import { describe, expect, it, vi } from 'vitest'
import { handoffWorldGateMaterial, WORLD_GATE_HANDOFF_MS } from './worldGateMaterialHandoff'

describe('handoffWorldGateMaterial', () => {
  it('holds the selected World material for a bounded handoff and leaves clearing to the shell', async () => {
    const setWorldHandoff = vi.fn()
    const wait = vi.fn().mockResolvedValue(undefined)

    await handoffWorldGateMaterial('autumn', { setWorldHandoff, wait })

    // 不在路由切换前撤掉，避免原页面闪回；由 AppShell 在季节页渲染后撤掉。
    expect(setWorldHandoff.mock.calls).toEqual([['autumn']])
    expect(wait).toHaveBeenCalledWith(WORLD_GATE_HANDOFF_MS)
  })

  it('uses an immediate handoff when reduced motion is active', async () => {
    const wait = vi.fn().mockResolvedValue(undefined)

    await handoffWorldGateMaterial('winter', { reducedMotion: true, setWorldHandoff: () => undefined, wait })

    expect(wait).toHaveBeenCalledWith(0)
  })
})
