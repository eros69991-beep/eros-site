# EROS Homepage V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the confirmed Homepage V2 Portal Layer without changing Spring, Summer, Autumn, or Winter detail pages.

**Architecture:** Reuse the semantic React layer, R3F Scene Host, Zustand selection state, and shared World Entry controller. Add a homepage session intro, a typed Portal model shared by scene and controls, mobile swipe selection, and a homepage-only material handoff before the existing seasonal routes commit. Detail pages and World Gate keep their current contracts.

**Tech Stack:** React 19, TypeScript, React Router, Zustand, Three.js, React Three Fiber, CSS Modules, Vitest, React Testing Library, Playwright, and axe-core.

**Spec:** `docs/superpowers/specs/2026-09-01-eros-homepage-v2-design.md`

## Global Constraints

- Change only the homepage Portal Layer, homepage scene, homepage controls, homepage-origin entry branch, fallback behavior, and related tests.
- Do not modify any file below `src/features/worlds/`.
- Keep the route targets `/world/spring`, `/world/summer`, `/world/autumn`, and `/world/winter` unchanged.
- Keep `/studio` unchanged but never navigate to it from Homepage V2.
- First visit in one browser tab/window session plays a `4–5 second` black opening; return visits in that session skip it.
- Homepage chrome is limited to `EROS`, `MENU`, contextual World identity, and the mobile `01–05` state.
- Studio / Unknown is selectable but never enters, takes over the frame, or changes route.
- Mobile body order is Spring, Summer, Autumn, Winter, Studio; swipe selection settles in `1050ms` with no elastic motion.
- Seasonal handoffs are growth, scorching, oxidation, and freezing; route commit happens only after the handoff covers the frame.
- Preserve existing keyboard behavior, 44px targets, reduced-motion behavior, no-WebGL fallback, and semantic navigation.

---

## File and Responsibility Map

```text
src/features/home/homepageSession.ts              Session intro state and timing
src/features/home/HomeIntro.tsx                   Black opening phrase overlay
src/features/home/HomePage.tsx                    V2 homepage shell and lifecycle
src/features/home/home.module.css                 Homepage V2 layout and type
src/features/home/*.test.ts(x)                    Session, intro, and homepage tests

src/features/navigation/GlobalHeader.tsx          EROS + MENU-only variant on /
src/features/navigation/GlobalHeader.test.tsx     Header visibility by route
src/features/navigation/navigation.module.css     Homepage header rules

src/features/universe/portalModel.ts              Body order, labels, material keys, swipe helper
src/features/universe/portalModel.test.ts         Portal model tests
src/features/universe/SemanticCelestialControls.tsx  Desktop focus/select and mobile swipe
src/features/universe/SemanticCelestialControls.test.tsx  Semantic control tests
src/features/universe/universeConfig.ts           Asymmetric Portal positions
src/features/universe/universeConfig.test.ts      Core/body placement tests
src/features/universe/UniverseScene.tsx           Non-orbital Portal composition
src/features/universe/ErosCore.tsx                Sculptural Core
src/features/universe/CelestialBody.tsx           Five material-distinct bodies
src/features/universe/universe.module.css         Labels, indicator, and settle motion

src/features/transitions/homepageMaterialHandoff.ts      Homepage handoff timing
src/features/transitions/homepageMaterialHandoff.test.ts Handoff tests
src/features/transitions/worldEntryMachine.ts            Transitioning state
src/features/transitions/useWorldEntry.ts                Handoff-before-commit orchestration
src/features/transitions/worldEntryDependencies.ts       Universe-only handoff wiring
src/features/transitions/WorldEntryOverlay.tsx           Quiet status and failure recovery
src/features/transitions/transitions.module.css          Four takeover treatments
src/state/siteStore.ts                                  Transient homepage handoff state
src/app/AppShell.tsx                                     Takeover layer and dependency wiring

src/features/fallback/StaticUniverse.tsx                 Static black Portal fallback
src/features/fallback/fallback.module.css                Static Portal styling
src/features/fallback/SceneFallback.test.tsx             No-WebGL tests
src/app/responsive.test.tsx                              Homepage structure regression
e2e/navigation.spec.ts                                  Entry, Studio, and swipe flows
e2e/fallbacks.spec.ts                                   Reduced-motion and fallback flows
e2e/accessibility.spec.ts                               Homepage axe and focus checks
e2e/visual.spec.ts                                      Resolved Portal and handoff screenshots
e2e/visual.spec.ts-snapshots/                           Updated Home/fallback references
```

