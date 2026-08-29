import type { WorldId } from '../../domain/types'
import type { WorldSceneDescriptor } from '../../scene/contracts'
import { AUTUMN_EFFECTS } from './autumn/autumnAtmosphere'
import { SPRING_EFFECTS } from './spring/springAtmosphere'
import { SUMMER_EFFECTS } from './summer/summerAtmosphere'
import { WINTER_EFFECTS } from './winter/winterAtmosphere'

export const sceneRegistry: Partial<Record<WorldId, WorldSceneDescriptor>> = {
  spring: {
    load: () => import('./spring/SpringScene'),
    effects: SPRING_EFFECTS,
  },
  summer: {
    load: () => import('./summer/SummerScene'),
    effects: SUMMER_EFFECTS,
  },
  autumn: {
    load: () => import('./autumn/AutumnScene'),
    effects: AUTUMN_EFFECTS,
  },
  winter: {
    load: () => import('./winter/WinterScene.tsx'),
    effects: WINTER_EFFECTS,
  },
}
