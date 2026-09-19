import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { TestRouter } from '../../app/AppRouter'
import { SceneErrorBoundary } from '../../scene/SceneErrorBoundary'
import { SceneFallback } from './SceneFallback'
import { StaticUniverse } from './StaticUniverse'


function FaultingScene({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('scene render failed')
  return <p>Realtime scene ready</p>
}

function RecoveryHarness() {
  const [attempt, setAttempt] = useState(0)
  const [staticMode, setStaticMode] = useState(false)

  if (staticMode) return <StaticUniverse />

  return (
    <SceneErrorBoundary
      resetKey={attempt}
      fallback={(
        <SceneFallback
          onRetry={() => setAttempt((value) => value + 1)}
          onContinueStatic={() => setStaticMode(true)}
        />
      )}
    >
      <FaultingScene shouldThrow={attempt === 0} />
    </SceneErrorBoundary>
  )
}

describe('scene fallback paths', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps the current semantic route and five celestial links when WebGL is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

    render(<TestRouter initialEntries={['/world/winter']} />)

    expect(screen.getByRole('heading', { name: 'WINTER / FREEZE' })).toBeInTheDocument()
    const staticNavigation = screen.getByRole('navigation', { name: 'Static universe navigation' })
    expect(staticNavigation).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Spring|Summer|Autumn|Winter|Studio/ })).toHaveLength(5)
    expect(screen.getByTestId('static-orbits')).toBeInTheDocument()
    expect(screen.getByTestId('static-stars').querySelectorAll('i')).toHaveLength(72)
    expect(screen.getByRole('navigation', { name: 'Global navigation' })).toBeInTheDocument()
  })

  it('keeps the Home static Portal decorative while semantic controls remain the entry path', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    render(<TestRouter initialEntries={['/']} />)

    expect(screen.queryByTestId('static-orbits')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Studio' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '05 / STUDIO / UNKNOWN' })).toHaveAttribute('href', '/studio')
  })

  it('retries a failed scene without replacing the App Shell', async () => {
    const user = userEvent.setup()
    render(<RecoveryHarness />, { wrapper: MemoryRouter })

    await user.click(screen.getByRole('button', { name: 'Retry realtime scene' }))

    expect(screen.getByText('Realtime scene ready')).toBeInTheDocument()
  })

  it('continues from a failed scene with semantic static visuals', async () => {
    const user = userEvent.setup()
    render(<RecoveryHarness />, { wrapper: MemoryRouter })

    await user.click(screen.getByRole('button', { name: 'Continue with static visuals' }))

    expect(screen.getByRole('navigation', { name: 'Static universe navigation' })).toBeInTheDocument()
  })
})
