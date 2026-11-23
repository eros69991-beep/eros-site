import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SPECIAL_01_CLIPS } from './clips'
import { SpecialProjectPage } from './SpecialProjectPage'

describe('SpecialProjectPage', () => {
  it('opens on the hidden door and lists every clip with a caption', () => {
    render(<SpecialProjectPage />, { wrapper: MemoryRouter })

    expect(screen.getByRole('heading', { level: 1, name: 'There is a door in this hood.' })).toBeInTheDocument()
    for (const clip of SPECIAL_01_CLIPS) {
      expect(screen.getByRole('heading', { level: 2, name: clip.title })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: 'COPY LINK' })).toBeInTheDocument()
  })
})
