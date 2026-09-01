import { render, screen } from '@testing-library/react'
import { HomeIntro } from './HomeIntro'

describe('HomeIntro', () => {
  it('shows the session opening phrase while active', () => {
    render(<HomeIntro active />)

    expect(screen.getByText('NOTHING STAYS EXPECTED.')).toBeInTheDocument()
  })
})
