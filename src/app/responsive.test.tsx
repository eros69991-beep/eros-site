import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TestRouter } from './AppRouter'
import './styles/tokens.css'
import './styles/global.css'

vi.mock('../scene/SceneHost', () => ({
  SceneHost: () => null,
}))

afterEach(() => {
  cleanup()
})

const routes = [
  ['/', 'EROSSTUDIO'],
  ['/world/spring', 'SPRING / AWAKENING'],
  ['/archive', 'ARCHIVE'],
  ['/product/prototype-spring-001', 'Mist Shell'],
  ['/studio', 'THE STUDIO'],
  ['/search', 'SEARCH'],
  ['/bag', 'BAG'],
] as const

describe('responsive route structure', () => {
  it.each(routes)('gives %s one main landmark, one page heading, and a skip link', (route, heading) => {
    const { container } = render(<TestRouter initialEntries={[route]} />)

    expect(screen.getAllByRole('main', { name: /eros studio/i })).toHaveLength(1)
    expect(screen.getAllByRole('heading', { level: 1, name: heading })).toHaveLength(1)
    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveAttribute('href', '#main-content')

    const ids = [...container.querySelectorAll('[id]')].map((element) => element.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives primary links, buttons, and text inputs a 44px touch target', () => {
    render(<TestRouter initialEntries={['/archive']} />)

    const primaryControls = [
      screen.getByRole('link', { name: 'EROS' }),
      screen.getByRole('button', { name: 'Reset filters' }),
      screen.getByRole('button', { name: 'MENU' }),
    ]

    for (const control of primaryControls) {
      const style = getComputedStyle(control)
      expect(Number.parseFloat(style.minWidth)).toBeGreaterThanOrEqual(44)
      expect(Number.parseFloat(style.minHeight)).toBeGreaterThanOrEqual(44)
    }
  })

  it('keeps Search input touch sized', () => {
    render(<TestRouter initialEntries={['/search']} />)

    expect(Number.parseFloat(getComputedStyle(screen.getByRole('searchbox')).minHeight)).toBeGreaterThanOrEqual(44)
  })
})
