import type { WorldId } from '../../domain/types'
import type { WorldSceneDescriptor } from '../../scene/contracts'
import { SPRING_EFFECTS } from './spring/springAtmosphere'

export const sceneRegistry: Partial<Record<WorldId, WorldSceneDescriptor>> = {
  spring: {
    load: () => import('./spring/SpringScene'),
    effects: SPRING_EFFECTS,
  },
}
