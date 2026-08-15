# EROS STUDIO V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete local EROS STUDIO brand-frontend V1 with a realtime five-body EROS Universe, four distinct seasonal Worlds, a restrained Studio, Archive, Search, Product Detail, and a persistent local Bag.

**Architecture:** A semantic React application owns routing, editorial content, navigation, accessibility, and commerce while one fixed R3F Scene Host owns realtime WebGL atmosphere and route-aware scene transitions. World definitions and Object data are typed and shared across the DOM and scene layers; every World scene is lazy-loaded, every WebGL scene uses `@react-three/postprocessing`, and Lite/reduced-motion/static fallbacks preserve the complete browsing path.

**Tech Stack:** Vite, React, TypeScript, React Router, Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, Zustand, Motion, CSS Modules, Vitest, React Testing Library, Playwright, axe-core, and Sharp for demo-media optimization.

## Global Constraints

- React + React Three Fiber + Three.js are hard requirements.
- Use the hybrid realtime approach: WebGL for Universe/World atmosphere and semantic React for editorial and commerce.
- `@react-three/postprocessing` is installed and active through `EffectComposer` in every WebGL scene; only the no-WebGL static fallback omits it.
- Configured Worlds are exactly Spring / AWAKENING, Summer / BURN, Autumn / FADE, and Winter / FREEZE.
- The fifth celestial entrance is The Studio; it is smaller, darker, farther, and lower-weight than the four product Worlds.
- Public product organization is World/feel first; type, material, and color remain filter attributes.
- V1 includes functional Search and a browser-local Bag but excludes checkout, payment, inventory, accounts, orders, CMS, analytics, and public deployment.
- Desktop Home critical assets must be no more than 3 MB; mobile Home critical assets must be no more than 1.5 MB; initial mobile World entry assets must be no more than 2 MB.
- Desktop targets 60 FPS and must not remain below 45 FPS during complex transitions; mobile targets stable 30–45 FPS.
- Desktop ceilings: DPR 1.5, 120 draw calls, 4,000 particles. Mobile ceilings: DPR 1.25, 60 draw calls, 1,200 particles.
- Target WCAG 2.2 AA, visible keyboard focus, `44 × 44px` touch targets, focus trapping/restoration, semantic canvas alternatives, and live reduced-motion preference changes.
- Mobile must be recomposed, not scaled from desktop; no essential action may depend on Hover, pointer precision, gyroscope, or device orientation.
- Native scrolling remains authoritative; do not introduce scroll hijacking, mandatory snapping, fake loading percentages, forced dwell time, autoplay sound, or competing animation runtimes.
- Demonstration Objects and media must be labeled as prototypes and must not imply real released EROS products or an invented brand history.
- If a test or browser check fails, invoke `superpowers:systematic-debugging` before editing. Before any completion claim, invoke `superpowers:verification-before-completion`.

## File and Responsibility Map

```text
index.html                              Document shell and route-independent metadata
package.json                            Scripts and exact installed dependencies
vite.config.ts                          Vite/Vitest configuration and asset handling
tsconfig*.json                          Strict TypeScript configuration
eslint.config.js                        TypeScript, React, hooks, and accessibility linting

src/main.tsx                            Browser bootstrap
src/vite-env.d.ts                       Vite types and development/test scene API typing
src/app/App.tsx                         Root provider composition
src/app/AppRouter.tsx                   Canonical routes and route-backed overlays
src/app/AppShell.tsx                    Header, Scene Host, page outlet, and live regions
src/app/useDocumentMeta.ts              Route-specific document titles and descriptions
src/app/styles/tokens.css               Global neutral and World design tokens
src/app/styles/global.css               Reset, typography roles, focus, safe areas

src/domain/types.ts                     World, celestial, Object, media, and Bag types
src/domain/worlds.ts                    Four Worlds and Studio celestial definitions
src/domain/objects.ts                   Clearly marked demonstration Object fixtures
src/domain/selectors.ts                 Typed lookup, Archive filter, and Search functions
src/domain/validate.ts                  Runtime fixture validation

src/state/siteStore.ts                  Shared selection, transition, quality, menu, recent World, and Bag state
src/state/storage.ts                    Versioned local persistence with memory fallback

src/scene/contracts.ts                  Scene and effect-profile interfaces
src/scene/quality.ts                    High/Balanced/Lite/static detection and budgets
src/scene/webgl.ts                      WebGL support/context helpers
src/scene/SceneHost.tsx                 Fixed Canvas, route scene selection, and error boundary
src/scene/PostProcessingStack.tsx       Always-on WebGL composer with tier-aware passes
src/scene/SceneErrorBoundary.tsx        Scene-local failure isolation and retry
src/scene/sceneClock.ts                 Stable elapsed time and test-only visual clock override

src/features/navigation/GlobalHeader.tsx    Persistent global navigation
src/features/navigation/WorldGate.tsx       Full-screen efficiency navigation
src/features/navigation/navigation.module.css

src/features/universe/universeConfig.ts     Orbit/material configuration
src/features/universe/universeMath.ts       Pure orbit and seeded-star functions
src/features/universe/UniverseScene.tsx     EROS Core, celestial bodies, stars, dust, camera rig
src/features/universe/ErosCore.tsx          Earth-derived Core material and atmosphere
src/features/universe/CelestialBody.tsx     Reusable orbiting/selectable body
src/features/universe/StarField.tsx         Deterministic multi-depth stars
src/features/universe/SemanticCelestialControls.tsx  Accessible synchronized controls
src/features/universe/universe.module.css

src/features/transitions/worldEntryMachine.ts   Pure entry-transition reducer
src/features/transitions/worldEntryStore.ts     Shared Zustand transition state
src/features/transitions/useWorldEntry.ts        Asset-readiness and navigation coordinator
src/features/transitions/WorldEntryOverlay.tsx   Route transition visual/semantic feedback
src/features/transitions/transitions.module.css

src/features/worlds/sceneRegistry.ts        Lazy World-scene registry
src/features/worlds/WorldSceneFrame.tsx     Shared scroll-progress bridge
src/features/worlds/WorldPage.tsx           Atmosphere → Editorial → Objects → Next World
src/features/worlds/WorldObjectField.tsx    World-owned product discovery
src/features/worlds/worlds.module.css
src/features/worlds/spring/SpringScene.tsx
src/features/worlds/spring/spring.module.css
src/features/worlds/summer/SummerScene.tsx
src/features/worlds/summer/summer.module.css
src/features/worlds/autumn/AutumnScene.tsx
src/features/worlds/autumn/autumn.module.css
src/features/worlds/winter/WinterScene.tsx
src/features/worlds/winter/winter.module.css

src/features/archive/ArchivePage.tsx        URL-backed World/type/material/color filtering
src/features/archive/archive.module.css
src/features/search/SearchPage.tsx          Route-backed accessible Search overlay/surface
src/features/search/search.module.css
src/features/product/ProductPage.tsx        Quiet product detail and size validation
src/features/product/product.module.css
src/features/bag/BagPage.tsx                Route-backed local Bag overlay/surface
src/features/bag/bag.module.css
src/features/studio/StudioPage.tsx          Restrained Studio/About structure
src/features/studio/studio.module.css
src/features/fallback/StaticUniverse.tsx    No-WebGL layered celestial navigation
src/features/fallback/SceneFallback.tsx     Lite/static/error status and retry
src/features/fallback/fallback.module.css

src/media/mediaManifest.ts                  Exact demo-media metadata and responsive variants
scripts/build-demo-media.mjs                Sharp conversion and responsive WebP/AVIF generation
scripts/check-performance-budgets.mjs       Built-asset byte-budget enforcement

src/test/setup.ts                           DOM matchers, cleanup, reduced-motion defaults
src/**/*.test.ts(x)                         Unit and component tests colocated by feature
e2e/navigation.spec.ts                      Universe, Gate, route, and state restoration flows
e2e/commerce.spec.ts                        Archive, Search, Product, and Bag flows
e2e/fallbacks.spec.ts                       Reduced-motion, WebGL failure, asset failure
e2e/accessibility.spec.ts                   axe and keyboard-only verification
e2e/visual.spec.ts                          Stable desktop/mobile screenshots
playwright.config.ts                        Browser projects and artifact policy

public/media/demo/                          Optimized, explicitly demonstrational media
README.md                                   Local run, verification, architecture, and prototype limits
docs/qa/eros-v1-checklist.md                Manual visual, interaction, and performance evidence checklist
```

The V1 remains one implementation plan because these areas share one route tree, one typed World/Object model, one Scene Host, and one accessibility/fallback contract. Each task below still produces an independently reviewable increment.

---

### Task 1: Project foundation and first routed smoke test

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `eslint.config.js`
- Create: `src/main.tsx`
- Create: `src/vite-env.d.ts`
- Create: `src/app/App.tsx`
- Create: `src/app/App.test.tsx`
- Create: `src/app/styles/tokens.css`
- Create: `src/app/styles/global.css`
- Create: `src/test/setup.ts`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: approved design specification at `docs/superpowers/specs/2026-08-15-eros-studio-design.md`.
- Produces: `App(): JSX.Element`, working `pnpm` scripts, strict TypeScript, and a passing DOM smoke test used by every later task.

- [ ] **Step 1: Create the package manifest and install the approved dependency set**

Create `package.json` with module mode and these scripts:

```json
{
  "name": "eros-studio",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "media:build": "node scripts/build-demo-media.mjs",
    "budget:check": "node scripts/check-performance-budgets.mjs"
  }
}
```

Run:

