import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
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
})