No task may alter `src/features/worlds/**`, route definitions, StudioPage, Archive, Product, Search, Bag, or World Gate.

---

### Task 1: Add the session opening and minimal Homepage shell

**Files:**

- Create: `src/features/home/homepageSession.ts`
- Create: `src/features/home/homepageSession.test.ts`
- Create: `src/features/home/HomeIntro.tsx`
- Create: `src/features/home/HomeIntro.test.tsx`
- Create: `src/features/home/HomePage.test.tsx`
- Create: `src/features/home/home.module.css`
- Modify: `src/features/home/HomePage.tsx`

**Interfaces:**

- Produces `HOMEPAGE_INTRO_SESSION_KEY`, `INTRO_DURATION_MS = 4600`, `REDUCED_INTRO_DURATION_MS = 150`, `readHomepageIntroSeen(storage)`, `markHomepageIntroSeen(storage)`, and `getHomepageIntroDuration(reducedMotion)`.
- Produces `HomeIntro({ active }: { active: boolean })`.
- Keeps `SemanticCelestialControls` mounted while the visual opening runs.

- [ ] **Step 1: Write failing session tests**

```ts
expect(readHomepageIntroSeen(session)).toBe(false)
markHomepageIntroSeen(session)
expect(session.getItem(HOMEPAGE_INTRO_SESSION_KEY)).toBe('seen')
expect(readHomepageIntroSeen(session)).toBe(true)
expect(getHomepageIntroDuration(false)).toBe(4600)
expect(getHomepageIntroDuration(true)).toBe(150)
```

- [ ] **Step 2: Run the session test**

Run: `pnpm test -- src/features/home/homepageSession.test.ts`

Expected: FAIL because `homepageSession.ts` is absent.

- [ ] **Step 3: Implement safe session helpers**

```ts
export const HOMEPAGE_INTRO_SESSION_KEY = 'eros-studio:homepage-v2-intro-seen'
export const INTRO_DURATION_MS = 4_600
export const REDUCED_INTRO_DURATION_MS = 150

export interface SessionStorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export function readHomepageIntroSeen(storage: SessionStorageLike): boolean {
  try { return storage.getItem(HOMEPAGE_INTRO_SESSION_KEY) === 'seen' } catch { return false }
}

export function markHomepageIntroSeen(storage: SessionStorageLike) {
  try { storage.setItem(HOMEPAGE_INTRO_SESSION_KEY, 'seen') } catch { /* session fallback intentionally does not persist */ }
}

export function getHomepageIntroDuration(reducedMotion: boolean) {
  return reducedMotion ? REDUCED_INTRO_DURATION_MS : INTRO_DURATION_MS
}
```

- [ ] **Step 4: Write failing opening and homepage tests**

```tsx
render(<HomeIntro active />)
expect(screen.getByText('NOTHING STAYS EXPECTED.')).toBeInTheDocument()

render(<HomePage />)
expect(screen.getByRole('heading', { level: 1, name: 'EROS' })).toBeInTheDocument()
expect(screen.queryByText(/Five changing conditions orbit/i)).not.toBeInTheDocument()
```

- [ ] **Step 5: Run component tests**

Run: `pnpm test -- src/features/home/HomeIntro.test.tsx src/features/home/HomePage.test.tsx`

Expected: FAIL because the V2 opening and homepage markup do not exist.

- [ ] **Step 6: Implement the opening lifecycle and markup**

Use browser `sessionStorage` only in the browser branch. On a first visit, mark the session immediately, start one normal or reduced-motion timeout, and clear it on unmount. Render the phrase in an `aria-hidden` overlay and retain controls underneath.

