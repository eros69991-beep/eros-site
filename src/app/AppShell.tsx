import { useEffect, useMemo, useRef } from 'react'
import { Outlet, Route, Routes, useLocation, useNavigate, type Location } from 'react-router-dom'
import { ArchivePage } from '../features/archive/ArchivePage'
import { BagPage } from '../features/bag/BagPage'
import { HomePage } from '../features/home/HomePage'
import { GlobalHeader } from '../features/navigation/GlobalHeader'
import { WorldGate } from '../features/navigation/WorldGate'
import { NotFoundPage } from '../features/not-found/NotFoundPage'
import { ProductPage } from '../features/product/ProductPage'
import { SearchPage } from '../features/search/SearchPage'
import { StudioPage } from '../features/studio/StudioPage'
import { WorldPage } from '../features/worlds/WorldPage'
import sceneStyles from '../features/fallback/fallback.module.css'
import { WorldEntryOverlay } from '../features/transitions/WorldEntryOverlay'
import {
  createWorldEntryDependencies,
  preloadCriticalWorldAssets,
} from '../features/transitions/worldEntryDependencies'
import { WorldEntryProvider, useWorldEntry } from '../features/transitions/useWorldEntry'
import { alignUniverseCameraToWorld } from '../features/universe/universeCameraAlignment'
import { scrollToWorldTop } from '../features/transitions/scrollToWorldTop'
import { handoffWorldGateMaterial } from '../features/transitions/worldGateMaterialHandoff'
import { SceneHost } from '../scene/SceneHost'
import { useSiteStore } from '../state/siteStore'

interface OverlayState {
  backgroundLocation?: Location
}

export function AppShell() {
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const setRecentWorld = useSiteStore((state) => state.setRecentWorld)
  const setReducedVisualWorld = useSiteStore((state) => state.setReducedVisualWorld)
  const setWorldHandoff = useSiteStore((state) => state.setWorldHandoff)
  const worldHandoff = useSiteStore((state) => state.worldHandoff)
  const dependencies = useMemo(() => createWorldEntryDependencies({
    alignUniverse: alignUniverseCameraToWorld,
    handoffWorld: (world) => handoffWorldGateMaterial(world, { setWorldHandoff }),
    navigate: (world) => navigate(`/world/${world}`),
    preload: preloadCriticalWorldAssets,
    remember: setRecentWorld,
    activateReducedVisuals: setReducedVisualWorld,
    scrollToTop: scrollToWorldTop,
  }), [navigate, setRecentWorld, setReducedVisualWorld, setWorldHandoff])
  const backgroundLocation = (location.state as OverlayState | null)?.backgroundLocation
  const isOverlayRoute = location.pathname === '/search' || location.pathname === '/bag'
  const background = isOverlayRoute ? backgroundLocation : undefined

  return (
    <WorldEntryProvider dependencies={dependencies}>
      <div className={`app-shell ${sceneStyles.appShell}`} data-world-handoff={worldHandoff ?? undefined}>
        <SceneHost />
        <div className={sceneStyles.semanticLayer}>
          <GlobalHeader menuButtonRef={menuButtonRef} />
          <main aria-label="EROS Studio">
            {background ? <BackgroundRoute location={background} /> : null}
            <div className={background ? 'route-overlay' : undefined}>
              <Outlet />
            </div>
          </main>
        </div>
        <WorldGate openerRef={menuButtonRef} />
        <WorldEntryLayer />
      </div>
    </WorldEntryProvider>
  )
}

function WorldEntryLayer() {
  const location = useLocation()
  const navigate = useNavigate()
  const { reset, state } = useWorldEntry()

  useEffect(() => {
    if (state.status === 'committing' && location.pathname === `/world/${state.world}`) reset()
  }, [location.pathname, reset, state])

  return <WorldEntryOverlay onReturnToUniverse={() => navigate('/')} />
}

function BackgroundRoute({ location }: { location: Location }) {
  return (
    <div className="route-background">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/world/:worldId" element={<WorldPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/bag" element={<BagPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}
