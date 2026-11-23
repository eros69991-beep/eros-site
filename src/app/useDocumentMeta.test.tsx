import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TestRouter } from './AppRouter'

vi.mock('../scene/SceneHost', () => ({
  SceneHost: () => null,
}))

afterEach(() => {
  cleanup()
  document.title = 'KAIROHOU STUDIO'
})

describe('route document metadata', () => {
  it.each([
    ['/', 'KAIROHOU STUDIO'],
    ['/world/spring', 'SPRING / AWAKENING — KAIROHOU'],
    ['/world/summer', 'SUMMER / BURN — KAIROHOU'],
    ['/world/autumn', 'AUTUMN / FADE — KAIROHOU'],
    ['/world/winter', 'WINTER / FREEZE — KAIROHOU'],
    ['/archive', 'ARCHIVE / ALL OBJECTS — KAIROHOU'],
    ['/studio', 'THE STUDIO — KAIROHOU'],
    ['/search', 'SEARCH — KAIROHOU'],
    ['/bag', 'BAG — KAIROHOU'],
    ['/special/01', 'SPECIAL PROJECT 01 — KAIROHOU'],
    ['/product/prototype-spring-001', 'MIST SHELL — KAIROHOU'],
  ])('sets the page title for %s', (route, title) => {
    render(<TestRouter initialEntries={[route]} />)

    expect(document.title).toBe(title)
  })

  it('restores the default title when the route shell unmounts', () => {
    document.title = 'A previous document title'
    const { unmount } = render(<TestRouter initialEntries={['/archive']} />)

    expect(document.title).toBe('ARCHIVE / ALL OBJECTS — KAIROHOU')
    unmount()

    expect(document.title).toBe('KAIROHOU STUDIO')
  })
})
