export type HomepageLod = 'low' | 'medium' | 'high'

export interface HomepageLodInput {
  core: boolean
  mobile: boolean
  quality: 'high' | 'balanced' | 'lite'
  selected: boolean
  foreground?: boolean
}

export function selectHomepageLod(input: HomepageLodInput): HomepageLod {
  if (input.mobile || input.quality === 'lite') return 'low'
  if (!input.core && !input.selected && !input.foreground) return 'low'
  return input.quality === 'high' ? 'high' : 'medium'
}