```bash
pnpm add react react-dom react-router-dom three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing zustand motion @fontsource-variable/instrument-sans @fontsource-variable/newsreader
pnpm add -D typescript vite @vitejs/plugin-react-swc vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test @axe-core/playwright sharp eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-plugin-jsx-a11y @types/react @types/react-dom @types/three
pnpm exec playwright install chromium
```

Expected: `pnpm-lock.yaml` is created and package installation exits 0.

- [ ] **Step 2: Configure strict TypeScript, Vite, Vitest, ESLint, and global styles**

Set `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, and `noUnusedParameters` in `tsconfig.app.json`. Configure Vitest with `environment: "jsdom"`, `setupFiles: ["./src/test/setup.ts"]`, and CSS Modules enabled. Configure ESLint for React hooks and JSX accessibility. Add `work/` and `outputs/` to `.gitignore` while retaining `.superpowers/`, build, coverage, and browser-artifact ignores.

- [ ] **Step 3: Write the failing root smoke test**

```tsx
import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  it('renders the EROS application landmark', () => {
    render(<App />)
    expect(screen.getByRole('main', { name: /eros studio/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run the test and verify the expected failure**

Run: `pnpm test -- src/app/App.test.tsx`

Expected: FAIL because `./App` does not exist or the named main landmark is absent.

- [ ] **Step 5: Implement the minimal browser entry and App landmark**

```tsx
// src/app/App.tsx
import './styles/tokens.css'
import './styles/global.css'

export function App() {
  return <main aria-label="EROS Studio">EROS STUDIO</main>
}
```

```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root application mount')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 6: Verify the foundation**

Run: `pnpm test -- src/app/App.test.tsx && pnpm lint && pnpm build`

Expected: all commands exit 0 and `dist/index.html` exists.

- [ ] **Step 7: Commit the foundation**

```bash
git add .gitignore package.json pnpm-lock.yaml index.html vite.config.ts tsconfig*.json eslint.config.js src
git commit -m "chore: establish EROS frontend foundation"
```

---

### Task 2: Typed World, celestial, and demonstration Object domain

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/worlds.ts`
- Create: `src/domain/objects.ts`
- Create: `src/domain/selectors.ts`
- Create: `src/domain/validate.ts`
- Create: `src/domain/domain.test.ts`

**Interfaces:**
- Consumes: no application state.
- Produces: `WorldId`, `CelestialId`, `WorldDefinition`, `CelestialDefinition`, `ObjectDefinition`, `worlds`, `celestials`, `demoObjects`, `getWorld(id)`, `getObject(slug)`, `filterObjects(filters)`, and `searchObjects(query)`.

- [ ] **Step 1: Write failing tests for the fixed inventory and prototype safety**

```ts
import { demoObjects } from './objects'
import { celestials, worlds } from './worlds'
import { validateCatalog } from './validate'

describe('EROS domain', () => {
  it('contains exactly four ordered seasonal Worlds and one Studio body', () => {
    expect(worlds.map((world) => world.id)).toEqual(['spring', 'summer', 'autumn', 'winter'])
    expect(celestials.map((body) => body.id)).toEqual(['spring', 'summer', 'autumn', 'winter', 'studio'])
  })

  it('marks every fixture as demonstrational', () => {
    expect(demoObjects.length).toBeGreaterThanOrEqual(8)
    expect(demoObjects.every((object) => object.prototype === true)).toBe(true)
    expect(() => validateCatalog(worlds, demoObjects)).not.toThrow()
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm test -- src/domain/domain.test.ts`

Expected: FAIL because the domain modules do not exist.

- [ ] **Step 3: Define the exact domain types**

```ts
export type WorldId = 'spring' | 'summer' | 'autumn' | 'winter'
export type CelestialId = WorldId | 'studio'
export type QualityTier = 'high' | 'balanced' | 'lite' | 'static'
export type CurrencyCode = 'USD'

export interface WorldDefinition {
  id: WorldId
  order: 1 | 2 | 3 | 4
  season: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER'
  concept: 'AWAKENING' | 'BURN' | 'FADE' | 'FREEZE'
  route: `/world/${WorldId}`
  gateLine: string
  palette: {
    ground: string
    foreground: string
    accent: string
    atmosphere: string
  }
}

export interface CelestialDefinition {
  id: CelestialId
  label: string
  route: `/world/${WorldId}` | '/studio'
  orbitRadius: number
  orbitPeriodSeconds: number
  rotationPeriodSeconds: number
  inclination: number
  depth: number
  scale: number
  phase: number
}

export interface ObjectMedia {
  src: string
  alt: string
  width: number
  height: number
  role: 'primary' | 'editorial' | 'detail'
}

export interface ObjectDefinition {
  id: string
  slug: string
  name: string
  objectNumber: string
  prototype: true
  world: WorldId
  feel: string[]
  type: 'outerwear' | 'top' | 'bottom' | 'accessory'
  material: string[]
  color: string[]
  price: number
  currency: CurrencyCode
  sizes: string[]
  media: ObjectMedia[]
  editorialCopy: string
  designConcept: string
  constructionNotes: string[]
}
```

- [ ] **Step 4: Create exact World, celestial, and eight Object fixtures**

Create four Worlds with the approved names and these implementation-start palette tokens:

| World | Ground | Foreground | Accent | Atmosphere |
|---|---:|---:|---:|---:|
| Spring | `#07100C` | `#DDE6DF` | `#7FA28C` | `#AFC4BA` |
| Summer | `#D7D0C3` | `#1A1712` | `#E9DBBF` | `#FFF8E9` |
| Autumn | `#1A100C` | `#D5C1AF` | `#7C4937` | `#9D7C67` |
| Winter | `#0B0D10` | `#DCE1E2` | `#83909A` | `#BFC9CD` |

Use prototype Gate lines `Air returns to the surface.`, `Light removes the last shelter.`, `Warmth remains after form begins to leave.`, and `Distance holds what motion cannot.` These lines remain explicitly demonstrational rather than approved production copy.

Create the five celestial definitions with these initial physical values:

| Body | Radius | Orbit period | Rotation period | Inclination | Depth | Scale | Phase |
|---|---:|---:|---:|---:|---:|---:|---:|
| Spring | 5.2 | 150s | 65s | 0.24 | 2.1 | 0.55 | 0.30 |
| Summer | 6.4 | 190s | 52s | 0.38 | 3.2 | 0.68 | 1.45 |
| Autumn | 7.6 | 235s | 83s | 0.18 | 4.1 | 0.61 | 3.00 |
| Winter | 9.0 | 290s | 112s | 0.31 | 5.0 | 0.72 | 4.25 |
| Studio | 10.8 | 360s | 150s | 0.47 | 5.8 | 0.36 | 5.40 |

Treat these as the implementation baseline to be visually tuned within the approved slow/cinematic direction. Keep periods unique and never increase velocity merely to make motion more obvious.

Create these eight clearly demonstrational Objects:

| ID / number | Name | World | Feel | Type | Material | Color | USD price | Sizes |
|---|---|---|---|---|---|---|---:|---|
| `demo-spring-001` / `PROTOTYPE 001` | Mist Shell | Spring | sheltered, porous | outerwear | coated cotton, mesh | graphite, mist | 480 | S, M, L |
| `demo-spring-002` / `PROTOTYPE 002` | Dew Spine | Spring | wet, emerging | accessory | stainless steel, resin | silver, moss | 190 | One Size |
| `demo-summer-001` / `PROTOTYPE 003` | Noon Veil | Summer | exposed, direct | top | technical nylon, mesh | bone, smoke | 260 | XS, S, M, L |
| `demo-summer-002` / `PROTOTYPE 004` | Heat Trace | Summer | sharp, overheated | accessory | aluminum, elastomer | heated silver, carbon | 160 | One Size |
| `demo-autumn-001` / `PROTOTYPE 005` | Erosion Layer | Autumn | weathered, residual | outerwear | waxed cotton, recycled wool | umber, ash | 520 | S, M, L |
| `demo-autumn-002` / `PROTOTYPE 006` | Afterlight Strap | Autumn | receding, dry | accessory | oxidized brass, leather | rust, black | 180 | One Size |
| `demo-winter-001` / `PROTOTYPE 007` | Still Field | Winter | isolated, severe | bottom | wool, nylon | frost, graphite | 340 | XS, S, M, L |
| `demo-winter-002` / `PROTOTYPE 008` | Cold Signal | Winter | distant, mechanical | accessory | stainless steel, cable | silver, black | 210 | One Size |

Use slugs `prototype-spring-001` through `prototype-winter-002`. Every media alt string starts with `Demonstration image:`. Store prices as USD whole-number values and format them through `Intl.NumberFormat`; never present fixture copy as real release history.

- [ ] **Step 5: Implement validation and selectors**

```ts
export interface ObjectFilters {
  world: WorldId[]
  type: ObjectDefinition['type'][]
  material: string[]
  color: string[]
}

export function getWorld(id: WorldId): WorldDefinition {
  const world = worlds.find((candidate) => candidate.id === id)
  if (!world) throw new Error(`Unknown World: ${id}`)
  return world
}

export function getObject(slug: string): ObjectDefinition | undefined {
  return demoObjects.find((object) => object.slug === slug)
}
```

`filterObjects` uses AND between filter groups and OR within a group. `searchObjects` performs trimmed, case-insensitive matching over name, number, World, feel, type, material, and color.

- [ ] **Step 6: Verify domain behavior**

Run: `pnpm test -- src/domain/domain.test.ts && pnpm lint`

Expected: PASS and no unsafe type assertions in domain files.

- [ ] **Step 7: Commit the domain**

```bash
git add src/domain
git commit -m "feat: define EROS Worlds and prototype Objects"
```

---

### Task 3: Shared Zustand state and resilient local persistence

**Files:**
- Create: `src/state/storage.ts`
- Create: `src/state/siteStore.ts`
- Create: `src/state/siteStore.test.ts`

**Interfaces:**
- Consumes: `CelestialId`, `QualityTier`, `WorldId`, and Object IDs from Task 2.
- Produces: `BagLine`, `SiteState`, `createSiteStore(storage)`, `useSiteStore`, `BAG_STORAGE_KEY`, and versioned persistence behavior.

- [ ] **Step 1: Write failing state tests**

```ts
import { createSiteStore } from './siteStore'
import { createMemoryStorage } from './storage'

describe('site store', () => {
  it('merges identical Object and size lines', () => {
    const store = createSiteStore(createMemoryStorage())
    store.getState().addToBag('demo-spring-001', 'M')
    store.getState().addToBag('demo-spring-001', 'M')
    expect(store.getState().bag).toEqual([
      { objectId: 'demo-spring-001', size: 'M', quantity: 2 },
    ])
  })

  it('keeps only the final celestial selection', () => {
    const store = createSiteStore(createMemoryStorage())
    store.getState().selectCelestial('spring')
    store.getState().selectCelestial('winter')
    expect(store.getState().selectedCelestial).toBe('winter')
  })
})
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `pnpm test -- src/state/siteStore.test.ts`

Expected: FAIL because the state modules do not exist.

- [ ] **Step 3: Implement storage adapters**

```ts
export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function createMemoryStorage(): StorageAdapter {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}
```

Wrap browser storage calls in `try/catch`. On failure, continue through the memory adapter and set `storageAvailable: false` in the site store.

- [ ] **Step 4: Implement the vanilla store and React hook**

```ts
export interface BagLine {
  objectId: string
  size: string
  quantity: number
}

export interface SiteState {
  selectedCelestial: CelestialId | null
  recentWorld: WorldId | null
  qualityTier: QualityTier
  worldGateOpen: boolean
  bag: BagLine[]
  storageAvailable: boolean
  selectCelestial(id: CelestialId | null): void
  setRecentWorld(id: WorldId): void
  setQualityTier(tier: QualityTier): void
  setWorldGateOpen(open: boolean): void
  addToBag(objectId: string, size: string): void
  setBagQuantity(objectId: string, size: string, quantity: number): void
  removeFromBag(objectId: string, size: string): void
}
```

Persist `{ version: 1, bag, recentWorld }` only. Never persist transition, focus, or reduced-motion state.

- [ ] **Step 5: Add migration and failure tests**

Test that malformed JSON resets to an empty Bag, a thrown `setItem` keeps in-memory state, quantity 0 removes a line, and another size creates a distinct line.

- [ ] **Step 6: Verify state and persistence**

Run: `pnpm test -- src/state/siteStore.test.ts && pnpm lint`

Expected: all state tests pass.

- [ ] **Step 7: Commit state management**

```bash
git add src/state
git commit -m "feat: add persistent local EROS state"
```

---

### Task 4: Canonical router, App Shell, header, and World Gate

**Files:**
- Create: `src/app/AppRouter.tsx`
- Create: `src/app/AppShell.tsx`
- Create: `src/features/navigation/GlobalHeader.tsx`
- Create: `src/features/navigation/WorldGate.tsx`
- Create: `src/features/navigation/navigation.module.css`
- Create: `src/features/navigation/WorldGate.test.tsx`
- Create: `src/features/home/HomePage.tsx`
- Create initial accessible route-heading implementations for `WorldPage`, `ArchivePage`, `SearchPage`, `ProductPage`, `BagPage`, `StudioPage`, and `NotFoundPage`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `worlds`, `useSiteStore`, and the fixed route table.
- Produces: `AppRouter`, `TestRouter`, `AppShell`, `GlobalHeader`, `WorldGate`, canonical route-backed overlay behavior, and initial accessible route pages.

- [ ] **Step 1: Write the failing World Gate focus test**

```tsx
it('opens, closes with Escape, and restores focus to Menu', async () => {
  const user = userEvent.setup()
  render(<TestRouter initialEntries={['/']} />)
  const menu = screen.getByRole('button', { name: /menu/i })
  await user.click(menu)
  expect(screen.getByRole('dialog', { name: /world gate/i })).toBeInTheDocument()
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog', { name: /world gate/i })).not.toBeInTheDocument()
  expect(menu).toHaveFocus()
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm test -- src/features/navigation/WorldGate.test.tsx`

Expected: FAIL because the router and Gate do not exist.

- [ ] **Step 3: Implement the canonical route tree**

Use `createBrowserRouter` for production and export `TestRouter({ initialEntries }: { initialEntries: string[] })`, which renders a `RouterProvider` created by `createMemoryRouter`. Routes are `/`, `/world/:worldId`, `/studio`, `/archive`, `/product/:slug`, `/search`, and `/bag`. Search and Bag preserve `location.state.backgroundLocation` so desktop can render them above the originating route while direct deep links remain complete standalone pages.

- [ ] **Step 4: Implement header and World Gate semantics**

`GlobalHeader` exposes `EROS`, `SEARCH`, `BAG {count}`, and `MENU`. `WorldGate` renders `role="dialog"`, `aria-modal="true"`, the four Worlds, Archive, Studio, Search, and Bag. Use a DOM focus trap with first/last sentinels, body scroll locking that restores the previous value, and exact opener-focus restoration.

- [ ] **Step 5: Add mobile and route tests**

Test that every Gate destination has the approved label and route, Bag count reflects quantities, mobile Search remains in the Gate, and a direct `/search` render has one `<main>` landmark.

- [ ] **Step 6: Verify navigation**

Run: `pnpm test -- src/features/navigation src/app && pnpm lint && pnpm build`

Expected: all tests and build pass.

- [ ] **Step 7: Commit navigation**

```bash
git add src/app src/features/navigation src/features/home src/features/worlds src/features/archive src/features/search src/features/product src/features/bag src/features/studio
git commit -m "feat: add EROS routes and World Gate"
```

---

### Task 5: Quality selection, Scene Host, and always-on postprocessing

**Files:**
- Create: `src/scene/contracts.ts`
- Create: `src/scene/quality.ts`
- Create: `src/scene/quality.test.ts`
- Create: `src/scene/webgl.ts`
- Create: `src/scene/SceneErrorBoundary.tsx`
- Create: `src/scene/PostProcessingStack.tsx`
- Create: `src/scene/PostProcessingStack.test.tsx`
- Create: `src/scene/SceneHost.tsx`
- Create: `src/features/fallback/StaticUniverse.tsx`
- Create: `src/features/fallback/SceneFallback.tsx`
- Create: `src/features/fallback/fallback.module.css`
- Create: `src/features/fallback/SceneFallback.test.tsx`
- Modify: `src/app/AppShell.tsx`

**Interfaces:**
- Consumes: `QualityTier` and `useSiteStore.setQualityTier`.
- Produces: `PerformanceSignals`, `EffectProfile`, `WorldSceneProps`, `WorldSceneDescriptor`, `selectInitialQuality(signals)`, `createQualityMonitor(initialTier, onDegrade)`, `supportsWebGL()`, `SceneHost`, and `PostProcessingStack`.

- [ ] **Step 1: Write failing quality-budget tests**

```ts
expect(selectInitialQuality({ mobile: false, deviceMemory: 8, cores: 8, reducedMotion: false, webgl: true })).toBe('high')
expect(selectInitialQuality({ mobile: true, deviceMemory: 4, cores: 4, reducedMotion: false, webgl: true })).toBe('balanced')
expect(selectInitialQuality({ mobile: true, deviceMemory: 2, cores: 2, reducedMotion: false, webgl: true })).toBe('lite')
expect(selectInitialQuality({ mobile: true, deviceMemory: 8, cores: 8, reducedMotion: false, webgl: false })).toBe('static')
```

- [ ] **Step 2: Run the quality test and verify failure**

Run: `pnpm test -- src/scene/quality.test.ts`

Expected: FAIL because `selectInitialQuality` is undefined.

- [ ] **Step 3: Implement exact tier budgets**

```ts
export interface PerformanceSignals {
  mobile: boolean
  deviceMemory: number | null
  cores: number
  reducedMotion: boolean
  webgl: boolean
}

export const QUALITY_BUDGETS = {
  high: { dpr: 1.5, maxDrawCalls: 120, maxParticles: 4000, depthOfField: true },
  balanced: { dpr: 1.25, maxDrawCalls: 90, maxParticles: 2200, depthOfField: true },
  lite: { dpr: 1, maxDrawCalls: 60, maxParticles: 1200, depthOfField: false },
  static: { dpr: 1, maxDrawCalls: 0, maxParticles: 0, depthOfField: false },
} as const

export function selectInitialQuality(signals: PerformanceSignals): QualityTier {
  if (!signals.webgl) return 'static'
  const constrainedMemory = signals.deviceMemory !== null && signals.deviceMemory <= 2
  if (signals.mobile && (constrainedMemory || signals.cores <= 2)) return 'lite'
  if (signals.mobile) return 'balanced'
  if ((signals.deviceMemory ?? 8) >= 8 && signals.cores >= 6) return 'high'
  return 'balanced'
}
```

Implement `createQualityMonitor(initialTier, onDegrade)` with `recordFrameTime(ms)` and `reset()`. It degrades one tier after a 5-second rolling median exceeds 28ms for three consecutive samples; it never auto-upgrades during the same page visit. Reduced motion changes frame-loop behavior but does not force a lower visual tier by itself.

Implement `supportsWebGL()` by attempting `webgl2`, then `webgl`, on a temporary canvas inside `try/catch`; return `false` in non-browser execution or on any thrown context error.

- [ ] **Step 4: Write the failing composer-presence test**

Mock `EffectComposer`, render `PostProcessingStack` with high, balanced, and lite profiles, and expect one composer in all three cases. Assert Lite omits depth of field but retains tone mapping and restrained Bloom.

- [ ] **Step 5: Implement the Scene Host and postprocessing contract**

```ts
export interface EffectProfile {
  bloomIntensity: number
  bloomThreshold: number
  noiseOpacity: number
  vignetteOffset: number
  vignetteDarkness: number
  depthOfField: boolean
}

export interface WorldSceneProps {
  quality: Exclude<QualityTier, 'static'>
  reducedMotion: boolean
  progress: { current: number }
}

export type WorldSceneComponent = import('react').ComponentType<WorldSceneProps>

export interface WorldSceneDescriptor {
  load: () => Promise<{ default: WorldSceneComponent }>
  effects: EffectProfile
}
```

Use these full-tier starting profiles; Balanced multiplies noise and Bloom by 0.8, and Lite multiplies them by 0.55 while forcing `depthOfField: false`:

| Route scene | Bloom intensity | Bloom threshold | Noise opacity | Vignette offset | Vignette darkness | DOF |
|---|---:|---:|---:|---:|---:|---|
| Universe | 0.32 | 0.78 | 0.012 | 0.24 | 0.36 | yes |
| Spring | 0.28 | 0.78 | 0.018 | 0.22 | 0.32 | yes |
| Summer | 0.18 | 0.90 | 0.008 | 0.12 | 0.16 | yes |
| Autumn | 0.22 | 0.82 | 0.024 | 0.30 | 0.44 | yes |
| Winter | 0.16 | 0.88 | 0.006 | 0.22 | 0.30 | no |
| Product / Archive / Studio | 0.10 | 0.92 | 0.004 | 0.16 | 0.18 | no |

Treat these as restrained tuning baselines. Tests enforce composer presence and tier multipliers; later visible review may lower an effect but must not silently add heavy or identity-changing passes.

`SceneHost` returns `StaticUniverse` when WebGL is unavailable. The initial Static Universe uses layered neutral CSS space, five semantic celestial links from the domain definitions, and the global navigation; Task 16 adds the final orbit styling and context-loss recovery. Otherwise Scene Host mounts one fixed `<Canvas>` and one `PostProcessingStack`. Use `frameloop="demand"` for reduced motion and `frameloop="always"` otherwise. Catch Canvas/scene errors below the App Shell and render `SceneFallback` with `Retry realtime scene` and `Continue with static visuals`.

- [ ] **Step 6: Verify the rendering foundation**

Run: `pnpm test -- src/scene && pnpm lint && pnpm build`

Expected: tier and composer tests pass; build tree contains Three/R3F in a lazy-capable chunk.

- [ ] **Step 7: Commit the Scene Host**

```bash
git add src/scene src/features/fallback src/app/AppShell.tsx
git commit -m "feat: add adaptive R3F scene host"
```

---

### Task 6: Deterministic EROS Universe and accessible celestial controls

**Files:**
- Create: `src/features/universe/universeConfig.ts`
- Create: `src/features/universe/universeMath.ts`
- Create: `src/features/universe/universeMath.test.ts`
- Create: `src/features/universe/ErosCore.tsx`
- Create: `src/features/universe/CelestialBody.tsx`
- Create: `src/features/universe/StarField.tsx`
- Create: `src/features/universe/UniverseScene.tsx`
- Create: `src/features/universe/SemanticCelestialControls.tsx`
- Create: `src/features/universe/SemanticCelestialControls.test.tsx`
- Create: `src/features/universe/universe.module.css`
- Create: `src/scene/sceneClock.ts`
- Modify: `src/features/home/HomePage.tsx`
- Modify: `src/scene/SceneHost.tsx`
- Modify: `src/vite-env.d.ts`

**Interfaces:**
- Consumes: `celestials`, `CelestialId`, quality budgets, `useSiteStore.selectCelestial`, and the Scene Host.
- Produces: `OrbitTransform`, `getOrbitTransform(body, elapsedSeconds)`, `createSeededStars(count, seed)`, `getSceneTime()`, test-only `window.__EROS_TEST_API__.setSceneTime(seconds)`, `UniverseScene`, and `SemanticCelestialControls`.

- [ ] **Step 1: Write failing pure-motion tests**

```ts
it('returns the same celestial transform for the same stable time', () => {
  const body = celestials.at(0)
  if (!body) throw new Error('Expected the Spring celestial definition')
  expect(getOrbitTransform(body, 137.5)).toEqual(getOrbitTransform(body, 137.5))
})

it('creates deterministic non-synchronized stars', () => {
  const first = createSeededStars(50, 1701)
  const second = createSeededStars(50, 1701)
  expect(first).toEqual(second)
  expect(new Set(first.map((star) => star.twinkleOffset)).size).toBeGreaterThan(40)
})
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm test -- src/features/universe/universeMath.test.ts`

Expected: FAIL because Universe math is absent.

- [ ] **Step 3: Implement stable orbit and star generation**

```ts
export interface OrbitTransform {
  position: [number, number, number]
  rotationY: number
}

export function getOrbitTransform(body: CelestialDefinition, elapsedSeconds: number): OrbitTransform {
  const theta = body.phase + (elapsedSeconds / body.orbitPeriodSeconds) * Math.PI * 2
  return {
    position: [
      Math.cos(theta) * body.orbitRadius,
      Math.sin(theta) * body.orbitRadius * body.inclination,
      Math.sin(theta) * body.depth,
    ],
    rotationY: (elapsedSeconds / body.rotationPeriodSeconds) * Math.PI * 2,
  }
}
```

Use a local seeded xorshift generator for star position, size, luminance, period, and offset. Do not call `Math.random()` during render.

`sceneClock.ts` returns monotonic elapsed seconds in production. In `import.meta.env.DEV` or test mode only, `window.__EROS_TEST_API__.setSceneTime(seconds)` freezes the clock at an exact value for deterministic browser screenshots. The production build must not expose the setter.

Add this development/test API typing to `src/vite-env.d.ts`:

```ts
interface Window {
  __EROS_TEST_API__?: {
    setSceneTime(seconds: number): void
    triggerSceneError?: () => void
  }
}
```

- [ ] **Step 4: Build the Earth-derived Core and five-body scene**

Implement the Core at position `[-0.6, 0.05, 0]` with radius `2.35`, base color `#071015`, roughness `0.72`, and metalness `0.08`. Add an atmosphere shell at radius `2.42`, color `#B7CAD3`, opacity `0.14`, backside/additive blending; add a cloud/noise shell at radius `2.375`, opacity `0.11`, rotating at `0.0025` radians per second; add at most 120 dim surface-light points with intensity no greater than `0.18` and no recognizable continent mask.

Map all five `celestials` into `CelestialBody`. Use low-saturation material cues derived from each World palette; Studio uses `#111318`, roughness `0.9`, no emissive accent, and the confirmed 0.36 scale. Orbit lines use opacity `0.025` at rest and `0.18` for the selected/focused body. High, Balanced, and Lite use 4000, 2200, and 1200 total star/dust particles respectively; 65% belong to the far field and 35% to the middle field. Star twinkle periods range from 8–28 seconds with luminance amplitude 0.08–0.22.

- [ ] **Step 5: Implement synchronized HTML controls and failing interaction tests**

Test that all five labels are keyboard reachable, focus selects the related celestial body, the first mobile Tap selects without navigation, and `ENTER` emits the selected route intent. Use buttons with accessible names such as `Select Winter / Freeze` and one explicit `Enter Winter / Freeze` action.

- [ ] **Step 6: Implement restrained desktop/mobile interaction**

Desktop pointer input affects a damped camera rig by at most 8 CSS-pixel-equivalent units. Mobile horizontal drag clamps observation-angle change and has no free spin. Reduced motion freezes orbit/camera animation at a deterministic composition and keeps semantic controls active.

- [ ] **Step 7: Verify Universe behavior**

Run: `pnpm test -- src/features/universe && pnpm lint && pnpm build`

Manual browser check at 1440×900 and 390×844: five bodies remain visible/reachable, Studio reads as lower-weight, no body moves quickly, and labels remain legible.

- [ ] **Step 8: Commit Universe**

```bash
git add src/features/universe src/features/home/HomePage.tsx src/scene/SceneHost.tsx src/scene/sceneClock.ts src/vite-env.d.ts
git commit -m "feat: build the realtime EROS Universe"
```

---

### Task 7: Asset-aware World Entry transition state machine

**Files:**
- Create: `src/features/transitions/worldEntryMachine.ts`
- Create: `src/features/transitions/worldEntryMachine.test.ts`
- Create: `src/features/transitions/worldEntryStore.ts`
- Create: `src/features/transitions/useWorldEntry.ts`
- Create: `src/features/transitions/WorldEntryOverlay.tsx`
- Create: `src/features/transitions/WorldEntryOverlay.test.tsx`
- Create: `src/features/transitions/transitions.module.css`

**Interfaces:**
- Consumes: `WorldId` and injected navigation/readiness dependencies.
- Produces: `WorldEntryState`, `WorldEntryEvent`, `WorldEntrySource`, `WorldEntryDependencies`, `WorldEntryController`, `worldEntryReducer`, `useWorldEntryStore`, `WorldEntryProvider`, `useWorldEntry()`, and `WorldEntryOverlay`.

- [ ] **Step 1: Write failing reducer tests including rapid final intent**

```ts
const first = worldEntryReducer(
  { status: 'idle' },
  { type: 'REQUEST', world: 'spring', requestId: 1, source: 'universe' },
)
const second = worldEntryReducer(
  first,
  { type: 'REQUEST', world: 'winter', requestId: 2, source: 'universe' },
)
const staleReady = worldEntryReducer(second, { type: 'ASSETS_READY', world: 'spring', requestId: 1 })

expect(second).toEqual({ status: 'targeting', world: 'winter', requestId: 2, source: 'universe' })
expect(staleReady).toEqual(second)
```

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm test -- src/features/transitions/worldEntryMachine.test.ts`

Expected: FAIL because the reducer is undefined.

- [ ] **Step 3: Implement explicit states and stale-event rejection**

Use only these states: `idle`, `targeting`, `loading`, `ready`, `committing`, and `failed`. Every non-idle state contains `world` and monotonically increasing `requestId`. Ignore readiness/failure events whose request ID is not current.

```ts
export type WorldEntrySource = 'universe' | 'world-gate' | 'archive'

export type WorldEntryState =
  | { status: 'idle' }
  | { status: 'targeting' | 'loading' | 'ready' | 'committing'; world: WorldId; requestId: number; source: WorldEntrySource }
  | { status: 'failed'; world: WorldId; requestId: number; source: WorldEntrySource; message: string }

export type WorldEntryEvent =
  | { type: 'REQUEST'; world: WorldId; requestId: number; source: WorldEntrySource }
  | { type: 'TARGET_ALIGNED'; world: WorldId; requestId: number }
  | { type: 'ASSETS_READY'; world: WorldId; requestId: number }
  | { type: 'COMMIT'; world: WorldId; requestId: number }
  | { type: 'FAIL'; world: WorldId; requestId: number; message: string }
  | { type: 'RESET' }

export interface WorldEntryController {
  state: WorldEntryState
  enterWorld(world: WorldId, source: WorldEntrySource): void
  continueStatic(): void
  reset(): void
}

export interface WorldEntryDependencies {
  alignTarget(world: WorldId, source: WorldEntrySource): Promise<void>
  preloadCriticalAssets(world: WorldId): Promise<void>
  commitRoute(world: WorldId): void
  rememberWorld(world: WorldId): void
}
```

Create `useWorldEntryStore` with Zustand. Its state contains the current `WorldEntryState` and a single `dispatch(event)` action that applies `worldEntryReducer`. This keeps the transition shared between Universe, World Gate, Scene Host, and overlay without duplicating route-transition state in component-local hooks.

- [ ] **Step 4: Implement dependency-injected readiness coordination**

`WorldEntryProvider` receives `WorldEntryDependencies`. `useWorldEntry` calls `alignTarget` and `preloadCriticalAssets` in parallel, commits only after both promises resolve, then calls `rememberWorld`. Tests supply controlled promises and prove no fake timer participates. Reduced motion is represented by an `alignTarget` dependency that resolves after the approved 150–250ms opacity boundary; the transition library itself never invents a delay. Concrete Scene Host, media-manifest, router, Universe, World Gate, and Archive dependencies are connected in Task 13 after all four scene modules exist.

- [ ] **Step 5: Implement overlay accessibility and failure recovery**

`WorldEntryOverlay` retains the World name, exposes `aria-live="polite"` status text, never shows a percentage, and on failure offers `Continue with reduced visuals` and `Return to Universe`.

- [ ] **Step 6: Verify transition behavior**

Run: `pnpm test -- src/features/transitions && pnpm lint && pnpm build`

Expected: rapid selection resolves only the final World; asset failure preserves navigation choices.

- [ ] **Step 7: Commit transitions**

```bash
git add src/features/transitions
git commit -m "feat: add asset-aware World entry transitions"
```

---

### Task 8: Demonstration media pipeline and exact asset manifest

**Files:**
- Create: `src/media/mediaManifest.ts`
- Create: `src/media/mediaManifest.test.ts`
- Create: `scripts/build-demo-media.mjs`
- Create: `public/media/demo/README.md`
- Create: `public/media/demo/manifest.json`
- Create: optimized files under `public/media/demo/`
- Modify: `src/domain/objects.ts`

**Interfaces:**
- Consumes: eight Object IDs and four World IDs.
- Produces: `DemoMediaKey`, `mediaManifest`, responsive AVIF/WebP variants, width/height metadata, and Object media entries with explicit demonstration alt text.

- [ ] **Step 1: Write the failing manifest-completeness test**

The required keys are `spring-editorial`, `spring-object-001`, `spring-object-002`, then the same three-key pattern for summer, autumn, and winter. Assert each key has WebP and AVIF variants at 640, 960, and 1600 pixels, positive dimensions, and alt text beginning `Demonstration image:`.

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test -- src/media/mediaManifest.test.ts`

Expected: FAIL because the manifest and files do not exist.

- [ ] **Step 3: Acquire source studies using the EROS asset rule**

First inspect `work/reference-media/` for user-supplied earlier concept images. If the exact seasonal reference is present, use it only as an art-direction input. If it is absent, invoke the `imagegen` skill and generate one source study per World with these exact constraints:

| World | Prompt core |
|---|---|
| Spring | `EROS SPRING / AWAKENING, dark high-fashion editorial environment, wet mineral surface, thin mist and condensation, life barely emerging, restrained cold green only in local traces, cinematic depth, no flowers, no text, no logo` |
| Summer | `EROS SUMMER / BURN, severe white directional light, dry air and hard shadow, subtle heat-distance compression, sensual but restrained high-fashion editorial environment, no flame, no beach, no orange gradient, no text, no logo` |
| Autumn | `EROS AUTUMN / FADE, eroded dry surface, long low-angle shadow, dust and receding warmth, beautiful structural decline, cinematic fashion environment, no leaves, no vintage filter, no text, no logo` |
| Winter | `EROS WINTER / FREEZE, near-empty cold grey field, remote fog, sparse ice dust, frost and oppressive distance, physically cold high-fashion editorial environment, no Christmas, no picturesque snow, no text, no logo` |

Generate eight additional neutral prototype Object studies, two per World, on plain material-responsive grounds. They must read as demonstrations, contain no EROS logo, and avoid copying a recognizable existing garment or accessory.

- [ ] **Step 4: Implement deterministic optimization**

`scripts/build-demo-media.mjs` reads exact source filenames from `work/demo-media-source/`, applies orientation, creates 640/960/1600-pixel AVIF quality 55 and WebP quality 78 variants, strips metadata, and writes to `public/media/demo/`. It writes `public/media/demo/manifest.json` with byte size, width, height, format, route group, and critical/deferred classification for every output. It exits nonzero if a source is missing or an output exceeds its declared critical-route budget.

- [ ] **Step 5: Build assets and update the manifest**

Run: `pnpm media:build`

Expected: 72 optimized files are written: 12 media keys × 3 widths × 2 formats. `mediaManifest` records intrinsic dimensions and responsive sources. Update Object fixtures to reference these keys.

- [ ] **Step 6: Verify media safety and budgets**

Run: `pnpm test -- src/media src/domain && pnpm build`

Expected: all manifest files exist, no source metadata is retained, and critical-route variants remain within the approved budgets.

- [ ] **Step 7: Commit optimized demonstration media**

```bash
git add public/media/demo src/media src/domain/objects.ts scripts/build-demo-media.mjs
git commit -m "feat: add EROS demonstration media pipeline"
```

---

### Task 9: Spring / AWAKENING realtime scene

**Files:**
- Create: `src/features/worlds/sceneRegistry.ts`
- Create: `src/features/worlds/spring/SpringScene.tsx`
- Create: `src/features/worlds/spring/springScene.ts`
- Create: `src/features/worlds/spring/springScene.test.ts`
- Create: `src/features/worlds/spring/spring.module.css`
- Modify: `src/scene/PostProcessingStack.tsx`
- Modify: `src/scene/SceneHost.tsx`

**Interfaces:**
- Consumes: `WorldSceneProps`, `EffectProfile`, quality budgets, and Spring World tokens.
- Produces: lazy `spring` registry entry, `SPRING_EFFECTS`, `getSpringAtmosphere(progress, reducedMotion, quality)`, and `SpringScene`.

- [ ] **Step 1: Write failing Spring profile tests**

Assert progress 0 is darker and denser than progress 1, green contribution never exceeds the declared accent ceiling, reduced motion returns a stable atmosphere, and Lite particle count is at most 1,200.

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test -- src/features/worlds/spring/springScene.test.ts`

Expected: FAIL because the Spring profile does not exist.

- [ ] **Step 3: Implement the pure Spring atmosphere mapping**

```ts
export function getSpringAtmosphere(
  progress: number,
  reducedMotion: boolean,
  quality: Exclude<QualityTier, 'static'>,
) {
  const value = Math.min(1, Math.max(0, progress))
  const particleCount = quality === 'high' ? 4000 : quality === 'balanced' ? 2200 : 1200
  return {
    fogDensity: reducedMotion ? 0.032 : 0.045 - value * 0.018,
    wetReflection: 0.18 + value * 0.16,
    livingAccent: Math.min(0.1, 0.02 + value * 0.08),
    verticalDrift: reducedMotion ? 0 : value * 0.025,
    particleCount,
  }
}
```

- [ ] **Step 4: Build the scene**

Use a dark wet plane, a shallow reflective film, instanced mist sheets, sparse condensation points, and local upward motion. Keep green inside local fracture/life traces. Do not use flowers, leaves, bouncing spores, or full-scene pointer parallax.

- [ ] **Step 5: Configure Spring postprocessing**

Use low Bloom, restrained noise, neutral vignette, and quality-gated depth of field. Keep the composer active for High, Balanced, and Lite.

Define `sceneRegistry` as `Partial<Record<WorldId, WorldSceneDescriptor>>`, add the Spring descriptor, and update Scene Host to load the descriptor for matching World routes. Routes without a registered descriptor retain semantic page content and the neutral composer until their later scene task is committed.

- [ ] **Step 6: Verify Spring visually and technically**

Run: `pnpm test -- src/features/worlds/spring && pnpm build`

Inspect `/world/spring` at 1440×900 and 390×844: it must read as humid awakening before the title is read; Lite must stay under its particle ceiling.

- [ ] **Step 7: Commit Spring**

```bash
git add src/features/worlds/sceneRegistry.ts src/features/worlds/spring src/scene/PostProcessingStack.tsx src/scene/SceneHost.tsx
git commit -m "feat: create Spring Awakening scene"
```

---

### Task 10: Summer / BURN realtime scene

**Files:**
- Create: `src/features/worlds/summer/SummerScene.tsx`
- Create: `src/features/worlds/summer/summerScene.ts`
- Create: `src/features/worlds/summer/summerScene.test.ts`
- Create: `src/features/worlds/summer/summer.module.css`
- Modify: `src/features/worlds/sceneRegistry.ts`
- Modify: `src/scene/PostProcessingStack.tsx`

**Interfaces:**
- Consumes: the World scene contract and Summer tokens.
- Produces: lazy `summer` registry entry, `SUMMER_EFFECTS`, `getSummerAtmosphere(progress, reducedMotion, quality)`, and `SummerScene`.

- [ ] **Step 1: Write failing Summer profile tests**

Assert increasing progress reduces available shadow without exceeding readable luminance, heat distortion is zero under reduced motion, Lite refraction amplitude is no greater than 0.004, and no profile contains an orange/red global tint.

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test -- src/features/worlds/summer/summerScene.test.ts`

Expected: FAIL because Summer is absent.

- [ ] **Step 3: Implement the pure Summer mapping**

Implement `getSummerAtmosphere(progress, reducedMotion, quality)` and return `exposure`, `shadowCompression`, `heatAmplitude`, `airDrift`, and `particleCount`. Clamp exposure below a value that erases semantic overlay contrast. Reduced motion sets `heatAmplitude` and `airDrift` to 0. Lite clamps `heatAmplitude` to 0.004 and `particleCount` to 900.

- [ ] **Step 4: Build the scene**

Use hard directional light, a bleached ground, sparse dry particles, and a low-amplitude shader plane that disturbs only environmental air. Product/editorial DOM remains outside the distorted render surface. Do not add flames, lens-flare stacks, flicker, or universal ripple.

- [ ] **Step 5: Configure Summer postprocessing**

Use tone/exposure control, low Bloom, very limited chromatic separation at the scene boundary, and quality-gated depth of field. Lite keeps composer/tone/Bloom while removing depth of field and chromatic separation.

- [ ] **Step 6: Verify Summer**

Run: `pnpm test -- src/features/worlds/summer && pnpm build`

Inspect desktop/mobile: the environment must feel hot and exposed, text must remain stable, and no rapid luminance inversion may occur.

- [ ] **Step 7: Commit Summer**

```bash
git add src/features/worlds/summer src/features/worlds/sceneRegistry.ts src/scene/PostProcessingStack.tsx
git commit -m "feat: create Summer Burn scene"
```

---

### Task 11: Autumn / FADE realtime scene

**Files:**
- Create: `src/features/worlds/autumn/AutumnScene.tsx`
- Create: `src/features/worlds/autumn/autumnScene.ts`
- Create: `src/features/worlds/autumn/autumnScene.test.ts`
- Create: `src/features/worlds/autumn/autumn.module.css`
- Modify: `src/features/worlds/sceneRegistry.ts`
- Modify: `src/scene/PostProcessingStack.tsx`

**Interfaces:**
- Consumes: the World scene contract and Autumn tokens.
- Produces: lazy `autumn` registry entry, `AUTUMN_EFFECTS`, `getAutumnAtmosphere(progress, reducedMotion, quality)`, and `AutumnScene`.

- [ ] **Step 1: Write failing Autumn profile tests**

Assert progress lengthens the directional shadow, reduces warmth without turning the scene monochrome brown, dust stops in reduced motion, and all particle counts respect tier ceilings.

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test -- src/features/worlds/autumn/autumnScene.test.ts`

Expected: FAIL because Autumn is absent.

- [ ] **Step 3: Implement the pure Autumn mapping**

Implement `getAutumnAtmosphere(progress, reducedMotion, quality)` and return sun elevation, warm-light contribution, shadow length, dust speed, surface weathering, and particle count. Progress must move from residual warmth toward dusk without crossing into Winter's cold-silver palette. Reduced motion sets dust speed to 0; tier particle counts are 2400, 1400, and 800.

- [ ] **Step 4: Build the scene**

Use low directional light, layered weathered planes, sparse lateral dust, and slow material erosion. Motion derives from wind and time. Do not render literal leaves, nostalgic grain, paper fragments, or a global brown filter.

- [ ] **Step 5: Configure Autumn postprocessing**

Use restrained contrast, low noise, subtle vignette, and optional depth of field outside Lite. Keep rust/warmth localized in lighting and materials rather than postprocessing the whole frame.

- [ ] **Step 6: Verify Autumn**

Run: `pnpm test -- src/features/worlds/autumn && pnpm build`

Inspect desktop/mobile: the scene must communicate receding time and dry air without requiring leaf imagery or a title.

- [ ] **Step 7: Commit Autumn**

```bash
git add src/features/worlds/autumn src/features/worlds/sceneRegistry.ts src/scene/PostProcessingStack.tsx
git commit -m "feat: create Autumn Fade scene"
```

---

### Task 12: Winter / FREEZE realtime scene

**Files:**
- Create: `src/features/worlds/winter/WinterScene.tsx`
- Create: `src/features/worlds/winter/winterScene.ts`
- Create: `src/features/worlds/winter/winterScene.test.ts`
- Create: `src/features/worlds/winter/winter.module.css`
- Modify: `src/features/worlds/sceneRegistry.ts`
- Modify: `src/scene/PostProcessingStack.tsx`

**Interfaces:**
- Consumes: the World scene contract and Winter tokens.
- Produces: lazy `winter` registry entry, `WINTER_EFFECTS`, `getWinterAtmosphere(progress, reducedMotion, quality)`, and `WinterScene`.

- [ ] **Step 1: Write failing Winter profile tests**

Assert Winter has the lowest motion amplitude of all four Worlds, reduced motion returns zero continuous motion, the palette remains cold grey rather than blue neon, and Lite uses no more than 800 ice-dust particles.

- [ ] **Step 2: Run the test and verify failure**

Run: `pnpm test -- src/features/worlds/winter/winterScene.test.ts`

Expected: FAIL because Winter is absent.

- [ ] **Step 3: Implement the pure Winter mapping**

Implement `getWinterAtmosphere(progress, reducedMotion, quality)` and return remote-fog density, ice-dust speed, frost opacity, light distance, stillness interval, and particle count. Full motion uses long cycles with explicit still intervals; reduced motion returns a stable final composition. Tier particle counts are 1200, 800, and 400, keeping Winter below the equivalent Spring/Autumn tier.

- [ ] **Step 4: Build the scene**

Use broad low-saturation planes, remote fog layers, sparse ice dust, and a nearly static frost boundary. Preserve large empty regions. Do not add Christmas imagery, attractive snow scenery, bright blue glow, busy snowfall, or full-frame frost patterns.

- [ ] **Step 5: Configure Winter postprocessing**

Use neutral cold tone, restrained Bloom, minimal vignette, and no animated chromatic effect. Lite retains the composer and tone while omitting depth of field.

- [ ] **Step 6: Verify Winter**

Run: `pnpm test -- src/features/worlds/winter && pnpm build`

Inspect desktop/mobile and reduced motion: the first bodily response must be cold, distance, and quiet; the page must never look frozen or unresponsive.

- [ ] **Step 7: Commit Winter**

```bash
git add src/features/worlds/winter src/features/worlds/sceneRegistry.ts src/scene/PostProcessingStack.tsx
git commit -m "feat: create Winter Freeze scene"
```

---

### Task 13: Shared World editorial structure and Object discovery

**Files:**
- Create: `src/features/worlds/WorldSceneFrame.tsx`
- Create: `src/features/worlds/WorldPage.tsx`
- Create: `src/features/worlds/WorldPage.test.tsx`
- Create: `src/features/worlds/WorldObjectField.tsx`
- Create: `src/features/worlds/worlds.module.css`
- Modify: `src/app/AppRouter.tsx`
- Modify: `src/app/AppShell.tsx`
- Modify: `src/features/universe/SemanticCelestialControls.tsx`
- Modify: `src/features/navigation/WorldGate.tsx`
- Modify: `src/scene/SceneHost.tsx`

**Interfaces:**
- Consumes: `getWorld`, `filterObjects`, `sceneRegistry`, `WorldEntry`, and `mediaManifest`.
- Produces: `WorldPage`, normalized `progressRef`, semantic `Atmosphere`, `Editorial`, `Objects`, and `Next World` regions.

- [ ] **Step 1: Write failing World structure tests**

Render each World route and assert the ordered landmarks `Atmosphere`, `Editorial`, `Objects`, and `Next World`. Assert the matching concept headline, exactly two prototype Objects for the fixture set, and an explicit next-World link that never auto-navigates.

- [ ] **Step 2: Run the tests and verify failure**

Run: `pnpm test -- src/features/worlds/WorldPage.test.tsx`

Expected: FAIL because the initial route heading does not yet contain the approved four-region World structure.

- [ ] **Step 3: Implement native-scroll progress bridging**

`WorldSceneFrame` observes the page root with `requestAnimationFrame` and writes normalized document progress into a mutable ref without setting React state on every scroll frame. It removes listeners and the frame request on unmount. Reduced motion still updates semantic content but passes a stable atmosphere progress to the scene.

- [ ] **Step 4: Connect concrete asset-aware World Entry dependencies**

Mount `WorldEntryProvider` in `AppShell`. Its `preloadCriticalAssets(world)` loads `sceneRegistry[world].load()` plus the World's 1600px desktop or 960px mobile editorial source from `mediaManifest`, using `HTMLImageElement.decode()` and rejecting on module/media failure. Its `alignTarget` calls the Universe camera controller only for source `universe`; World Gate uses the selected World's material handoff without camera flight. Its `commitRoute` navigates to `/world/${world}` and `rememberWorld` calls `setRecentWorld`. Connect Universe `ENTER` and World Gate World actions to `useWorldEntry`; Task 14 connects Archive after its real page replaces the initial route implementation.

- [ ] **Step 5: Implement World editorial and Object order**

Each route renders a one-viewport atmosphere threshold, one editorial media sequence using the World editorial manifest entry, two prototype Object encounters, and an explicit next-World footer. Product facts remain outside Canvas. World-specific CSS Modules vary spacing, luminance, and rhythm without changing semantic order.

- [ ] **Step 6: Implement Object discovery cards without ecommerce-grid styling**

Use semantic `<article>` and `<a>` elements, original media proportions, Object number/name/price, and restrained World ownership. Avoid rounded cards, drop shadows, uniform crops, and overlaid price text. Mobile uses a single column with nonuniform image ratios and no horizontal overflow.

- [ ] **Step 7: Verify all Worlds and entry sources**

Run: `pnpm test -- src/features/worlds && pnpm lint && pnpm build`

Add tests proving Universe and World Gate call the same controller and that a failed image decode exposes `Continue with reduced visuals`. Manual browser check: atmosphere precedes commerce; each World feels distinct; original media and controls remain clear above scene motion.

- [ ] **Step 8: Commit World pages and concrete transition integration**

```bash
git add src/features/worlds src/features/universe/SemanticCelestialControls.tsx src/features/navigation/WorldGate.tsx src/app/AppRouter.tsx src/app/AppShell.tsx src/scene/SceneHost.tsx
git commit -m "feat: add seasonal editorial World pages"
```

---

### Task 14: URL-backed Archive and accessible Search

**Files:**
- Create: `src/features/archive/ArchivePage.tsx`
- Create: `src/features/archive/ArchivePage.test.tsx`
- Create: `src/features/archive/archive.module.css`
- Create: `src/features/search/SearchPage.tsx`
- Create: `src/features/search/SearchPage.test.tsx`
- Create: `src/features/search/search.module.css`
- Modify: `src/domain/selectors.ts`
- Modify: `src/app/AppRouter.tsx`

**Interfaces:**
- Consumes: `demoObjects`, `ObjectFilters`, `filterObjects`, `searchObjects`, `useWorldEntry`, and route-backed overlay context.
- Produces: `parseArchiveParams(searchParams)`, `serializeArchiveParams(filters)`, `ArchivePage`, and `SearchPage`.

Use these exact signatures:

```ts
export function parseArchiveParams(searchParams: URLSearchParams): ObjectFilters
export function serializeArchiveParams(filters: ObjectFilters): URLSearchParams
```

- [ ] **Step 1: Write failing selector and URL round-trip tests**

Use a query such as `?world=winter&type=accessory&material=steel` and assert parse → serialize → parse equality. Assert OR within a group, AND between groups, case-insensitive Search, and preserved query on no results.

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm test -- src/domain src/features/archive src/features/search`

Expected: FAIL because URL parsers and pages are absent.

- [ ] **Step 3: Implement Archive filters**

Use fieldsets with legends for World, type, material, and color; update URL parameters with React Router; show result count in `aria-live="polite"`; provide `Reset filters`; keep a true empty-result region without fake Objects. Each selected World group exposes an explicit `Enter Spring / Awakening`-style action through `useWorldEntry`, ensuring Archive-to-World navigation uses the same asset-aware transition. Add a component test that compares the controller call shape from Archive with the already tested Universe/Gate call.

- [ ] **Step 4: Implement Search**

Search name, number, World, feel, type, material, and color. The empty query explains those fields. A no-result state retains the query and links to Archive. Desktop renders above a background location; mobile/direct render as a complete main route.

- [ ] **Step 5: Verify Archive and Search**

Run: `pnpm test -- src/domain src/features/archive src/features/search && pnpm lint && pnpm build`

Expected: filters are shareable/restorable and status updates are accessible.

- [ ] **Step 6: Commit discovery utilities**

```bash
git add src/domain/selectors.ts src/features/archive src/features/search src/app/AppRouter.tsx
git commit -m "feat: add Archive filtering and Search"
```

---

### Task 15: Quiet Product Detail and persistent local Bag

**Files:**
- Create: `src/features/product/ProductPage.tsx`
- Create: `src/features/product/ProductPage.test.tsx`
- Create: `src/features/product/product.module.css`
- Create: `src/features/bag/BagPage.tsx`
- Create: `src/features/bag/BagPage.test.tsx`
- Create: `src/features/bag/bag.module.css`
- Modify: `src/app/AppRouter.tsx`
- Modify: `src/features/navigation/GlobalHeader.tsx`

**Interfaces:**
- Consumes: `getObject`, `getWorld`, media manifest, `useSiteStore` Bag actions, and canonical routes.
- Produces: `ProductPage`, `BagPage`, size validation, subtotal calculation, local persistence notices, and route-backed overlay behavior.

- [ ] **Step 1: Write failing Product interaction tests**

Test that an Object with sizes cannot be added before selection, validation is announced, selecting `M` and activating `Add to Bag` adds one matching line, `BELONGS TO — WINTER / FREEZE` links to `/world/winter`, and unknown slugs render a safe not-found path.

- [ ] **Step 2: Run Product tests and verify failure**

Run: `pnpm test -- src/features/product/ProductPage.test.tsx`

Expected: FAIL because the initial Product route does not yet contain selection validation or Bag behavior.

- [ ] **Step 3: Implement the approved Product hierarchy**

Render primary media, name/number, price, size, material/construction, editorial media, design concept, detail media, Add to Bag, and Belongs to World in that exact order. Reduce scene opacity and postprocessing intensity on Product routes without disabling the composer when WebGL is active.

- [ ] **Step 4: Write failing Bag tests**

Test line merge, distinct sizes, quantity updates, removal, subtotal, Bag count, empty state, storage-unavailable notice, and the exact statement that checkout is unavailable in this frontend prototype.

- [ ] **Step 5: Implement Bag route and overlay**

Desktop uses the canonical route-backed overlay; mobile/direct uses a full-screen route. Do not render address, email, payment, checkout form, or a fake enabled checkout button.

- [ ] **Step 6: Verify commerce surfaces**

Run: `pnpm test -- src/features/product src/features/bag src/state && pnpm lint && pnpm build`

Expected: full local browse-to-Bag flow passes.

- [ ] **Step 7: Commit Product and Bag**

```bash
git add src/features/product src/features/bag src/features/navigation/GlobalHeader.tsx src/app/AppRouter.tsx
git commit -m "feat: add Product detail and local Bag"
```

---

### Task 16: The Studio, static Universe, and recoverable scene failures

**Files:**
- Create: `src/features/studio/StudioPage.tsx`
- Create: `src/features/studio/StudioPage.test.tsx`
- Create: `src/features/studio/studio.module.css`
- Modify: `src/features/fallback/StaticUniverse.tsx`
- Modify: `src/features/fallback/SceneFallback.tsx`
- Modify: `src/features/fallback/SceneFallback.test.tsx`
- Modify: `src/features/fallback/fallback.module.css`
- Modify: `src/scene/SceneErrorBoundary.tsx`
- Modify: `src/scene/SceneHost.tsx`
- Modify: `src/app/AppRouter.tsx`
- Modify: `src/vite-env.d.ts`

**Interfaces:**
- Consumes: celestial definitions, semantic celestial controls, World routes, quality state, and Scene Host error callbacks.
- Produces: `StudioPage`, `StaticUniverse`, `SceneFallback`, retry/continue-static behavior, context-loss recovery, and test-only `window.__EROS_TEST_API__.triggerSceneError()` in development/test builds without replacing the existing `setSceneTime(seconds)` method.

- [ ] **Step 1: Write failing Studio and fallback tests**

Assert Studio contains only What EROS Is, Material and Making, Future Process Media, Archive, and static Contact Information regions; it has no invented founder biography or live form. Assert Static Universe exposes all five celestial destinations and the full header.

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm test -- src/features/studio src/features/fallback`

Expected: FAIL because the final page and fallback modules are absent.

- [ ] **Step 3: Implement The Studio**

Use a lower-contrast archival/workroom composition, approved section names, demonstration process-media notice, Archive link, and a noninteractive contact-information region that contains no invented address or submission form.

- [ ] **Step 4: Implement Static Universe and error boundaries**

Use layered CSS gradients, deterministic CSS star points, 2D orbital traces, and the same semantic controls. Scene errors preserve the current route content and provide `Retry realtime scene` and `Continue with static visuals`. A WebGL context-loss listener enters static mode without reloading the React application. In `import.meta.env.DEV` or `import.meta.env.MODE === 'test'` only, expose `window.__EROS_TEST_API__.triggerSceneError()`; production builds must not expose this hook.

- [ ] **Step 5: Add reduced-motion live-change behavior**

Listen to `matchMedia('(prefers-reduced-motion: reduce)')` changes. Switch Canvas to demand rendering, freeze continuous atmosphere, remove camera flight, and preserve static postprocessing tone. Restore full motion only after the platform preference changes back.

- [ ] **Step 6: Verify Studio and failure recovery**

Run: `pnpm test -- src/features/studio src/features/fallback src/scene && pnpm lint && pnpm build`

Expected: scene failure never removes semantic navigation or page content.

- [ ] **Step 7: Commit Studio and fallback**

```bash
git add src/features/studio src/features/fallback src/scene src/app/AppRouter.tsx src/vite-env.d.ts
git commit -m "feat: add Studio and resilient visual fallbacks"
```

---

### Task 17: Responsive, typography, focus, and motion polish

**Files:**
- Modify: `src/app/styles/tokens.css`
- Modify: `src/app/styles/global.css`
- Modify: every feature CSS Module created in Tasks 4–16
- Create: `src/app/responsive.test.tsx`
- Create: `src/app/useDocumentMeta.ts`
- Create: `src/app/useDocumentMeta.test.tsx`
- Modify: `index.html`

**Interfaces:**
- Consumes: every completed route and the approved type/color roles.
- Produces: final fluid type scale, safe-area rules, short-height behavior, 44px targets, visible focus, neutral chrome, and route metadata.

- [ ] **Step 1: Write failing structural accessibility tests**

Render each route at the DOM level and assert one main landmark, one H1, a skip link, visible accessible names for icon controls, and no duplicate IDs. Assert all primary control classes compute a minimum 44px block and inline size in the test stylesheet.

- [ ] **Step 2: Run tests and verify failure**

Run: `pnpm test -- src/app/responsive.test.tsx`

Expected: FAIL until skip links, headings, and target tokens are complete.

- [ ] **Step 3: Implement final token and typography roles**

Define neutral brand tokens, four World token groups, `clamp()` type scales, and tabular numerals. Use Instrument Sans Variable for brand, World names, navigation, product facts, and numbers. Use Newsreader Variable for editorial and conceptual lines. Import only their Latin variable CSS from the installed Fontsource packages and retain `font-display: swap`; preload no font until the production network trace proves a preload improves rather than delays Home.

Implement `useDocumentMeta` with exact titles: `EROS STUDIO`, `SPRING / AWAKENING — EROS`, `SUMMER / BURN — EROS`, `AUTUMN / FADE — EROS`, `WINTER / FREEZE — EROS`, `ARCHIVE / ALL OBJECTS — EROS`, `THE STUDIO — EROS`, `SEARCH — EROS`, `BAG — EROS`, and `[OBJECT NAME] — EROS`. Test title cleanup and updates on route changes.

- [ ] **Step 4: Implement responsive compositions**

Use fluid layout first. Add composition changes near 1024px, 768px, and 520px only where hierarchy changes. Handle `svh`/`dvh`, safe-area insets, 360px narrow width, and short landscape height. Remove horizontal page overflow and keep natural vertical scroll under zoom.

- [ ] **Step 5: Implement focus and motion polish**

Use a clear neutral focus line/ring on actual interactive elements. Ensure Hover never carries unique meaning. Cap all non-scene UI transitions at restrained durations, disable transform travel under reduced motion, and keep World Gate/Search/Bag focus restoration exact.

- [ ] **Step 6: Verify responsive and accessibility structure**

Run: `pnpm test && pnpm lint && pnpm build`

Expected: all unit/component tests pass and production build succeeds.

- [ ] **Step 7: Commit final interface system**

```bash
git add index.html src/app src/features
git commit -m "feat: complete responsive EROS interface system"
```

---

### Task 18: Full browser QA, visual regression, performance budgets, and handoff documentation

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/navigation.spec.ts`
- Create: `e2e/commerce.spec.ts`
- Create: `e2e/fallbacks.spec.ts`
- Create: `e2e/accessibility.spec.ts`
- Create: `e2e/visual.spec.ts`
- Create: `scripts/check-performance-budgets.mjs`
- Create: `scripts/check-performance-budgets.test.ts`
- Create: `docs/qa/eros-v1-checklist.md`
- Create: `README.md`
- Modify: `package.json`

**Interfaces:**
- Consumes: the complete V1 and its stable semantic labels.
- Produces: repeatable Chromium coverage, baseline screenshots, build-byte enforcement, QA evidence instructions, and the local handoff guide.

- [ ] **Step 1: Write failing end-to-end navigation and commerce flows**

Cover:

1. Home selects and enters each World.
2. World → Product → select size → Add to Bag.
3. Menu → Archive → filter → Product.
4. Search → Product → browser Back restores Search and query.
5. Refresh retains Bag and recent World.
6. Rapid Spring/Winter selection navigates only to Winter.
7. Keyboard-only open/switch/close Gate restores focus.
8. World → Product → browser Back restores the originating Object position, scroll, and focus.

Run: `pnpm e2e -- e2e/navigation.spec.ts e2e/commerce.spec.ts`

Expected before final selectors/flows are corrected: at least one failing assertion that identifies the incomplete behavior rather than a timeout-only failure.

- [ ] **Step 2: Add fallback and accessibility browser tests**

Use `page.emulateMedia({ reducedMotion: 'reduce' })` for reduced motion. For no WebGL, inject a pre-document override that makes WebGL context creation return `null`, then verify Static Universe and complete navigation. Call `window.__EROS_TEST_API__.triggerSceneError()` in the development test server and verify route content survives; assert the hook is absent from the production preview. Run axe on Home, each World, World Gate, Archive, Product, Search, Bag, Studio, and Static Universe with serious/critical violations set to fail.

- [ ] **Step 3: Add visual projects and stable screenshots**

Configure projects for 1440×900, 1280×800, 768×1024, 390×844, 360×800, and 844×390. Before each moving-scene screenshot, call `window.__EROS_TEST_API__.setSceneTime(137.5)` on the development test server; assert that setter is absent from the production preview. Capture Home, each World threshold, World Gate, Archive, Product, Bag, reduced motion, and static fallback. Use masks only for browser-generated scrollbar differences, never for application content.

- [ ] **Step 4: Write the failing performance-budget script test**

Create a synthetic Vite manifest and assert failure when Home critical bytes exceed 3 MB desktop or 1.5 MB mobile, a mobile World entry exceeds 2 MB, or a declared scene configuration exceeds its DPR/draw-call/particle ceiling.

- [ ] **Step 5: Implement the budget checker**

`build-demo-media.mjs` also writes `public/media/demo/manifest.json` from the same data used by `mediaManifest.ts`. `check-performance-budgets.mjs` reads `dist/.vite/manifest.json` and `public/media/demo/manifest.json`, sums route-critical assets without double counting shared chunks, and exits 1 with the exact exceeded budget and byte count. Add `pnpm budget:check` after production build.

- [ ] **Step 6: Run iterative visual QA with the required browser skills**

Invoke `playwright-interactive` for visible iterative debugging and `playwright` for repeatable regression runs. Inspect actual screenshots and motion at all six viewports. Record draw calls, textures, renderer memory, active passes, FPS ranges, keyboard behavior, touch behavior, and fallback results in `docs/qa/eros-v1-checklist.md`.

- [ ] **Step 7: Write the project handoff**

`README.md` documents prerequisites, `pnpm install`, run/build/test commands, architecture boundaries, how demo media is labeled, quality tiers, fallback behavior, the lack of checkout/backend, and the fact that public deployment is excluded.

- [ ] **Step 8: Run the final verification suite from a clean production build**

Run:

```bash
pnpm lint
pnpm test
pnpm build
pnpm budget:check
pnpm e2e
git diff --check
git status --short
```

Expected: every command exits 0; only intentionally updated screenshot baselines or QA documentation are uncommitted before the final commit.

- [ ] **Step 9: Commit verification and documentation**

```bash
git add package.json pnpm-lock.yaml playwright.config.ts e2e scripts/check-performance-budgets.mjs scripts/check-performance-budgets.test.ts docs/qa README.md
git commit -m "test: verify complete EROS Studio V1"
```

## Spec Coverage Matrix

| Specification area | Implemented and verified by |
|---|---|
| Required React/R3F/Three stack | Tasks 1, 5, 6 |
| Earth-derived Core and five moving bodies | Task 6 |
| Asset-aware camera/World transition | Task 7 |
| Four distinct seasonal scenes | Tasks 9–12 |
| Atmosphere → Editorial → Objects | Task 13 |
| World Gate and global navigation | Task 4 |
| Archive and Search | Task 14 |
| Product Detail and local Bag | Task 15 |
| The Studio | Task 16 |
| Always-on WebGL postprocessing | Tasks 5, 9–12, 15 |
| Mobile recomposition | Tasks 6, 13, 17, 18 |
| Reduced Motion, Lite, no-WebGL, failures | Tasks 5, 7, 16, 18 |
| Demonstration content safety | Tasks 2, 8, 16 |
| Performance budgets | Tasks 5, 6, 8, 18 |
| WCAG 2.2 AA and focus restoration | Tasks 4, 6, 7, 14–18 |
| Visual, functional, responsive verification | Task 18 |
| Explicit V1 exclusions and local handoff | Tasks 15, 16, 18 |
