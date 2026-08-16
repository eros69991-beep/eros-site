import { useRef } from 'react'
import { Outlet, Route, Routes, useLocation, type Location } from 'react-router-dom'
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
import { SceneHost } from '../scene/SceneHost'

interface OverlayState {
  backgroundLocation?: Location
}

export function AppShell() {
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const backgroundLocation = (location.state as OverlayState | null)?.backgroundLocation
  const isOverlayRoute = location.pathname === '/search' || location.pathname === '/bag'
  const background = isOverlayRoute ? backgroundLocation : undefined

  return (
    <div className={`app-shell ${sceneStyles.appShell}`}>
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
    </div>
  )
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
