import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WorldEntryOverlay } from './WorldEntryOverlay'
import {
  createWorldEntryDependencies,
  preloadCriticalWorldAssets,
} from './worldEntryDependencies'
import { WorldEntryProvider, useWorldEntry, useWorldEntryStore } from './useWorldEntry'

function EntryTrigger() {
  const { enterWorld } = useWorldEntry()
  return <button type="button" onClick={() => enterWorld('spring', 'universe')}>Enter Spring</button>
}

afterEach(() => {
  act(() => useWorldEntryStore.getState().dispatch({ type: 'RESET' }))
  vi.restoreAllMocks()
})

describe('concrete World Entry dependencies', () => {
  it.each([
    { mobile: false, expectedSource: '/media/demo/spring-editorial-1600.webp' },
    { mobile: true, expectedSource: '/media/demo/spring-editorial-960.webp' },
  ])('loads the scene module and decodes the $expectedSource editorial source', async ({ expectedSource, mobile }) => {
    const decode = vi.fn().mockResolvedValue(undefined)
    const image = { decode, src: '' } as unknown as HTMLImageElement
    const loadScene = vi.fn().mockResolvedValue({ default: () => null })

    await preloadCriticalWorldAssets('spring', {
      createImage: () => image,
      loadScene,
      mobile,
    })

    expect(loadScene).toHaveBeenCalledOnce()
    expect(image.src).toBe(expectedSource)
    expect(decode).toHaveBeenCalledOnce()
  })

  it('aligns only a Universe source while Gate uses the material handoff', async () => {
    const alignUniverse = vi.fn().mockResolvedValue(undefined)
    const preload = vi.fn().mockResolvedValue(undefined)
    const navigate = vi.fn()
    const remember = vi.fn()
    const dependencies = createWorldEntryDependencies({ alignUniverse, navigate, preload, remember })

    await dependencies.alignTarget('summer', 'world-gate')
    expect(alignUniverse).not.toHaveBeenCalled()

    await dependencies.alignTarget('summer', 'universe')
    expect(alignUniverse).toHaveBeenCalledWith('summer')
  })

  it('turns a failed image decode into reduced-visual recovery that preserves the route choice', async () => {
    const committed: string[] = []
    const decode = vi.fn().mockRejectedValue(new Error('Editorial decode failed.'))
    const image = { decode, src: '' } as unknown as HTMLImageElement
    const dependencies = createWorldEntryDependencies({
      alignUniverse: async () => undefined,
      navigate: (world) => committed.push(world),
      preload: (world) => preloadCriticalWorldAssets(world, {
        createImage: () => image,
        loadScene: async () => ({ default: () => null }),
        mobile: false,
      }),
      remember: () => undefined,
    })
    const user = userEvent.setup()

    render(
      <WorldEntryProvider dependencies={dependencies}>
        <EntryTrigger />
        <WorldEntryOverlay onReturnToUniverse={() => undefined} />
      </WorldEntryProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Enter Spring' }))
    const recovery = await screen.findByRole('button', { name: /continue with reduced visuals/i })
    expect(screen.getByRole('status')).toHaveTextContent('Editorial decode failed.')

    await user.click(recovery)
    expect(committed).toEqual(['spring'])
  })
})
