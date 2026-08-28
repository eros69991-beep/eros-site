import type { WorldId } from '../../domain/types'
import type { WorldSceneDescriptor } from '../../scene/contracts'
import { SPRING_EFFECTS } from './spring/springAtmosphere'
import { SUMMER_EFFECTS } from './summer/summerAtmosphere'

export const sceneRegistry: Partial<Record<WorldId, WorldSceneDescriptor>> = {
  spring: {
    load: () => import('./spring/SpringScene'),
    effects: SPRING_EFFECTS,
  },
  summer: {
    load: () => import('./summer/SummerScene'),
    effects: SUMMER_EFFECTS,
  },
}