```tsx
<section aria-labelledby="home-heading" className={styles.home}>
  <h1 className={styles.visuallyHidden} id="home-heading">EROS</h1>
  <HomeIntro active={introActive} />
  <div className={styles.portalContent} data-intro-active={introActive || undefined}>
    <SemanticCelestialControls />
  </div>
</section>
```

In `home.module.css`, make the overlay pure black, animate the phrase away before the scene resolves, and set `pointer-events: none`.

- [ ] **Step 7: Verify and commit**

Run: `pnpm test -- src/features/home/homepageSession.test.ts src/features/home/HomeIntro.test.tsx src/features/home/HomePage.test.tsx`

Expected: PASS.

```bash
git add src/features/home
git commit -m "feat: add EROS Homepage V2 opening"
```

### Task 2: Define the Portal contract and semantic controls

**Files:**

- Create: `src/features/universe/portalModel.ts`
- Create: `src/features/universe/portalModel.test.ts`
- Modify: `src/features/universe/SemanticCelestialControls.tsx`
- Modify: `src/features/universe/SemanticCelestialControls.test.tsx`
- Modify: `src/features/universe/universe.module.css`
- Modify: `src/features/navigation/GlobalHeader.tsx`
- Create: `src/features/navigation/GlobalHeader.test.tsx`
- Modify: `src/features/navigation/navigation.module.css`

**Interfaces:**

- Produces `PORTAL_ORDER`, `PORTAL_BODIES`, `getPortalBody(id)`, and `getSwipeDestination(current, deltaX, viewportWidth)`.
- `PORTAL_BODIES.studio.world` is `null`; every seasonal body contains its existing `WorldId`.
- `SemanticCelestialControls` selects five bodies but renders ENTER only for a seasonal body.

- [ ] **Step 1: Write failing Portal model tests**

```ts
expect(PORTAL_ORDER).toEqual(['spring', 'summer', 'autumn', 'winter', 'studio'])
expect(PORTAL_BODIES.studio).toMatchObject({ index: '05', label: 'STUDIO / UNKNOWN', world: null })
expect(getSwipeDestination('spring', -220, 390)).toBe('summer')
expect(getSwipeDestination('studio', -220, 390)).toBe('studio')
expect(getSwipeDestination('spring', 220, 390)).toBe('spring')
```

- [ ] **Step 2: Run the model test**

Run: `pnpm test -- src/features/universe/portalModel.test.ts`

Expected: FAIL because `portalModel.ts` is absent.

- [ ] **Step 3: Implement the typed body model**

```ts
export const PORTAL_ORDER = ['spring', 'summer', 'autumn', 'winter', 'studio'] as const
export const PORTAL_SETTLE_MS = 1_050

export const PORTAL_BODIES = {
  spring: { index: '01', label: 'SPRING / AWAKENING', world: 'spring', material: 'crystal' },
  summer: { index: '02', label: 'SUMMER / BURN', world: 'summer', material: 'burned-metal' },
  autumn: { index: '03', label: 'AUTUMN / FADE', world: 'autumn', material: 'oxidized-mineral' },
  winter: { index: '04', label: 'WINTER / FREEZE', world: 'winter', material: 'milky-ice' },
  studio: { index: '05', label: 'STUDIO / UNKNOWN', world: null, material: 'absorbing-matter' },
} as const

export function getPortalBody(id: CelestialId) {
  return PORTAL_BODIES[id]
}
```

```ts
export function getSwipeDestination(current: CelestialId, deltaX: number, viewportWidth: number): CelestialId {
  const index = PORTAL_ORDER.indexOf(current)
  const threshold = Math.max(viewportWidth * 0.16, 48)
  const next = deltaX <= -threshold ? index + 1 : deltaX >= threshold ? index - 1 : index
  return PORTAL_ORDER[Math.max(0, Math.min(PORTAL_ORDER.length - 1, next))]!
}
```

- [ ] **Step 4: Write failing semantic/header tests**

