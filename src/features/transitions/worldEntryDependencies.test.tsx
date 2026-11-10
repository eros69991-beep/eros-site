import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WorldEntryOverlay } from './WorldEntryOverlay'
import {
  createWorldEntryDependencies,
  preloadCriticalWorldAssets,
} from './worldEntryDependencies'
import { WorldEntryProvider, useWorldEntry, useWorldEntryStore } from './useWorldEntry'
import { useSiteStore } from '../../state/siteStore'

function EntryTrigger() {
  const { enterWorld } = useWorldEntry()
  return <button type="button" onClick={() => enterWorld('spring', 'universe')}>Enter Spring</button>
}

afterEach(() => {
  act(() => useWorldEntryStore.getState().dispatch({ type: 'RESET' }))
  useSiteStore.getState().setReducedVisualWorld(null)
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('concrete World Entry dependencies', () => {
  it('loads the scene module and warms the exact editorial and object pictures the World page renders', async () => {
    const warmPicture = vi.fn().mockResolvedValue(undefined)
    const loadScene = vi.fn().mockResolvedValue({ default: () => null })

    await preloadCriticalWorldAssets('spring', { loadScene, warmPicture })

    expect(loadScene).toHaveBeenCalledOnce()
    expect(warmPicture.mock.calls).toEqual([
      ['spring-editorial', '(max-width: 44rem) 100vw, 72vw'],
      ['spring-object-001', '(max-width: 44rem) 88vw, 62vw'],
      ['spring-object-002', '(max-width: 44rem) 88vw, 62vw'],
    ])
  })

  it('does not fail the entry when only a background object picture fails to warm', async () => {
    const warmPicture = vi.fn((key: string) => key.includes('object') ? Promise.reject(new Error('object failed')) : Promise.resolve())

    await expect(preloadCriticalWorldAssets('winter', {
      loadScene: async () => ({ default: () => null }),
      warmPicture,
    })).resolves.toBeUndefined()
  })

  it('rejects a never-resolving critical decode within the configured preload timeout', async () => {
    await expect(preloadCriticalWorldAssets('summer', {
      loadScene: async () => ({ default: () => null }),
      warmPicture: () => new Promise<void>(() => undefined),
      timeoutMs: 1,
    })).rejects.toThrow('Critical assets for summer timed out.')
  })

  it('aligns only a Universe source while Gate uses the material handoff', async () => {
    const alignUniverse = vi.fn().mockResolvedValue(undefined)
    const handoffWorld = vi.fn().mockResolvedValue(undefined)
    const preload = vi.fn().mockResolvedValue(undefined)
    const navigate = vi.fn()
    const remember = vi.fn()
    const dependencies = createWorldEntryDependencies({ alignUniverse, handoffWorld, navigate, preload, remember })

    await dependencies.alignTarget('summer', 'world-gate')
    expect(alignUniverse).not.toHaveBeenCalled()
    expect(handoffWorld).toHaveBeenCalledWith('summer')

    await dependencies.alignTarget('summer', 'universe')
    expect(alignUniverse).toHaveBeenCalledWith('summer')
  })

  it('starts the Universe camera move without waiting for it to settle', async () => {
    const alignUniverse = vi.fn(() => new Promise<void>(() => undefined))
    const dependencies = createWorldEntryDependencies({
      alignUniverse,
      navigate: vi.fn(),
      preload: vi.fn().mockResolvedValue(undefined),
      remember: vi.fn(),
    })

    await expect(dependencies.alignTarget('autumn', 'universe')).resolves.toBeUndefined()
    expect(alignUniverse).toHaveBeenCalledWith('autumn')
  })

  it('resets document scroll before committing a World route', () => {
    const events: string[] = []
    const scrollToTop = () => events.push('scroll')
    const navigate = (world: string) => events.push(`navigate:${world}`)
    const dependencies = createWorldEntryDependencies({
      alignUniverse: async () => undefined,
      navigate,
      preload: async () => undefined,
      remember: () => undefined,
      scrollToTop,
    })

    dependencies.commitRoute('winter')

    expect(events).toEqual(['scroll', 'navigate:winter'])
  })

  it('turns a failed image decode into reduced-visual recovery that preserves the route choice', async () => {
    const committed: string[] = []
    const decode = vi.fn((key: string) => key.endsWith('editorial') ? Promise.reject(new Error('Editorial decode failed.')) : Promise.resolve())
    const dependencies = createWorldEntryDependencies({
      alignUniverse: async () => undefined,
      navigate: (world) => committed.push(world),
      preload: (world) => preloadCriticalWorldAssets(world, {
        loadScene: async () => ({ default: () => null }),
        warmPicture: decode,
      }),
      remember: () => undefined,
      activateReducedVisuals: useSiteStore.getState().setReducedVisualWorld,
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
    expect(useSiteStore.getState().reducedVisualWorld).toBe('spring')
    expect(decode).toHaveBeenCalledWith('spring-editorial', '(max-width: 44rem) 100vw, 72vw')
  })
})
