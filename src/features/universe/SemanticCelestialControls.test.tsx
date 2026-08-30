import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useSiteStore } from '../../state/siteStore'
import type { WorldEntryDependencies } from '../transitions/worldEntryMachine'
import { WorldEntryProvider, useWorldEntryStore } from '../transitions/useWorldEntry'
import { SemanticCelestialControls } from './SemanticCelestialControls'

function RouteIntent() {
  const location = useLocation()
  return <output aria-label="Route intent">{location.pathname}</output>
}

function renderControls(dependencies?: WorldEntryDependencies) {
  useSiteStore.setState({ selectedCelestial: null })
  useWorldEntryStore.getState().dispatch({ type: 'RESET' })
  const entryDependencies = dependencies ?? {
    alignTarget: async () => undefined,
    preloadCriticalAssets: async () => undefined,
    commitRoute: () => undefined,
    rememberWorld: () => undefined,
  }
  return render(
    <MemoryRouter initialEntries={['/']}>
      <WorldEntryProvider dependencies={entryDependencies}>
        <SemanticCelestialControls />
        <Routes><Route path="*" element={<RouteIntent />} /></Routes>
      </WorldEntryProvider>
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

  it('enters the selected World through the shared entry controller', async () => {
    const aligned: string[] = []
    const committed: string[] = []
    const dependencies: WorldEntryDependencies = {
      alignTarget: async (world, source) => { aligned.push(`${world}:${source}`) },
      preloadCriticalAssets: async () => undefined,
      commitRoute: (world) => committed.push(world),
      rememberWorld: () => undefined,
    }
    const user = userEvent.setup()
    renderControls(dependencies)

    await user.click(screen.getByRole('button', { name: 'Winter / Freeze' }))
    await user.click(screen.getByRole('button', { name: 'Enter Winter / Freeze' }))

    await waitFor(() => expect(committed).toEqual(['winter']))
    expect(aligned).toEqual(['winter:universe'])
    expect(screen.getByRole('status', { name: 'Route intent' })).toHaveTextContent('/')
  })
})