```tsx
expect(screen.getByRole('button', { name: '05 / STUDIO / UNKNOWN' })).toBeEnabled()
expect(screen.queryByRole('button', { name: 'ENTER' })).not.toBeInTheDocument()
expect(screen.getByRole('status', { name: 'Portal position' })).toHaveTextContent('01–05')

render(<TestRouter initialEntries={['/']} />)
expect(screen.queryByRole('link', { name: 'SEARCH' })).not.toBeInTheDocument()
expect(screen.queryByRole('link', { name: /BAG/i })).not.toBeInTheDocument()
expect(screen.getByRole('button', { name: 'MENU' })).toBeInTheDocument()
```

- [ ] **Step 5: Run semantic/header tests**

Run: `pnpm test -- src/features/universe/SemanticCelestialControls.test.tsx src/features/navigation/GlobalHeader.test.tsx`

Expected: FAIL because V1 labels, Studio entry, and Home Search/Bag links remain.

- [ ] **Step 6: Implement selection, swipe, labels, and minimal header**

Keep every body as a real button. Hover and focus select it; touch pointer-up calls `getSwipeDestination` with its measured horizontal delta. Use this exact visible state:

```tsx
<output aria-live="polite" className={styles.portalIdentity}>
  {body ? body.index + ' / ' + body.label : ''}
</output>
<output aria-label="Portal position" className={styles.mobilePosition}>
  {body ? body.index + '–05' : '01–05'}
</output>
{body?.world ? <button type="button" onClick={() => enterWorld(body.world, 'universe')}>ENTER</button> : null}
```

Give the mobile selection surface `touch-action: pan-y` and a `1050ms cubic-bezier(.22,.72,.18,1)` transform transition. On `/`, `GlobalHeader` renders only EROS and MENU; all non-home header behavior is unchanged.

- [ ] **Step 7: Verify and commit**

Run: `pnpm test -- src/features/universe/portalModel.test.ts src/features/universe/SemanticCelestialControls.test.tsx src/features/navigation/GlobalHeader.test.tsx`

Expected: PASS.

```bash
git add src/features/universe/portalModel.ts src/features/universe/portalModel.test.ts src/features/universe/SemanticCelestialControls.tsx src/features/universe/SemanticCelestialControls.test.tsx src/features/universe/universe.module.css src/features/navigation/GlobalHeader.tsx src/features/navigation/GlobalHeader.test.tsx src/features/navigation/navigation.module.css
git commit -m "feat: add Homepage V2 portal controls"
```

### Task 3: Recompose the realtime Portal scene

**Files:**

- Modify: `src/features/universe/universeConfig.ts`
- Modify: `src/features/universe/universeConfig.test.ts`
- Modify: `src/features/universe/UniverseScene.tsx`
- Modify: `src/features/universe/ErosCore.tsx`
- Modify: `src/features/universe/CelestialBody.tsx`
- Modify: `src/features/universe/universe.module.css`

**Interfaces:**

- `CORE_POSITION` moves to the right/upper-right.
- `PORTAL_BODY_POSITIONS` replaces all home-orbit placement.
- `CelestialBody` consumes Portal material profiles and never navigates.

- [ ] **Step 1: Write failing composition tests**

```ts
expect(CORE_POSITION[0]).toBeGreaterThan(0)
expect(CORE_POSITION[1]).toBeGreaterThan(0)
expect(new Set(Object.values(PORTAL_BODY_POSITIONS).map(([x, , z]) => x + ':' + z)).size).toBe(5)
expect(PORTAL_BODY_POSITIONS.studio[2]).toBeLessThan(PORTAL_BODY_POSITIONS.spring[2])
```

- [ ] **Step 2: Run the composition test**

Run: `pnpm test -- src/features/universe/universeConfig.test.ts`

Expected: FAIL because V1 centers the Core and uses orbital placement.

- [ ] **Step 3: Define V2 composition constants**

