import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  it('renders the HORAE application landmark', () => {
    render(<App />)
    expect(screen.getByRole('main', { name: /horae studio/i })).toBeInTheDocument()
  })
})
