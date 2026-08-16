import type { CelestialDefinition, WorldDefinition } from './types'

export const worlds: WorldDefinition[] = [
  {
    id: 'spring',
    order: 1,
    season: 'SPRING',
    concept: 'AWAKENING',
    route: '/world/spring',
    gateLine: 'Air returns to the surface.',
    palette: { ground: '#07100C', foreground: '#DDE6DF', accent: '#7FA28C', atmosphere: '#AFC4BA' },
  },
  {
    id: 'summer',
    order: 2,
    season: 'SUMMER',
    concept: 'BURN',
    route: '/world/summer',
    gateLine: 'Light removes the last shelter.',
    palette: { ground: '#D7D0C3', foreground: '#1A1712', accent: '#E9DBBF', atmosphere: '#FFF8E9' },
  },
  {
    id: 'autumn',
    order: 3,
    season: 'AUTUMN',
    concept: 'FADE',
    route: '/world/autumn',
    gateLine: 'Warmth remains after form begins to leave.',
    palette: { ground: '#1A100C', foreground: '#D5C1AF', accent: '#7C4937', atmosphere: '#9D7C67' },
  },
  {
    id: 'winter',
    order: 4,
    season: 'WINTER',
    concept: 'FREEZE',
    route: '/world/winter',
    gateLine: 'Distance holds what motion cannot.',
    palette: { ground: '#0B0D10', foreground: '#DCE1E2', accent: '#83909A', atmosphere: '#BFC9CD' },
  },
]

export const celestials: CelestialDefinition[] = [
  { id: 'spring', label: 'Spring', route: '/world/spring', orbitRadius: 5.2, orbitPeriodSeconds: 150, rotationPeriodSeconds: 65, inclination: 0.24, depth: 2.1, scale: 0.55, phase: 0.3 },
  { id: 'summer', label: 'Summer', route: '/world/summer', orbitRadius: 6.4, orbitPeriodSeconds: 190, rotationPeriodSeconds: 52, inclination: 0.38, depth: 3.2, scale: 0.68, phase: 1.45 },
  { id: 'autumn', label: 'Autumn', route: '/world/autumn', orbitRadius: 7.6, orbitPeriodSeconds: 235, rotationPeriodSeconds: 83, inclination: 0.18, depth: 4.1, scale: 0.61, phase: 3, },
  { id: 'winter', label: 'Winter', route: '/world/winter', orbitRadius: 9, orbitPeriodSeconds: 290, rotationPeriodSeconds: 112, inclination: 0.31, depth: 5, scale: 0.72, phase: 4.25 },
  { id: 'studio', label: 'Studio', route: '/studio', orbitRadius: 10.8, orbitPeriodSeconds: 360, rotationPeriodSeconds: 150, inclination: 0.47, depth: 5.8, scale: 0.36, phase: 5.4 },
]
