import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useSiteStore } from '../state/siteStore'

vi.mock('./webgl', () => ({ supportsWebGL: () => true }))
vi.mock('./PostProcessingStack', () => ({
  RealtimeSceneLayer: ({ mobile, reducedMotion, onContextLost }: { mobile: boolean, reducedMotion: boolean, onContextLost(): void }) => (
    <>
      <output aria-label="Realtime scene" data-mobile={String(mobile)} data-reduced-motion={String(reducedMotion)}>realtime</output>
      <button type="button" onClick={onContextLost}>Lose WebGL context</button>
    </>
  ),
}))

import { SceneHost } from './SceneHost'

afterEach(() => {
  useSiteStore.getState().setReducedVisualWorld(null)
})

describe('SceneHost', () => {
  it('uses the image-safe static universe for a World marked reduced after entry asset failure', () => {
    useSiteStore.getState().setReducedVisualWorld('spring')

    render(<MemoryRouter initialEntries={['/world/spring']}><SceneHost /></MemoryRouter>)

    expect(screen.getByRole('region', { name: 'Static universe' })).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Realtime scene' })).not.toBeInTheDocument()
  })

  it('enters static mode after WebGL context loss without removing the route layer', async () => {
    const { user } = await import('@testing-library/user-event').then(({ default: userEvent }) => ({ user: userEvent.setup() }))
    render(<MemoryRouter><SceneHost /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'Lose WebGL context' }))

    expect(screen.getByRole('region', { name: 'Static universe' })).toBeInTheDocument()
  })

  it('reacts to live reduced-motion preference changes', () => {
    let listener: ((event: MediaQueryListEvent) => void) | undefined
    const matchMedia = vi.fn(() => ({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: (_type, callback) => { listener = callback as (event: MediaQueryListEvent) => void },
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
      onchange: null,
    }))
    vi.stubGlobal('matchMedia', matchMedia)

    render(<MemoryRouter><SceneHost /></MemoryRouter>)
    expect(screen.getByRole('status', { name: 'Realtime scene' })).toHaveAttribute('data-reduced-motion', 'false')

    act(() => listener?.({ matches: true } as MediaQueryListEvent))
    expect(screen.getByRole('status', { name: 'Realtime scene' })).toHaveAttribute('data-reduced-motion', 'true')
    vi.unstubAllGlobals()
  })

  it('uses the mobile composition for a narrow viewport on a desktop browser', () => {
    vi.stubGlobal('innerWidth', 390)

    render(<MemoryRouter><SceneHost /></MemoryRouter>)

    expect(screen.getByRole('status', { name: 'Realtime scene' })).toHaveAttribute('data-mobile', 'true')
    vi.unstubAllGlobals()
  })

  it('merges a development scene-error hook with the scene clock API', () => {
    render(<MemoryRouter><SceneHost /></MemoryRouter>)

    expect(window.__EROS_TEST_API__?.setSceneTime).toEqual(expect.any(Function))
    expect(window.__EROS_TEST_API__?.triggerSceneError).toEqual(expect.any(Function))
    act(() => window.__EROS_TEST_API__?.triggerSceneError?.())
    expect(screen.getByRole('button', { name: 'Retry realtime scene' })).toBeInTheDocument()
  })
})
