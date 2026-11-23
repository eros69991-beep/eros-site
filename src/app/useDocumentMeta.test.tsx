import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TestRouter } from './AppRouter'

vi.mock('../scene/SceneHost', () => ({
  SceneHost: () => null,
}))

afterEach(() => {
  cleanup()
  document.title = 'HORAE STUDIO'
})

describe('route document metadata', () => {
  it.each([
    ['/', 'HORAE STUDIO'],
    ['/world/spring', 'SPRING / AWAKENING — HORAE'],
    ['/world/summer', 'SUMMER / BURN — HORAE'],
    ['/world/autumn', 'AUTUMN / FADE — HORAE'],
    ['/world/winter', 'WINTER / FREEZE — HORAE'],
    ['/archive', 'ARCHIVE / ALL OBJECTS — HORAE'],
    ['/studio', 'THE STUDIO — HORAE'],
    ['/search', 'SEARCH — HORAE'],
    ['/bag', 'BAG — HORAE'],
    ['/special/01', 'SPECIAL PROJECT 01 — HORAE'],
    ['/product/prototype-spring-001', 'MIST SHELL — HORAE'],
  ])('sets the page title for %s', (route, title) => {
    render(<TestRouter initialEntries={[route]} />)

    expect(document.title).toBe(title)
  })

  it('restores the default title when the route shell unmounts', () => {
    document.title = 'A previous document title'
    const { unmount } = render(<TestRouter initialEntries={['/archive']} />)

    expect(document.title).toBe('ARCHIVE / ALL OBJECTS — HORAE')
    unmount()

    expect(document.title).toBe('HORAE STUDIO')
  })
})