```ts
export const CORE_POSITION: [number, number, number] = [5.6, 1.45, -1.8]
export const PORTAL_BODY_POSITIONS = {
  spring: [-4.8, 1.1, 1.2],
  summer: [-1.8, 3.35, -1.5],
  autumn: [-5.9, -2.1, -2.8],
  winter: [1.6, -2.9, -4.4],
  studio: [-0.35, -4.2, -6.4],
} as const satisfies Record<CelestialId, readonly [number, number, number]>
```

- [ ] **Step 4: Remove orbit display and build the sculptural Core**

Remove `Line`, `OrbitPath`, and `getOrbitTransform` from `UniverseScene`. Keep bounded desktop pointer response only. Replace Earth-like clouds and surface lights with an obsidian metal base, one matte liquid layer, and limited crystal:

```tsx
<mesh scale={[3.45, 3.05, 2.85]}>
  <icosahedronGeometry args={[1, 5]} />
  <meshPhysicalMaterial color="#070809" metalness={0.76} roughness={0.46} transmission={0.06} thickness={1.1} />
</mesh>
<mesh rotation={[0.28, -0.4, 0.1]} scale={[2.4, 0.7, 1.45]}>
  <sphereGeometry args={[1, 48, 48]} />
  <meshStandardMaterial color="#15191a" metalness={0.22} roughness={0.88} transparent opacity={0.62} />
</mesh>
<mesh position={[-0.8, 0.45, 1.65]} scale={[0.42, 1.9, 0.5]}>
  <octahedronGeometry args={[1, 3]} />
  <meshPhysicalMaterial color="#c7d4d2" transmission={0.44} roughness={0.18} thickness={0.7} transparent opacity={0.32} />
</mesh>
```

- [ ] **Step 5: Render material-distinct bodies**

Spring uses a translucent crystal shell; Summer rough burnt metal with dark internal heat; Autumn rough oxidized mineral; Winter milky transmission plus black fissure seams; Studio near-black absorbing matter with no emission. On mobile, the selected body receives full scale and opacity while the other four become background bodies. Do not remove them or create cards.

```tsx
case 'crystal': return <meshPhysicalMaterial color="#8daea4" transmission={0.42} roughness={0.2} thickness={0.9} />
case 'burned-metal': return <meshStandardMaterial color="#2b2420" emissive="#36170c" emissiveIntensity={0.08} metalness={0.84} roughness={0.44} />
case 'oxidized-mineral': return <meshStandardMaterial color="#493a33" metalness={0.32} roughness={0.88} />
case 'milky-ice': return <meshPhysicalMaterial color="#d6dfdc" transmission={0.34} roughness={0.28} thickness={1.25} />
case 'absorbing-matter': return <meshBasicMaterial color="#030303" />
```

- [ ] **Step 6: Verify and commit**

Run: `pnpm test -- src/features/universe/universeConfig.test.ts src/features/universe/universeInteraction.test.ts`

Expected: PASS.

Run: `pnpm e2e -- --project=desktop-1440 --project=mobile-390 --grep "stable visual reference states" --update-snapshots`

Expected: Home images show a black asymmetric Portal, right-weighted Core, no orbit diagram, and one dominant mobile body.

```bash
git add src/features/universe/universeConfig.ts src/features/universe/universeConfig.test.ts src/features/universe/UniverseScene.tsx src/features/universe/ErosCore.tsx src/features/universe/CelestialBody.tsx src/features/universe/universe.module.css e2e/visual.spec.ts-snapshots/
git commit -m "feat: recompose EROS Homepage V2 portal scene"
```

### Task 4: Add homepage material takeover before route commit

**Files:**

- Create: `src/features/transitions/homepageMaterialHandoff.ts`
- Create: `src/features/transitions/homepageMaterialHandoff.test.ts`
- Modify: `src/state/siteStore.ts`
- Modify: `src/features/transitions/worldEntryMachine.ts`
- Modify: `src/features/transitions/worldEntryMachine.test.ts`
- Modify: `src/features/transitions/useWorldEntry.ts`
- Modify: `src/features/transitions/useWorldEntry.test.tsx`
- Modify: `src/features/transitions/worldEntryDependencies.ts`
- Modify: `src/features/transitions/worldEntryDependencies.test.tsx`
- Modify: `src/features/transitions/WorldEntryOverlay.tsx`
- Modify: `src/features/transitions/WorldEntryOverlay.test.tsx`
- Modify: `src/features/transitions/transitions.module.css`
- Modify: `src/app/AppShell.tsx`
- Modify: `src/app/AppShell.test.tsx`

