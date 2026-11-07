import { useEffect, useMemo, useRef, useState } from 'react'
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
import { WorldEntryProvider, useWorldEntry, useWorldEntryStore } from '../features/transitions/useWorldEntry'
import { alignUniverseCameraToWorld } from '../features/universe/universeCameraAlignment'
import { scrollToWorldTop } from '../features/transitions/scrollToWorldTop'
import { handoffWorldGateMaterial } from '../features/transitions/worldGateMaterialHandoff'
import { handoffHomepageMaterial } from '../features/transitions/homepageMaterialHandoff'
import { SceneHost } from '../scene/SceneHost'
import { useSiteStore } from '../state/siteStore'
import { useDocumentMeta } from './useDocumentMeta'
import type { WorldId } from '../domain/types'

// 比关键资源预加载的超时更长，正常进入流程不会触发。
const WORLD_HANDOFF_SAFETY_MS = 12_000

const ROUTE_WORLDS = new Set(['spring', 'summer', 'autumn', 'winter'])

// 当前路由所在的季节，用来给页面铺底色和设置顶部导航颜色。
function routeWorld(pathname: string): string | undefined {
  const match = /^\/world\/([^/]+)/.exec(pathname)
  return match && ROUTE_WORLDS.has(match[1]!) ? match[1] : undefined
}

interface OverlayState {
  backgroundLocation?: Location
}

export function AppShell() {
  useDocumentMeta()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const setRecentWorld = useSiteStore((state) => state.setRecentWorld)
  const setReducedVisualWorld = useSiteStore((state) => state.setReducedVisualWorld)
  const setWorldHandoff = useSiteStore((state) => state.setWorldHandoff)
  const worldHandoff = useSiteStore((state) => state.worldHandoff)
  const homepageMaterialHandoff = useSiteStore((state) => state.homepageMaterialHandoff)
  const setHomepageMaterialHandoff = useSiteStore((state) => state.setHomepageMaterialHandoff)
  const dependencies = useMemo(() => createWorldEntryDependencies({
    alignUniverse: alignUniverseCameraToWorld,
    handoffWorld: (world) => handoffWorldGateMaterial(world, { setWorldHandoff }),
    handoffHomepage: (world) => handoffHomepageMaterial(world, { setHomepageMaterialHandoff }),
    navigate: (world) => navigate(`/world/${world}`),
    preload: preloadCriticalWorldAssets,
    remember: setRecentWorld,
    activateReducedVisuals: setReducedVisualWorld,
    scrollToTop: scrollToWorldTop,
  }), [navigate, setHomepageMaterialHandoff, setRecentWorld, setReducedVisualWorld, setWorldHandoff])
  const backgroundLocation = (location.state as OverlayState | null)?.backgroundLocation
  const isOverlayRoute = location.pathname === '/search' || location.pathname === '/bag'
  const background = isOverlayRoute ? backgroundLocation : undefined

  return (
    <WorldEntryProvider dependencies={dependencies}>
      <div
        className={`app-shell ${sceneStyles.appShell}`}
        data-universe-home={location.pathname === '/' ? 'true' : undefined}
        data-route-world={routeWorld(location.pathname)}
        data-world-handoff={worldHandoff ?? undefined}
      >
        <SceneHost />
        <div
          aria-hidden="true"
          className={sceneStyles.materialVeil}
          data-material-veil=""
          data-world={worldHandoff ?? undefined}
          // 从没有 3D 场景的页面（Archive 等）进入季节：过渡层盖住整页且不透明，
          // 避免季节色和原页面的文字、控件叠在一起。季节页之间切换保持原来的半透明效果。
          data-cover={location.pathname !== '/' && !routeWorld(location.pathname) ? 'true' : undefined}
        />
        {homepageMaterialHandoff ? (
          <HomepageTakeover key={homepageMaterialHandoff.world} world={homepageMaterialHandoff.world} />
        ) : null}
        <div className={sceneStyles.semanticLayer}>
          <a className="skip-link" href="#main-content" onClick={() => document.getElementById('main-content')?.focus()}>Skip to main content</a>
          <GlobalHeader menuButtonRef={menuButtonRef} />
          <main aria-label="EROS Studio" id="main-content" tabIndex={-1}>
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

/** 过渡层撤掉前淡出的时长（与 CSS 一致）。 */
const HOMEPAGE_TAKEOVER_FADE_MS = 260

/**
 * 首页点击星球后的整屏过渡层。季节页渲染后再等两帧（新场景首帧编译着色器的卡顿发生在这两帧里），
 * 然后淡出并移除。进入失败或一直没切到该季节时也会撤掉。
 */
function HomepageTakeover({ world }: { world: WorldId }) {
  const location = useLocation()
  const status = useWorldEntryStore((store) => store.state.status)
  const setHomepageMaterialHandoff = useSiteStore((store) => store.setHomepageMaterialHandoff)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (location.pathname === `/world/${world}`) {
      let second = 0
      const first = window.requestAnimationFrame(() => {
        second = window.requestAnimationFrame(() => setLeaving(true))
      })
      return () => {
        window.cancelAnimationFrame(first)
        window.cancelAnimationFrame(second)
      }
    }
    if (status === 'failed') {
      setHomepageMaterialHandoff(null)
      return undefined
    }
    const timeout = window.setTimeout(() => setHomepageMaterialHandoff(null), WORLD_HANDOFF_SAFETY_MS)
    return () => window.clearTimeout(timeout)
  }, [location.pathname, setHomepageMaterialHandoff, status, world])

  useEffect(() => {
    if (!leaving) return undefined
    const timeout = window.setTimeout(() => setHomepageMaterialHandoff(null), HOMEPAGE_TAKEOVER_FADE_MS)
    return () => window.clearTimeout(timeout)
  }, [leaving, setHomepageMaterialHandoff])

  return (
    <div
      aria-hidden="true"
      className={sceneStyles.homepageTakeover}
      data-homepage-takeover=""
      data-leaving={leaving ? 'true' : undefined}
      data-world={world}
    />
  )
}

function WorldEntryLayer() {
  const location = useLocation()
  const navigate = useNavigate()
  const { reset, state } = useWorldEntry()
  const worldHandoff = useSiteStore((store) => store.worldHandoff)
  const setWorldHandoff = useSiteStore((store) => store.setWorldHandoff)

  useEffect(() => {
    if (state.status === 'committing' && location.pathname === `/world/${state.world}`) reset()
  }, [location.pathname, reset, state])

  // 从菜单进入季节时，材质过渡层一直保持到季节页渲染出来的下一帧才撤掉，
  // 中间不会再露出原来的页面。
  useEffect(() => {
    if (!worldHandoff) return undefined
    if (location.pathname === `/world/${worldHandoff}`) {
      const frame = window.requestAnimationFrame(() => setWorldHandoff(null))
      return () => window.cancelAnimationFrame(frame)
    }
    // 进入失败：撤掉过渡层，让失败提示和原页面可见。
    if (state.status === 'failed') {
      setWorldHandoff(null)
      return undefined
    }
    // 兜底：无论什么原因一直没切到这个季节，几秒后也撤掉，不让它永远盖在页面上。
    const timeout = window.setTimeout(() => setWorldHandoff(null), WORLD_HANDOFF_SAFETY_MS)
    return () => window.clearTimeout(timeout)
  }, [location.pathname, setWorldHandoff, state.status, worldHandoff])

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
