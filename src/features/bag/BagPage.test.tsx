import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { useSiteStore } from '../../state/siteStore'
import { BagPage } from './BagPage'

function renderBag() {
  render(<MemoryRouter><BagPage /></MemoryRouter>)
}

afterEach(() => {
  act(() => useSiteStore.setState({ bag: [], storageAvailable: true }))
})

describe('BagPage', () => {
  it('shows the empty state and plainly states that checkout is unavailable', () => {
    renderBag()

    expect(screen.getByText('Your Bag is empty.')).toBeInTheDocument()
    expect(screen.getByText('Checkout is unavailable in this frontend prototype.')).toBeInTheDocument()
  })

  it('updates quantities, removes lines, and calculates the subtotal from known Objects', async () => {
    const user = userEvent.setup()
    act(() => useSiteStore.setState({
      bag: [
        { objectId: 'demo-spring-001', size: 'M', quantity: 2 },
        { objectId: 'demo-spring-001', size: 'L', quantity: 1 },
      ],
    }))
    renderBag()

    expect(screen.getByText('SUBTOTAL $1,440')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Increase Mist Shell, size M quantity' }))
    expect(screen.getByText('SUBTOTAL $1,920')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove Mist Shell, size L' }))

    expect(useSiteStore.getState().bag).toEqual([{ objectId: 'demo-spring-001', size: 'M', quantity: 3 }])
    expect(screen.getByText('SUBTOTAL $1,440')).toBeInTheDocument()
  })

  it('notices when Bag persistence is unavailable', () => {
    act(() => useSiteStore.setState({ storageAvailable: false }))
    renderBag()

    expect(screen.getByRole('status')).toHaveTextContent('Bag may not persist after refresh.')
  })
})
