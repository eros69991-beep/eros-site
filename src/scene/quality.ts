import type { QualityTier } from '../domain/types'

export interface PerformanceSignals {
  mobile: boolean
  deviceMemory: number | null
  cores: number
  reducedMotion: boolean
  webgl: boolean
}

export interface MobilePerformanceDeviceSignals {
  userAgentDataMobile: boolean | null
  userAgent: string
  maxTouchPoints: number
  coarsePointer: boolean
}

export interface SceneBudget {
  dpr: number
  maxDrawCalls: number
  maxParticles: number
  depthOfField: boolean
}

export const QUALITY_BUDGETS = {
  high: { dpr: 1.5, maxDrawCalls: 120, maxParticles: 4000, depthOfField: true },
  balanced: { dpr: 1.25, maxDrawCalls: 90, maxParticles: 2200, depthOfField: true },
  lite: { dpr: 1, maxDrawCalls: 60, maxParticles: 1200, depthOfField: false },
  static: { dpr: 1, maxDrawCalls: 0, maxParticles: 0, depthOfField: false },
} as const

const MOBILE_SCENE_CAP = {
  dpr: 1.25,
  maxDrawCalls: 60,
  maxParticles: 1200,
} as const

export function classifyMobilePerformanceDevice(
  signals: MobilePerformanceDeviceSignals,
): boolean {
  if (signals.userAgentDataMobile === true) return true

  const mobileUserAgent = /Android|iPad|iPhone|iPod|Mobile/i.test(signals.userAgent)
  const desktopModeIPad = /Macintosh/i.test(signals.userAgent) && signals.maxTouchPoints > 1
  if (mobileUserAgent || desktopModeIPad) return true

  return signals.coarsePointer && signals.maxTouchPoints > 0
}

export function getEffectiveSceneBudget(tier: QualityTier, mobile: boolean): SceneBudget {
  const tierBudget = QUALITY_BUDGETS[tier]
  if (!mobile) return tierBudget

  return {
    dpr: Math.min(tierBudget.dpr, MOBILE_SCENE_CAP.dpr),
    maxDrawCalls: Math.min(tierBudget.maxDrawCalls, MOBILE_SCENE_CAP.maxDrawCalls),
    maxParticles: Math.min(tierBudget.maxParticles, MOBILE_SCENE_CAP.maxParticles),
    depthOfField: tierBudget.depthOfField,
  }
}

export function selectInitialQuality(signals: PerformanceSignals): QualityTier {
  if (!signals.webgl) return 'static'
  const constrainedMemory = signals.deviceMemory !== null && signals.deviceMemory <= 2
  if (signals.mobile && (constrainedMemory || signals.cores <= 2)) return 'lite'
  if (signals.mobile) return 'balanced'
  if ((signals.deviceMemory ?? 8) >= 8 && signals.cores >= 6) return 'high'
  return 'balanced'
}

export interface QualityMonitor {
  recordFrameTime(ms: number): QualityTier
  reset(): QualityTier
}

const ROLLING_WINDOW_MS = 5_000
const SLOW_MEDIAN_MS = 28
const REQUIRED_SLOW_SAMPLES = 3

function nextRealtimeTier(tier: QualityTier): QualityTier {
  if (tier === 'high') return 'balanced'
  if (tier === 'balanced') return 'lite'
  return tier
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  const upper = sorted[middle] ?? 0
  if (sorted.length % 2 === 1) return upper
  return ((sorted[middle - 1] ?? upper) + upper) / 2
}

export function createQualityMonitor(
  initialTier: QualityTier,
  onDegrade: (tier: QualityTier) => void,
): QualityMonitor {
  let currentTier = initialTier
  let elapsed = 0
  let windowReady = false
  let consecutiveSlowSamples = 0
  let samples: Array<{ at: number; ms: number }> = []

  const clearSamples = () => {
    elapsed = 0
    windowReady = false
    consecutiveSlowSamples = 0
    samples = []
  }

  return {
    recordFrameTime(ms) {
      if (!Number.isFinite(ms) || ms <= 0 || nextRealtimeTier(currentTier) === currentTier) {
        return currentTier
      }

      elapsed += ms
      samples.push({ at: elapsed, ms })
      const cutoff = elapsed - ROLLING_WINDOW_MS
      samples = samples.filter((sample) => sample.at >= cutoff)

      if (!windowReady) {
        windowReady = elapsed >= ROLLING_WINDOW_MS
        return currentTier
      }

      consecutiveSlowSamples = median(samples.map((sample) => sample.ms)) > SLOW_MEDIAN_MS
        ? consecutiveSlowSamples + 1
        : 0

      if (consecutiveSlowSamples < REQUIRED_SLOW_SAMPLES) return currentTier

      currentTier = nextRealtimeTier(currentTier)
      clearSamples()
      onDegrade(currentTier)
      return currentTier
    },
    reset() {
      clearSamples()
      return currentTier
    },
  }
}
