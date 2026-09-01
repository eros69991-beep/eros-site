export const HOMEPAGE_INTRO_SESSION_KEY = 'eros-studio:homepage-v2-intro-seen'
export const INTRO_DURATION_MS = 4_600
export const REDUCED_INTRO_DURATION_MS = 150

export interface SessionStorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function readHomepageIntroSeen(storage: SessionStorageLike): boolean {
  try {
    return storage.getItem(HOMEPAGE_INTRO_SESSION_KEY) === 'seen'
  } catch {
    return false
  }
}

export function markHomepageIntroSeen(storage: SessionStorageLike) {
  try {
    storage.setItem(HOMEPAGE_INTRO_SESSION_KEY, 'seen')
  } catch {
    // The opening may replay when session storage is unavailable.
  }
}

export function getHomepageIntroDuration(reducedMotion: boolean) {
  return reducedMotion ? REDUCED_INTRO_DURATION_MS : INTRO_DURATION_MS
}
