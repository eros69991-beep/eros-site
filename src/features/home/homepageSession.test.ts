import {
  getHomepageIntroDuration,
  HOMEPAGE_INTRO_SESSION_KEY,
  markHomepageIntroSeen,
  readHomepageIntroSeen,
} from './homepageSession'

describe('homepage intro session', () => {
  it('persists the opening as seen within the current session', () => {
    const session = new Map<string, string>()
    const storage = {
      getItem: (key: string) => session.get(key) ?? null,
      setItem: (key: string, value: string) => session.set(key, value),
    }

    expect(readHomepageIntroSeen(storage)).toBe(false)

    markHomepageIntroSeen(storage)

    expect(session.get(HOMEPAGE_INTRO_SESSION_KEY)).toBe('seen')
    expect(readHomepageIntroSeen(storage)).toBe(true)
  })

  it('shortens the opening for reduced-motion visitors', () => {
    expect(getHomepageIntroDuration(false)).toBe(4600)
    expect(getHomepageIntroDuration(true)).toBe(150)
  })
})
