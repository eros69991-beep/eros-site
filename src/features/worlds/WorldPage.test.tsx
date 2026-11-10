import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mediaManifest } from '../../media/mediaManifest'
import { WorldPage } from './WorldPage'
import { WorldSceneFrame } from './WorldSceneFrame'
import { worldSceneProgressRef } from './worldSceneProgress'

const WORLD_CASES = [
  { id: 'spring', concept: 'AWAKENING', next: 'SUMMER', nextRoute: '/world/summer' },
  { id: 'summer', concept: 'BURN', next: 'AUTUMN', nextRoute: '/world/autumn' },
  { id: 'autumn', concept: 'FADE', next: 'WINTER', nextRoute: '/world/winter' },
  { id: 'winter', concept: 'FREEZE', next: 'SPRING', nextRoute: '/world/spring' },
] as const

function renderWorld(worldId: string) {
  return render(
    <MemoryRouter initialEntries={[`/world/${worldId}`]}>
      <Routes>
        <Route path="/world/:worldId" element={<WorldPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
  worldSceneProgressRef.current = 0
})

describe('WorldPage', () => {
  it.each(WORLD_CASES)('renders the ordered editorial contract for $id', ({ concept, id, next, nextRoute }) => {
    const { container } = renderWorld(id)
    const regions = screen.getAllByRole('region')

    expect(regions.map((region) => region.getAttribute('aria-label'))).toEqual([
      'Atmosphere',
      'Editorial',
      'Objects',
      'Next World',
    ])
    expect(within(regions[0]!).getByRole('heading', { level: 1 })).toHaveTextContent(concept)
    expect(within(regions[0]!).getByRole('heading', { level: 1 })).toHaveAccessibleName(`${id.toUpperCase()} / ${concept}`)

    const objectRegion = within(regions[2]!)
    const objects = objectRegion.getAllByRole('article')
    expect(objects).toHaveLength(2)
    for (const object of objects) {
      expect(object).toHaveTextContent(/PROTOTYPE 00\d/)
      expect(object).toHaveTextContent(new RegExp(id, 'i'))
      expect(within(object).getByText(/^\$\d+/)).toBeInTheDocument()
    }

    const nextLink = within(regions[3]!).getByRole('link', { name: new RegExp(next, 'i') })
    expect(nextLink).toHaveAttribute('href', nextRoute)
    expect(container.querySelector(`[data-world="${id}"]`)).toBeInTheDocument()
  })

  it('resets scroll before a direct Next World navigation', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    renderWorld('spring')

    await user.click(screen.getByRole('link', { name: /summer/i }))

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName('SUMMER / BURN')
  })

  it('renders responsive editorial and Object images only from the generated manifest', () => {
    renderWorld('spring')

    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(3)
    expect(images.map((image) => image.getAttribute('alt'))).toEqual([
      mediaManifest['spring-editorial'].alt,
      mediaManifest['spring-object-001'].alt,
      mediaManifest['spring-object-002'].alt,
    ])

    for (const image of images) {
      expect(image).toHaveAttribute('width')
      expect(image).toHaveAttribute('height')
      expect(image.getAttribute('src')).toMatch(/^\/media\/demo\/.+-960\.webp$/)
      const picture = image.closest('picture')
      const sources = picture?.querySelectorAll('source') ?? []
      expect(sources).toHaveLength(2)
      expect(sources[0]?.getAttribute('srcset')).toMatch(/-640\.avif 640w, .+-960\.avif 960w, .+-1600\.avif 1600w/)
      expect(sources[1]?.getAttribute('srcset')).toMatch(/-640\.webp 640w, .+-960\.webp 960w, .+-1600\.webp 1600w/)
    }

    // 季节页只有主图和两张单品图，都提前预热过，不再懒加载
    for (const image of images) expect(image).not.toHaveAttribute('loading', 'lazy')
  })
})

describe('WorldSceneFrame', () => {
  it('writes normalized document scroll through RAF and cleans up its listener and frame', () => {
    let scheduledFrame: FrameRequestCallback | undefined
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      scheduledFrame = callback
      return 41
    })
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)
    const addListener = vi.spyOn(window, 'addEventListener')
    const removeListener = vi.spyOn(window, 'removeEventListener')
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2_000 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1_000 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 500 })

    const { unmount } = render(<WorldSceneFrame reducedMotion={false}><p>World content</p></WorldSceneFrame>)

    expect(addListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
    expect(requestFrame).toHaveBeenCalledTimes(1)
    scheduledFrame?.(0)
    expect(worldSceneProgressRef.current).toBe(0.5)

    fireEvent.scroll(window)
    expect(requestFrame).toHaveBeenCalledTimes(2)
    unmount()

    expect(removeListener).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(cancelFrame).toHaveBeenCalledWith(41)
  })

  it('keeps a stable completed atmosphere while reduced motion leaves semantic scrolling untouched', () => {
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame')
    const addListener = vi.spyOn(window, 'addEventListener')

    render(<WorldSceneFrame reducedMotion><p>World content</p></WorldSceneFrame>)

    expect(screen.getByText('World content')).toBeInTheDocument()
    expect(worldSceneProgressRef.current).toBe(1)
    expect(requestFrame).not.toHaveBeenCalled()
    expect(addListener).not.toHaveBeenCalledWith('scroll', expect.any(Function), expect.anything())
  })
})
