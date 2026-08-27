import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useSiteStore } from '../../state/siteStore'
import { SemanticCelestialControls } from './SemanticCelestialControls'

function RouteIntent() {
  const location = useLocation()
  return <output aria-label="Route intent">{location.pathname}</output>
}

function renderControls() {
  useSiteStore.setState({ selectedCelestial: null })
  return render(
    <MemoryRouter initialEntries={['/']}>
      <SemanticCelestialControls />
      <Routes><Route path="*" element={<RouteIntent />} /></Routes>
    </MemoryRouter>,
  )
}

describe('SemanticCelestialControls', () => {
  it('keeps all five celestial labels keyboard reachable', async () => {
    const user = userEvent.setup()
    renderControls()

    for (const label of ['Spring / Awakening', 'Summer / Burn', 'Autumn / Fade', 'Winter / Freeze', 'Studio']) {
      await user.tab()
      expect(screen.getByRole('button', { name: label })).toHaveFocus()
    }
  })

  it('selects the focused celestial body', async () => {
    const user = userEvent.setup()
    renderControls()

    const winter = screen.getByRole('button', { name: 'Winter / Freeze' })
    winter.focus()
    await user.keyboard('{Enter}')

    expect(useSiteStore.getState().selectedCelestial).toBe('winter')
  })

  it('uses the first mobile tap to select without navigation', async () => {
    const user = userEvent.setup()
    renderControls()

    await user.click(screen.getByRole('button', { name: 'Winter / Freeze' }))

    expect(useSiteStore.getState().selectedCelestial).toBe('winter')
    expect(screen.getByRole('status', { name: 'Route intent' })).toHaveTextContent('/')
  })

  it('enters the selected celestial route with its explicit action', async () => {
    const user = userEvent.setup()
    renderControls()

    await user.click(screen.getByRole('button', { name: 'Winter / Freeze' }))
    await user.click(screen.getByRole('button', { name: 'Enter Winter / Freeze' }))

    expect(screen.getByRole('status', { name: 'Route intent' })).toHaveTextContent('/world/winter')
  })
})
