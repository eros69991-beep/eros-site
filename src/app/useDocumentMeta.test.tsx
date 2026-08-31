import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TestRouter } from './AppRouter'

vi.mock('../scene/SceneHost', () => ({
  SceneHost: () => null,
}))

afterEach(() => {
  cleanup()
  document.title = 'EROS STUDIO'
})

describe('route document metadata', () => {
  it.each([
    ['/', 'EROS STUDIO'],
    ['/world/spring', 'SPRING / AWAKENING — EROS'],
    ['/world/summer', 'SUMMER / BURN — EROS'],
    ['/world/autumn', 'AUTUMN / FADE — EROS'],
    ['/world/winter', 'WINTER / FREEZE — EROS'],
    ['/archive', 'ARCHIVE / ALL OBJECTS — EROS'],
    ['/studio', 'THE STUDIO — EROS'],
    ['/search', 'SEARCH — EROS'],
    ['/bag', 'BAG — EROS'],
    ['/product/prototype-spring-001', 'MIST SHELL — EROS'],
  ])('sets the page title for %s', (route, title) => {
    render(<TestRouter initialEntries={[route]} />)

    expect(document.title).toBe(title)
  })

  it('restores the default title when the route shell unmounts', () => {
    document.title = 'A previous document title'
    const { unmount } = render(<TestRouter initialEntries={['/archive']} />)

    expect(document.title).toBe('ARCHIVE / ALL OBJECTS — EROS')
    unmount()

    expect(document.title).toBe('EROS STUDIO')
  })
})
