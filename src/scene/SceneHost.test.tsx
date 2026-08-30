import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useSiteStore } from '../state/siteStore'

vi.mock('./webgl', () => ({ supportsWebGL: () => true }))
vi.mock('./PostProcessingStack', () => ({
  RealtimeSceneLayer: () => <output aria-label="Realtime scene">realtime</output>,
}))

import { SceneHost } from './SceneHost'

afterEach(() => {
  useSiteStore.getState().setReducedVisualWorld(null)
})

describe('SceneHost', () => {
  it('uses the image-safe static universe for a World marked reduced after entry asset failure', () => {
    useSiteStore.getState().setReducedVisualWorld('spring')

    render(<MemoryRouter initialEntries={['/world/spring']}><SceneHost /></MemoryRouter>)

    expect(screen.getByRole('navigation', { name: 'Static universe navigation' })).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Realtime scene' })).not.toBeInTheDocument()
  })
})