**Interfaces:**

- Adds `homepageMaterialHandoff: { world: WorldId; source: 'universe' } | null` plus `setHomepageMaterialHandoff(handoff)` to `SiteState`.
- Produces `handoffHomepageMaterial(world, options)` with normal duration `900ms` and reduced-motion duration `0`.
- Adds `transitioning` to `WorldEntryState` and `playHandoff(world, source)` to `WorldEntryDependencies`.

- [ ] **Step 1: Write failing handoff/reducer tests**

```ts
await handoffHomepageMaterial('winter', { setHomepageMaterialHandoff, wait })
expect(setHomepageMaterialHandoff.mock.calls).toEqual([
  [{ world: 'winter', source: 'universe' }],
  [null],
])
expect(wait).toHaveBeenCalledWith(900)

expect(worldEntryReducer(
  { status: 'ready', world: 'spring', requestId: 1, source: 'universe' },
  { type: 'HANDOFF_STARTED', world: 'spring', requestId: 1 },
)).toMatchObject({ status: 'transitioning' })
```

- [ ] **Step 2: Run focused transition tests**

Run: `pnpm test -- src/features/transitions/homepageMaterialHandoff.test.ts src/features/transitions/worldEntryMachine.test.ts`

Expected: FAIL because the homepage handoff and transitioning state do not exist.

- [ ] **Step 3: Implement source-aware sequencing**

After alignment and asset preload resolve, dispatch `HANDOFF_STARTED`, await `playHandoff(world, source)`, check final request identity again, then commit.

```ts
Promise.all([alignment, assets]).then(async () => {
  if (!isCurrent(world, requestId)) return
  dispatch({ type: 'TARGET_ALIGNED', world, requestId })
  dispatch({ type: 'ASSETS_READY', world, requestId })
  dispatch({ type: 'HANDOFF_STARTED', world, requestId })
  await dependencies.playHandoff(world, source)
  if (isCurrent(world, requestId)) commit(world, requestId)
})
```

`createWorldEntryDependencies` runs `handoffHomepageMaterial` only for source `universe`; World Gate and Archive return a resolved promise and retain their current visual behavior.

- [ ] **Step 4: Render the four full-frame takeover treatments**

`AppShell` renders an `aria-hidden`, pointer-inert `[data-homepage-takeover]` above homepage UI while source is universe and clears it before route commit. Add these distinct CSS states:

```css
[data-homepage-takeover][data-world='spring'] { background: radial-gradient(circle at 26% 72%, #a7cdb8 0 2%, transparent 28%), #08100d; clip-path: circle(0 at 26% 72%); animation: spring-growth 900ms cubic-bezier(.22,.72,.18,1) forwards; }
[data-homepage-takeover][data-world='summer'] { background: linear-gradient(105deg, #160d08 0 42%, #f5eee2 58% 100%); clip-path: inset(0 100% 0 0); animation: summer-burn 900ms cubic-bezier(.16,.84,.24,1) forwards; }
[data-homepage-takeover][data-world='autumn'] { background: radial-gradient(circle at 70% 30%, #9b5942, #241a16 48%, #080808 72%); clip-path: circle(0 at 70% 30%); animation: autumn-oxidation 900ms cubic-bezier(.32,.02,.18,1) forwards; }
[data-homepage-takeover][data-world='winter'] { background: linear-gradient(135deg, #e8efec, #6f7a78 45%, #0b0e10 70%); clip-path: polygon(48% 48%,52% 48%,52% 52%,48% 52%); animation: winter-seal 900ms cubic-bezier(.25,.1,.25,1) forwards; }
```

