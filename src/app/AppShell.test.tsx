import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useSiteStore } from '../state/siteStore'
import { TestRouter } from './AppRouter'

afterEach(() => {
  act(() => useSiteStore.getState().setWorldHandoff(null))
})

describe('AppShell material handoff', () => {
  it('places a non-interactive fixed material veil above the scene and below semantic UI', () => {
    act(() => useSiteStore.getState().setWorldHandoff('autumn'))
    const { container } = render(<TestRouter initialEntries={['/']} />)

    const veil = container.querySelector('[data-material-veil]')
    expect(veil).toHaveAttribute('aria-hidden', 'true')
    expect(veil).toHaveAttribute('data-world', 'autumn')
    expect(getComputedStyle(veil!).position).toBe('fixed')
    expect(getComputedStyle(veil!).zIndex).toBe('1')
    expect(getComputedStyle(veil!).pointerEvents).toBe('none')
  })
})

describe('AppShell route ground', () => {
  it.each([
    ['/world/spring', 'spring'],
    ['/world/summer', 'summer'],
    ['/world/autumn', 'autumn'],
    ['/world/winter', 'winter'],
  ])('marks %s with its world so the shell paints a matching ground behind the transparent scene', (path, world) => {
    const { container } = render(<TestRouter initialEntries={[path]} />)
    const shell = container.querySelector('.app-shell')
    expect(shell).toHaveAttribute('data-route-world', world)
    expect(shell).not.toHaveAttribute('data-universe-home')
  })

  it('leaves non-world routes without a world ground', () => {
    const { container } = render(<TestRouter initialEntries={['/archive']} />)
    expect(container.querySelector('.app-shell')).not.toHaveAttribute('data-route-world')
  })

  it('ignores unknown world ids', () => {
    const { container } = render(<TestRouter initialEntries={['/world/mars']} />)
    expect(container.querySelector('.app-shell')).not.toHaveAttribute('data-route-world')
  })
})

describe('AppShell world-gate material veil lifetime', () => {
  it('keeps the veil over the current page until the target world route is shown', () => {
    vi.useFakeTimers()
    try {
      act(() => useSiteStore.getState().setWorldHandoff('autumn'))
      const { container } = render(<TestRouter initialEntries={['/archive']} />)

      act(() => { vi.advanceTimersByTime(1_000) })
      expect(container.querySelector('[data-material-veil]')).toHaveAttribute('data-world', 'autumn')
      expect(useSiteStore.getState().worldHandoff).toBe('autumn')
    } finally {
      vi.useRealTimers()
    }
  })

  it('clears the veil on the frame after the target world renders', async () => {
    act(() => useSiteStore.getState().setWorldHandoff('autumn'))
    render(<TestRouter initialEntries={['/world/autumn']} />)

    await act(async () => { await new Promise((resolve) => requestAnimationFrame(() => resolve(null))) })
    expect(useSiteStore.getState().worldHandoff).toBeNull()
  })

  it('never leaves the veil up indefinitely when the world is not reached', () => {
    vi.useFakeTimers()
    try {
      act(() => useSiteStore.getState().setWorldHandoff('spring'))
      render(<TestRouter initialEntries={['/archive']} />)

      act(() => { vi.advanceTimersByTime(12_000) })
      expect(useSiteStore.getState().worldHandoff).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('AppShell world-gate veil cover mode', () => {
  it('covers scene-less pages completely so the season colour never mixes with their content', () => {
    act(() => useSiteStore.getState().setWorldHandoff('spring'))
    const { container } = render(<TestRouter initialEntries={['/archive']} />)
    const veil = container.querySelector('[data-material-veil]')
    expect(veil).toHaveAttribute('data-cover', 'true')
    expect(getComputedStyle(veil!).zIndex).toBe('3')
  })

  it.each(['/', '/world/autumn'])('keeps the original under-content veil on %s', (path) => {
    act(() => useSiteStore.getState().setWorldHandoff('winter'))
    const { container } = render(<TestRouter initialEntries={[path]} />)
    expect(container.querySelector('[data-material-veil]')).not.toHaveAttribute('data-cover')
  })
})
