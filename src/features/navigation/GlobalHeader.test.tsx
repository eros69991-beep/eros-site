import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { useSiteStore } from '../../state/siteStore'
import { GlobalHeader } from './GlobalHeader'

function renderHeader(initialEntry: string) {
  useSiteStore.setState({ bag: [] })
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <GlobalHeader menuButtonRef={createRef<HTMLButtonElement>()} />
    </MemoryRouter>,
  )
}

describe('GlobalHeader', () => {
  it('keeps the homepage header limited to EROS and MENU', () => {
    renderHeader('/')

    expect(screen.getByRole('link', { name: 'EROS' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'SEARCH' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /BAG/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'MENU' })).toBeInTheDocument()
  })

  it('preserves Search and Bag away from the homepage', () => {
    renderHeader('/archive')

    expect(screen.getByRole('link', { name: 'SEARCH' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'BAG 0' })).toBeInTheDocument()
  })
})