Each animation ends opaque at `inset: 0`. Reduced motion shows the completed frame immediately.

```css
@keyframes spring-growth { to { clip-path: circle(145% at 26% 72%); } }
@keyframes summer-burn { to { clip-path: inset(0 0 0 0); } }
@keyframes autumn-oxidation { to { clip-path: circle(145% at 70% 30%); } }
@keyframes winter-seal { to { clip-path: polygon(0 0,100% 0,100% 100%,0 100%); } }
```

- [ ] **Step 5: Preserve failure recovery and verify**

For non-failed universe states, `WorldEntryOverlay` renders only a visually hidden polite status. Preserve its visible failed-state dialog and existing World Gate/Archive behavior.

Run: `pnpm test -- src/features/transitions/homepageMaterialHandoff.test.ts src/features/transitions/worldEntryMachine.test.ts src/features/transitions/useWorldEntry.test.tsx src/features/transitions/worldEntryDependencies.test.tsx src/features/transitions/WorldEntryOverlay.test.tsx src/app/AppShell.test.tsx`

Expected: PASS, with the order align → preload → handoff → route commit and no Studio entry.

- [ ] **Step 6: Commit**

```bash
git add src/features/transitions src/state/siteStore.ts src/app/AppShell.tsx src/app/AppShell.test.tsx
git commit -m "feat: add Homepage V2 material handoffs"
```

### Task 5: Preserve Portal behavior in static and reduced-motion modes

**Files:**

- Modify: `src/features/fallback/StaticUniverse.tsx`
- Modify: `src/features/fallback/fallback.module.css`
- Modify: `src/features/fallback/SceneFallback.test.tsx`
- Modify: `src/app/responsive.test.tsx`
- Modify: `e2e/fallbacks.spec.ts`
- Modify: `e2e/accessibility.spec.ts`

**Interfaces:**

- Static interactive mode is black, right-weighted, non-orbital, and decorative only; `SemanticCelestialControls` remains the only activation path. The existing non-interactive fallback used outside Home remains unchanged.
- Reduced motion uses a `150ms` intro and immediate completed material frames.

- [ ] **Step 1: Write failing fallback tests**

```tsx
expect(screen.queryByTestId('static-orbits')).not.toBeInTheDocument()
expect(screen.queryByRole('link', { name: 'Studio' })).not.toBeInTheDocument()
expect(screen.getByRole('button', { name: '05 / STUDIO / UNKNOWN' })).toBeInTheDocument()
```

- [ ] **Step 2: Run fallback tests**

Run: `pnpm test -- src/features/fallback/SceneFallback.test.tsx src/app/responsive.test.tsx`

Expected: FAIL because the static scene still contains V1 orbit rings and a direct Studio link.

- [ ] **Step 3: Implement static and reduced-motion V2 states**

When `interactive === true`, remove static orbit rings and static celestial links. Keep sparse stars, black negative space, a right/upper-right Core silhouette, and five decorative material bodies. Do not make Studio a link. When `interactive === false`, preserve the current non-home static fallback unchanged. Disable homepage idle movement, use the `150ms` intro, show completed takeover frames without animation, and retain EROS, MENU, labels, mobile position, and seasonal ENTER actions.

- [ ] **Step 4: Verify and commit**

Run: `pnpm test -- src/features/fallback/SceneFallback.test.tsx src/app/responsive.test.tsx`

Expected: PASS.

Run: `pnpm e2e -- --project=chromium --grep "reduced motion|no WebGL|serious or critical"`

Expected: PASS with no serious or critical axe violations and no Studio navigation.

```bash
git add src/features/fallback src/app/responsive.test.tsx e2e/fallbacks.spec.ts e2e/accessibility.spec.ts
git commit -m "feat: preserve Homepage V2 fallbacks"
```

### Task 6: Verify the Portal Layer and enforce the scope lock

**Files:**

