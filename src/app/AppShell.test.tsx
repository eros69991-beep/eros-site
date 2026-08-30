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
