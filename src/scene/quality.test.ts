import { QUALITY_BUDGETS, createQualityMonitor, selectInitialQuality } from './quality'
import { supportsWebGL } from './webgl'

describe('selectInitialQuality', () => {
  it.each([
    [
      { mobile: false, deviceMemory: 8, cores: 8, reducedMotion: false, webgl: true },
      'high',
    ],
    [
      { mobile: true, deviceMemory: 4, cores: 4, reducedMotion: false, webgl: true },
      'balanced',
    ],
    [
      { mobile: true, deviceMemory: 2, cores: 2, reducedMotion: false, webgl: true },
      'lite',
    ],
    [
      { mobile: true, deviceMemory: 8, cores: 8, reducedMotion: false, webgl: false },
      'static',
    ],
  ] as const)('selects %s signals as %s', (signals, expected) => {
    expect(selectInitialQuality(signals)).toBe(expected)
  })

  it('does not lower the visual tier for reduced motion alone', () => {
    expect(selectInitialQuality({
      mobile: false,
      deviceMemory: 8,
      cores: 8,
      reducedMotion: true,
      webgl: true,
    })).toBe('high')
  })

  it('publishes the exact ceilings consumed by scene implementations', () => {
    expect(QUALITY_BUDGETS).toEqual({
      high: { dpr: 1.5, maxDrawCalls: 120, maxParticles: 4000, depthOfField: true },
      balanced: { dpr: 1.25, maxDrawCalls: 90, maxParticles: 2200, depthOfField: true },
      lite: { dpr: 1, maxDrawCalls: 60, maxParticles: 1200, depthOfField: false },
      static: { dpr: 1, maxDrawCalls: 0, maxParticles: 0, depthOfField: false },
    })
  })
})

describe('createQualityMonitor', () => {
  it('degrades one tier only after three slow rolling-median samples', () => {
    const degradedTiers: string[] = []
    const monitor = createQualityMonitor('high', (tier) => degradedTiers.push(tier))

    for (let elapsed = 0; elapsed < 5_010; elapsed += 30) {
      monitor.recordFrameTime(30)
    }

    expect(degradedTiers).toEqual([])
    expect(monitor.recordFrameTime(30)).toBe('high')
    expect(monitor.recordFrameTime(30)).toBe('high')
    expect(monitor.recordFrameTime(30)).toBe('balanced')
    expect(degradedTiers).toEqual(['balanced'])
  })

  it('reset clears samples without auto-upgrading during the visit', () => {
    const monitor = createQualityMonitor('high', () => undefined)

    for (let elapsed = 0; elapsed < 5_100; elapsed += 30) {
      monitor.recordFrameTime(30)
    }

    expect(monitor.reset()).toBe('balanced')
    expect(monitor.recordFrameTime(16)).toBe('balanced')
  })

  it('keeps WebGL active at lite instead of degrading into the static fallback', () => {
    const degradedTiers: string[] = []
    const monitor = createQualityMonitor('lite', (tier) => degradedTiers.push(tier))

    for (let elapsed = 0; elapsed < 5_200; elapsed += 40) {
      monitor.recordFrameTime(40)
    }

    expect(degradedTiers).toEqual([])
    expect(monitor.recordFrameTime(40)).toBe('lite')
  })
})

describe('supportsWebGL', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('falls back from WebGL2 to WebGL1', () => {
    vi.stubGlobal('WebGLRenderingContext', class WebGLRenderingContext {})
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((contextId: string) => (
      contextId === 'webgl' ? {} : null
    )) as typeof HTMLCanvasElement.prototype.getContext)

    expect(supportsWebGL()).toBe(true)
  })

  it('returns false when context creation throws', () => {
    vi.stubGlobal('WebGLRenderingContext', class WebGLRenderingContext {})
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      throw new Error('context unavailable')
    })

    expect(supportsWebGL()).toBe(false)
  })
})
