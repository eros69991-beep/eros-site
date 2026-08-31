import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TestRouter } from './AppRouter'
import './styles/tokens.css'
import './styles/global.css'
import globalStyles from './styles/global.css?raw'
import tokenStyles from './styles/tokens.css?raw'
import navigationStyles from '../features/navigation/navigation.module.css?raw'
import archiveStyles from '../features/archive/archive.module.css?raw'
import searchStyles from '../features/search/search.module.css?raw'
import bagStyles from '../features/bag/bag.module.css?raw'
import productStyles from '../features/product/product.module.css?raw'
import studioStyles from '../features/studio/studio.module.css?raw'
import worldStyles from '../features/worlds/worlds.module.css?raw'

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

  it('moves skip navigation focus to the visible main target', async () => {
    const user = userEvent.setup()
    render(<TestRouter initialEntries={['/']} />)

    const main = screen.getByRole('main', { name: /eros studio/i })
    await user.click(screen.getByRole('link', { name: /skip to main content/i }))

    expect(main).toHaveFocus()
    expect(globalStyles).toMatch(/main:focus\s*\{[^}]*outline:/)
  })

  it('gives route navigation links a shared touch target without styling every prose link', () => {
    const routeLinks = [
      ['/studio', 'ARCHIVE / ALL OBJECTS'],
      ['/product/prototype-spring-001', /belongs to/i],
      ['/archive', /Mist Shell/],
      ['/search?q=mist', /Mist Shell/],
    ] as const

    for (const [route, name] of routeLinks) {
      const { unmount } = render(<TestRouter initialEntries={[route]} />)
      const link = screen.getByRole('link', { name })
      expect(link).toHaveClass('touch-link')
      expect(Number.parseFloat(getComputedStyle(link).minWidth)).toBeGreaterThanOrEqual(44)
      expect(Number.parseFloat(getComputedStyle(link).minHeight)).toBeGreaterThanOrEqual(44)
      unmount()
    }
  })

  it('uses safe-area spacing contracts in shared chrome and every route shell', () => {
    expect(tokenStyles).toContain('--space-safe-block-start')
    expect(tokenStyles).toContain('--space-safe-block-end')

    for (const stylesheet of [navigationStyles, archiveStyles, searchStyles, bagStyles, productStyles, studioStyles, worldStyles]) {
      expect(stylesheet).toContain('var(--space-safe-inline)')
      expect(stylesheet).toContain('var(--space-safe-inline-end)')
    }

    expect(navigationStyles).toContain('var(--space-safe-block-start)')
    for (const stylesheet of [archiveStyles, searchStyles, bagStyles, productStyles, studioStyles, worldStyles]) {
      expect(stylesheet).toContain('var(--space-safe-block-end)')
    }
  })
})
