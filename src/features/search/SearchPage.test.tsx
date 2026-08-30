import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SearchPage } from './SearchPage'

function renderSearch(initialEntry = '/search') {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function OverlayContext() {
  const location = useLocation()
  const background = (location.state as { backgroundLocation?: { pathname: string } } | null)?.backgroundLocation
  return <output aria-label="Overlay context">{background?.pathname ?? 'missing'}</output>
}

describe('SearchPage', () => {
  it('explains searchable fields before a query is supplied', () => {
    renderSearch()

    expect(screen.getByText(/name, number, World, feel, type, material, and color/i)).toBeInTheDocument()
  })

  it('searches case-insensitively from the URL', () => {
    renderSearch('/search?q=HEATED%20silver')

    expect(screen.getByRole('searchbox')).toHaveValue('HEATED silver')
    expect(screen.getByRole('article')).toHaveTextContent('Heat Trace')
  })

  it('retains a no-result query and links to the Archive', () => {
    renderSearch('/search?q=not-a-catalog-field')

    expect(screen.getByRole('searchbox')).toHaveValue('not-a-catalog-field')
    expect(screen.getByRole('region', { name: 'No search results' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View Archive' })).toHaveAttribute('href', '/archive')
  })

  it('preserves desktop overlay context while changing and clearing the query', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={[{
        pathname: '/search',
        state: { backgroundLocation: { pathname: '/', search: '', hash: '', state: null, key: 'home' } },
      }]}>
        <Routes>
          <Route path="/search" element={<><SearchPage /><OverlayContext /></>} />
        </Routes>
      </MemoryRouter>,
    )

    const input = screen.getByRole('searchbox')
    await user.type(input, 'winter')
    expect(input).toHaveValue('winter')
    expect(screen.getByRole('status', { name: 'Overlay context' })).toHaveTextContent('/')

    await user.clear(input)
    expect(input).toHaveValue('')
    expect(screen.getByRole('status', { name: 'Overlay context' })).toHaveTextContent('/')
  })
})
