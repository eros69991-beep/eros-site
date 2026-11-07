import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
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
