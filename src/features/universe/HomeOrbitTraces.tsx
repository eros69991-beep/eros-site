import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Group, Vector3 } from 'three'
import type { CelestialId } from '../../domain/types'
import { useSiteStore } from '../../state/siteStore'
import { HOME_BODY_LAYOUT } from './homeComposition'
import { homeOrbitClock } from './homeOrbitClock'
import { HOME_ORBIT_SPECS } from './homeOrbitConfig'
import { writeOrbitPosition } from './homeOrbitMath'

const TRACE_SEGMENTS = 160

function HomeOrbitTrace({ id }: { id: CelestialId }) {
  const groupRef = useRef<Group>(null)
  const points = useMemo(() => {
    const spec = HOME_ORBIT_SPECS[id]
    const core = new Vector3(...HOME_BODY_LAYOUT.core.position)
    return Array.from({ length: TRACE_SEGMENTS + 1 }, (_, index) => {
      const point = new Vector3()
      writeOrbitPosition(point, spec, (index / TRACE_SEGMENTS) * spec.periodSeconds)
      return point.add(core)
    })
  }, [id])

  useFrame(() => {
    if (!groupRef.current) return
    const pauses = homeOrbitClock.getPauseReasons()
    const interactionPaused = pauses.has('pointer') || pauses.has('focus')
    groupRef.current.visible = interactionPaused && useSiteStore.getState().selectedCelestial === id
  })

  return (
    <group ref={groupRef} visible={false}>
      <Line
        color="#b8c4c5"
        depthWrite={false}
        lineWidth={0.55}
        opacity={0.2}
        points={points}
        transparent
      />
    </group>
  )
}

export function HomeOrbitTraces() {
  return (Object.keys(HOME_ORBIT_SPECS) as CelestialId[]).map((id) => (
    <HomeOrbitTrace id={id} key={id} />
  ))
}
