import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { useSiteStore } from '../../state/siteStore'
import { ProductPage } from './ProductPage'

function renderProduct(entry: string) {
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/product/:slug" element={<ProductPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

afterEach(() => {
  act(() => useSiteStore.setState({ bag: [], storageAvailable: true }))
})

describe('ProductPage', () => {
  it('requires a size and announces validation before adding a sized Object', async () => {
    const user = userEvent.setup()
    renderProduct('/product/prototype-winter-001')

    await user.click(screen.getByRole('button', { name: 'Add to Bag' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Select a size before adding this Object to Bag.')
    expect(useSiteStore.getState().bag).toEqual([])
  })

  it('adds the matching selected size and links back to its World', async () => {
    const user = userEvent.setup()
    renderProduct('/product/prototype-winter-001')

    await user.click(screen.getByRole('radio', { name: 'M' }))
    await user.click(screen.getByRole('button', { name: 'Add to Bag' }))

    expect(useSiteStore.getState().bag).toEqual([
      { objectId: 'demo-winter-001', size: 'M', quantity: 1 },
    ])
    expect(screen.getByRole('link', { name: 'BELONGS TO — WINTER / FREEZE' })).toHaveAttribute('href', '/world/winter')
  })

  it('renders a safe not-found path for an unknown Object slug', () => {
    renderProduct('/product/unknown-object')

    expect(screen.getByRole('heading', { name: 'OBJECT UNAVAILABLE' })).toBeInTheDocument()
  })
})