- Modify: `e2e/navigation.spec.ts`
- Modify: `e2e/visual.spec.ts`
- Modify: `e2e/accessibility.spec.ts`
- Modify: `e2e/visual.spec.ts-snapshots/home-*.png`
- Modify: `e2e/visual.spec.ts-snapshots/reduced-motion-*.png`
- Modify: `e2e/visual.spec.ts-snapshots/static-fallback-*.png`

**Interfaces:**

- Produces verified desktop, mobile, reduced-motion, and no-WebGL evidence.
- Produces a changed-file audit that excludes `src/features/worlds/`.

- [ ] **Step 1: Add semantic seasonal entry and Studio-inactivity tests**

```ts
for (const [control, route] of [
  ['01 / SPRING / AWAKENING', '/world/spring'],
  ['02 / SUMMER / BURN', '/world/summer'],
  ['03 / AUTUMN / FADE', '/world/autumn'],
  ['04 / WINTER / FREEZE', '/world/winter'],
] as const) {
  await page.goto('/')
  await page.getByRole('button', { name: control }).click()
  await page.getByRole('button', { name: 'ENTER' }).click()
  await expect(page).toHaveURL(route)
}

await page.goto('/')
await page.getByRole('button', { name: '05 / STUDIO / UNKNOWN' }).click()
await expect(page).toHaveURL('/')
await expect(page.getByRole('button', { name: 'ENTER' })).toHaveCount(0)
```

- [ ] **Step 2: Add session and mobile-swipe tests**

```ts
await page.goto('/')
await expect(page.getByText('NOTHING STAYS EXPECTED.')).toBeVisible()
await page.waitForTimeout(4700)
await expect(page.getByText('NOTHING STAYS EXPECTED.')).toBeHidden()
await page.reload()
await expect(page.getByText('NOTHING STAYS EXPECTED.')).toBeHidden()

await page.locator('[data-portal-selection-surface]').dispatchEvent('pointerdown', { pointerType: 'touch', clientX: 320 })
await page.locator('[data-portal-selection-surface]').dispatchEvent('pointerup', { pointerType: 'touch', clientX: 60 })
await expect(page.getByRole('status', { name: 'Portal position' })).toHaveText('02–05')
```

- [ ] **Step 3: Update visual evidence**

Capture the resolved homepage after the opening is absent, plus every seasonal takeover before navigation. Freeze idle WebGL only; do not freeze takeover CSS. Regenerate Home, reduced-motion, and static fallback baselines at desktop, laptop, tablet, mobile, and landscape sizes.

- [ ] **Step 4: Run the full verification matrix**

Run: `pnpm lint`

Expected: exit 0.

Run: `pnpm test`

Expected: exit 0.

Run: `pnpm build`

Expected: exit 0.

Run: `pnpm e2e`

Expected: exit 0 across Chromium, desktop, laptop, tablet, mobile, landscape, and production-preview.

Run: `git diff --name-only HEAD~5..HEAD`

Expected: no path beginning with `src/features/worlds/`.

- [ ] **Step 5: Commit verification artifacts**

```bash
git add e2e/navigation.spec.ts e2e/visual.spec.ts e2e/accessibility.spec.ts e2e/visual.spec.ts-snapshots/
git commit -m "test: verify EROS Homepage V2 portal"
```

## Plan Self-Review

| Specification area | Plan task |
|---|---|
| Session-only black opening and exact phrase | Task 1 |
| Minimal chrome, contextual labels, and inactive Studio | Task 2 |
| Mobile order, indicator, and 0.9–1.2 second settle | Task 2 |
| Off-center Core, black space, material-first bodies, and no orbits | Task 3 |
| Growth, scorching, oxidation, and freezing before route handoff | Task 4 |
| Seasonal detail-page isolation | Global Constraints and Task 6 |
| Reduced motion, no-WebGL, keyboard, and touch behavior | Task 5 |
| Visual, accessibility, build, and scope verification | Task 6 |

- Every referenced function, type, duration, route, and state transition is introduced in the task where it first appears.
- The file map excludes all four seasonal detail-page implementation files.
- The plan contains no unassigned implementation work. Visual micro-tuning is permitted only within the fixed material, copy, duration, route, and scope constraints.
