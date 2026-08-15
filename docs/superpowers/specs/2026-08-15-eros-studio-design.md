# EROS STUDIO Brand Website V1 — Design Specification

**Date:** 2026-08-15

**Status:** Approved for implementation planning

**Design process:** Superpowers brainstorming

**Implementation gate:** This specification must receive a separate document-review approval before `writing-plans` begins.

## 1. Decision authority and versioning

This specification defines the active EROS STUDIO website direction for this project.

The current direction supersedes older EROS studies that treated the four seasons as examples rather than configured Worlds, or that configured `OASIS`, `DESERT`, `SUMMIT`, and `ABYSS` as the primary World inventory. Those studies remain historical references only and must not influence routes, navigation, scene inventory, or public copy unless the user explicitly restores them.

The following decisions are confirmed:

| Area | Confirmed decision |
|---|---|
| Product form | A complete, locally functional brand-frontend V1 |
| Required stack | React + React Three Fiber + Three.js |
| Experience approach | Hybrid realtime scenes: WebGL atmosphere plus semantic React commerce/editorial UI |
| Home | EROS Universe with an Earth-derived EROS Core and five continuously moving celestial entrances |
| Configured Worlds | Spring / AWAKENING, Summer / BURN, Autumn / FADE, Winter / FREEZE |
| Fifth celestial entrance | The Studio / About, visually smaller, darker, and more distant |
| Product organization | World and feel first; conventional attributes retained for search, filtering, and inventory compatibility |
| Archive | A quiet `ARCHIVE / ALL OBJECTS` utility page |
| Postprocessing | `@react-three/postprocessing` is installed and active in every WebGL scene |
| Mobile | Re-composed interaction and layout, not a scaled desktop canvas |
| Commerce depth | Search and local Bag are functional; no live inventory, checkout, orders, or accounts |

## 2. Product outcome

V1 must feel like entering a fashion universe rather than opening a conventional online shop. It must also remain usable when visitors want to search, compare, inspect, or add an Object to Bag.

The primary emotional journey is:

```text
EROS Universe → Seasonal World → Editorial encounter → Object → Product Detail
```

The parallel efficiency journey is:

```text
Menu / World Gate → World, Archive, Studio, Search, or Bag
```

Success means the experiential and commercial paths coexist without one disguising or obstructing the other.

## 3. V1 scope

### Included

- A full-screen EROS Universe Home.
- A realtime Earth-derived EROS Core.
- Five independently orbiting and rotating celestial entrances.
- Four distinct seasonal World pages.
- A restrained The Studio page.
- An Archive with World, type, material, and color filtering.
- Search across the demonstration product set.
- Product Detail pages.
- A functional local Bag with quantity changes and persistence.
- A full-screen Menu / World Gate.
- Desktop, tablet, narrow-mobile, and landscape-mobile compositions.
- High, Balanced, and Lite WebGL quality tiers.
- Reduced-motion and no-WebGL fallbacks.
- Automated functional, accessibility, responsive, visual, and performance verification.

### Excluded

- Live checkout, payment processing, inventory, orders, customer accounts, or authentication.
- CMS or admin interfaces.
- Production analytics, user profiling, or marketing automation.
- Community, Journal, membership, loyalty, or AI stylist features.
- An autoplaying ambient-audio system.
- Invented EROS product history, founder story, or supposedly real released products.
- Public hosting, production deployment, and domain changes.

## 4. Information architecture

### Routes

```text
/
├── /world/spring
├── /world/summer
├── /world/autumn
├── /world/winter
├── /studio
├── /archive
├── /product/:slug
├── /search
└── /bag
```

Search and Bag may appear as responsive overlays while retaining canonical routes so browser Back, deep links, and focus restoration remain predictable.

### Primary browsing rules

- Home is an entrance, not a product grid.
- A seasonal celestial body enters its World, never a product directly.
- The Studio celestial body enters `/studio` and contains no product taxonomy.
- Each World introduces atmosphere before editorial media and products.
- Product Detail is visually quieter than its World.
- Archive provides complete structural access without becoming Home's primary action.
- Search and Bag are reachable from every route.
- Browser Back restores the originating route, selection, scroll position, and focus when practical.

## 5. Global interface and navigation

### Desktop header

```text
EROS                         SEARCH   BAG 00   MENU
```

- The header is transparent or nearly transparent.
- Text contrast adapts to the current scene without adopting a World as a permanent brand color.
- No cards, glass panels, thick shadows, persistent glow, or oversized cursor treatment.
- `EROS` returns Home.
- `BAG 00` exposes the current item count.

### Menu / World Gate

The visible trigger is `MENU`; the full-screen layer identifies itself as `WORLD GATE`.

Its first-level destinations are:

```text
Spring / Awakening
Summer / Burn
Autumn / Fade
Winter / Freeze
Archive / All Objects
The Studio
Search
Bag
```

The layer is an efficiency surface, not a duplicate realtime universe. It opens promptly, supports `Escape`, traps focus, restores focus on close, and preserves the underlying route and scroll position.

### Mobile header and menu

- The header reduces to `EROS`, `BAG`, and `MENU`.
- Search moves into the menu's first level.
- Destinations use a single-column vertical composition.
- All essential meaning and actions remain visible without Hover.

### Typography roles

- Brand, World names, and navigation: wide, controlled, modern uppercase sans serif.
- Editorial and conceptual lines: a physical but restrained serif.
- Product facts, filters, numbers, and prices: neutral sans serif with tabular numerals.
- Final font-family selection is an implementation visual-refinement task. It must preserve these approved roles, use legally compatible files, and pass performance and readability checks.

### Global palette

The shared interface uses deep black, graphite, cold white, and low-contrast silver. Seasonal colors remain inside their World contexts.

## 6. Home — EROS Universe

### Spatial composition

Home occupies one full viewport when the available height permits. Content may scroll naturally if text zoom, browser chrome, or a short viewport would otherwise clip controls.

The scene uses three perceptual depth bands:

1. **Far field:** deep space, extremely slow cloud or nebula variation, and sparse distant stars.
2. **Middle field:** multi-depth star points, restrained dust, and minute parallax.
3. **Near field:** EROS Core, five celestial entrances, orbital traces, and local particles.

The scene must not resemble a symmetrical classroom solar-system model. Orbits use different radii, inclinations, depth relationships, and periods. Celestial bodies are not evenly distributed.

### Earth-derived EROS Core

The Core is slightly off-center and larger than every entrance body. It retains Earth-associated cues:

- a thin atmosphere;
- slow cloud-like movement;
- an illuminated edge;
- a substantial dark side;
- extremely restrained signs of life or surface light.

It does not show recognizable continent outlines or reproduce a familiar satellite globe. The result should recall Earth while remaining a proprietary EROS celestial identity.

### Celestial entrances

- Spring, Summer, Autumn, and Winter receive distinct, low-saturation material cues.
- Studio is smaller, darker, farther away, and placed on a more isolated orbit.
- Every body has independent orbit and self-rotation periods.
- Movement remains time-based and continuous across long sessions.
- Returning Home reconstructs celestial positions from a stable time source rather than resetting every orbit to its initial frame.
- Orbit traces remain almost invisible until their related body is selected or focused.

### Stars, dust, and parallax

- Star luminance uses deterministic seeded variation so stars do not blink in synchronized groups or change identity after React renders.
- Twinkle cycles are slow, low amplitude, and individually offset.
- Dust remains sparse and exists at more than one depth.
- Desktop pointer input shifts the camera rig or depth layers by only a few pixels and settles on leave.
- Mobile has no pointer-dependent behavior.

### Interaction

Desktop Hover or keyboard focus:

- increases local rim light and material clarity slightly;
- exposes a restrained label and entry line;
- reveals only the relevant orbital trace;
- never stops the universe or enlarges the body dramatically.

Activation:

1. Lock the target and suppress competing labels.
2. Orient the camera rig toward the target without a sharp snap.
3. Advance toward the body over a restrained cinematic interval.
4. Let the selected World's material or light take over the frame.
5. Resolve the route through the shared World Entry system.

Mobile interaction:

- A bounded swipe adjusts the observation angle rather than spinning the entire system.
- A first Tap selects a body and reveals its label and `ENTER` action.
- `ENTER` performs navigation.
- Controls also exist in synchronized semantic HTML so the canvas is never the only navigation path.

### Motion restraint

- Orbital periods should feel measured in minutes, not seconds.
- Pointer parallax remains within single-digit pixels at normal desktop sizes.
- No camera shake, fast rotation, heavy lens flare, continuous light sweeps, or excessive Bloom.
- The experience must look active when observed over time without demanding constant attention.

## 7. Shared World Entry and loading state

Every World entry, whether launched from Home, World Gate, or Archive, uses one shared route-transition system.

- The transition preserves the selected World name and visual identity.
- Asset readiness controls completion.
- No decorative spinner, fake percentage, forced dwell time, or artificial delay is permitted.
- If assets are already available, the visual handoff completes immediately at its natural transition boundary.
- Reduced Motion uses an immediate change or short crossfade.
- Failure in a World scene falls back to its accessible static composition without blocking route content.

## 8. Shared World page architecture

All Worlds use this information sequence:

```text
World Entry
→ Atmosphere
→ Editorial
→ Objects
→ Next World
```

This is a content contract, not a shared visual template.

- `Atmosphere` establishes the body's physical response before products appear.
- `Editorial` uses authored imagery and restrained text to connect mood to clothing.
- `Objects` introduces demonstration products within the World while keeping product facts readable.
- `Next World` is explicit and never auto-navigates.
- Each World's realtime scene runs behind or around semantic React content.
- WebGL must never obscure original product media, prices, sizes, or controls.

Earlier concept images are art-direction references. They may support composition and asset production, but a single image may never substitute for required realtime atmosphere and motion.

## 9. Seasonal Worlds

### Spring / AWAKENING

**Physical response:** humid air becoming breathable and life beginning to move.

- Thin mist, water vapor, wet reflections, condensation, and slow local biological motion.
- A restrained upward tendency in light and composition.
- Green appears as evidence of life rather than a large background fill.
- The page progresses from sealed darkness toward permeability and breath.
- Avoid flowers, bright grass green, cheerful spring marketing, and decorative particle bursts.

### Summer / BURN

**Physical response:** hard light and dry heat removing places to hide.

- Strong directional light, sharp shadow, localized air refraction, dryness, and slight overexposure.
- Heat distortion affects air and environmental boundaries, never product images or readable text.
- Motion is more direct than the other Worlds but remains controlled.
- Avoid flames, beach imagery, orange-red gradients, flicker, and universal ripple filters.

### Autumn / FADE

**Physical response:** warmth and structure receding through time.

- Low-angle light, long shadows, dry air, dust, wind response, erosion, and weathered surfaces.
- The visual clock moves gradually toward dusk.
- Decay is beautiful but not nostalgic or decorative.
- Avoid leaf-filled scenes, vintage filters, harvest imagery, and generic brown overlays.

### Winter / FREEZE

**Physical response:** cold expressed through distance, low exchange, and near-stillness.

- Low-saturation cold greys, remote fog, snow or ice dust, frost, and broad empty regions.
- This World has the smallest motion amplitude and longest atmospheric cycles.
- Edge frost and breath-like condensation remain extremely subtle.
- Avoid Christmas imagery, picturesque snow landscapes, blue neon ice, and busy snowfall.

## 10. Editorial and commerce surfaces

### Demonstration Objects

V1 uses clearly marked demonstration data to prove composition and interaction. It must not imply that prototype names, prices, media, or stories are real released EROS products.

Each Object contains at least:

```text
id
slug
name
objectNumber
world
feel[]
type
material[]
color[]
price
currency
sizes[]
media[]
editorialCopy
designConcept
constructionNotes[]
```

### Archive / All Objects

- Archive is a quiet, direct product index.
- Filters include World, type, material, and color.
- Product type remains a secondary utility, never Home's primary taxonomy.
- Filters are represented in the URL so views can be restored and shared.
- The page supports an empty result, reset, keyboard operation, and screen-reader status updates.

### Search

- Search covers Object name, number, World, feel, type, material, and color.
- Results update accessibly and can be reached by keyboard.
- An empty query explains searchable fields without filling the page with suggestions.
- A no-result state preserves the query and offers Archive or reset paths.

### Product Detail

Product Detail reduces environmental intensity and prioritizes purchase clarity.

Required order:

```text
Primary media
Name and Object number
Price
Size selection
Material and construction
Editorial media
Design concept
Detail media
Add to Bag
Belongs to World
```

- Original media proportions are preserved.
- The selected size is required before Add to Bag when sizes exist.
- Validation is announced accessibly and does not rely on color.
- `BELONGS TO — [WORLD]` returns the visitor to the related World.

### Bag

- Bag supports add, remove, quantity adjustment, subtotal, and persistence.
- Bag state is local to the browser.
- The interface states plainly that checkout is unavailable in this frontend prototype.
- It does not collect address, payment, email, or other personal information.

### The Studio

The Studio is a darker, lower-visual-weight archive/workroom context with concise sections for:

- what EROS is;
- material and making direction;
- future workspace, prototype, and process media;
- Archive access;
- Contact placeholder structure without a live submission form.

It must not invent a founder biography or generic fashion-brand origin story.

## 11. Responsive composition

Responsive behavior is part of every component definition.

### Desktop and laptop

- Show the fullest scene depth, postprocessing quality, particles, and pointer response.
- Preserve readable navigation across wide and short-height viewports.
- Allow natural page scroll when a single-screen composition cannot safely contain enlarged text.

### Tablet

- Use touch-first controls and reduce simultaneous visual layers.
- Preserve spatial hierarchy without requiring hover or precise pointer input.

### Narrow mobile

- Recompose Home around a narrower camera frustum and vertically legible depth relationships.
- Use select-then-enter planet interaction.
- Stack World editorial and commerce content without equalizing every image width.
- Keep native vertical scrolling and safe-area padding.
- Do not require device orientation or gyroscope access.

### Landscape mobile and short-height screens

- Keep navigation reachable and allow vertical scrolling.
- Prevent the selected-body panel or `ENTER` control from covering the celestial target.
- Avoid fixed-height copy blocks that clip at large text sizes.

## 12. Technical architecture

### Core stack

- Vite
- React
- TypeScript
- React Router
- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- `@react-three/postprocessing`
- Zustand
- Motion
- Vitest
- React Testing Library
- Playwright

No additional runtime dependency is added unless a demonstrated requirement cannot be met cleanly with this set.

### Runtime boundaries

#### App Shell

Owns routing, semantic document structure, header, World Gate, Search, Bag, focus management, and route-level error boundaries.

#### Scene Host

Owns the canvas, renderer settings, camera rig, quality tier, postprocessing composer, scene lifecycle, and transition handshake.

#### Universe Scene

Owns the Core, celestial bodies, orbits, star fields, dust, hover/focus synchronization, and camera target selection.

#### World Scenes

Spring, Summer, Autumn, and Winter are separate, lazy-loaded modules. Each provides visual tokens, asset requirements, atmosphere behavior, and postprocessing configuration through a shared scene contract.

#### World Entry

Coordinates route intent, real asset readiness, scene transition, reduced-motion behavior, success, timeout, and fallback.

#### Editorial Layer

Owns World text, imagery, product sequencing, scroll composition, and semantic landmarks.

#### Commerce Layer

Owns Archive, Search, Product Detail, Bag, filtering, validation, and local persistence.

#### Fallback Experience

Owns reduced-motion, Lite, static layered-space, and no-WebGL navigation equivalents.

### Postprocessing policy

`@react-three/postprocessing` is active in every WebGL scene through an `EffectComposer`.

- Desktop may use the full approved effect set with restrained values.
- Mobile retains the composer but reduces sampling, precision, and effect cost.
- The most expensive nonessential pass may be disabled by the Lite tier.
- Reduced Motion removes motion, not static tone, atmosphere, or optical identity.
- No-WebGL fallback is the only mode without the composer.
- Bloom, depth of field, noise, chromatic effects, and vignetting must be justified per scene rather than globally maximized.

### Animation policy

- R3F frame loops and damped interpolation handle celestial motion, camera rigs, and realtime atmospheric parameters.
- Motion handles DOM layers, menus, route overlays, and restrained shared-element transitions.
- Native scrolling remains authoritative.
- No scroll hijacking, mandatory snapping, continuous text loops, or competing animation runtimes.

### State boundaries

Zustand stores only shared client state:

- selected celestial body;
- current transition state;
- current quality tier;
- World Gate state and originating focus;
- recent World and return context;
- Search state that must survive an overlay route;
- Bag contents;
- user motion preference as observed from the platform.

Ephemeral mesh animation values and local form state remain inside their components.

### Data flow

```text
Route
  → typed World or Product lookup
  → App Shell renders semantic content
  → Scene Host lazy-loads the corresponding scene module
  → World Entry waits for actual required assets
  → transition resolves or falls back

User interaction
  → semantic control or synchronized 3D target
  → shared selection state
  → explicit navigation intent
  → transition state machine
  → router commit

Archive or Search filters
  → URL parameters
  → typed Object selector
  → accessible result status

Add to Bag
  → validated Object and size
  → local Bag store
  → versioned local persistence
  → header and Bag route update
```

### Code splitting

- Home loads Universe code and Home-critical assets only.
- Each World scene and editorial bundle loads independently.
- Product and Archive routes do not import every World scene eagerly.
- Noncritical media loads near the viewport.
- Asset manifests distinguish desktop and mobile variants.

## 13. Performance budgets

Budgets are acceptance criteria, not aspirations.

### Desktop

- Target 60 FPS on a representative midrange discrete GPU.
- Complex transitions must not remain below 45 FPS.
- Home critical assets: approximately 3 MB or less before optional deferred assets.
- Typical texture maximum: 2K.
- Default DPR ceiling: 1.5.
- Scene draw-call target: 120 or fewer.
- Particle target: approximately 4,000 or fewer.

### Mobile

- Target stable 30–45 FPS on a representative modern midrange phone.
- Home critical assets: approximately 1.5 MB or less.
- Initial World entry assets: approximately 2 MB or less.
- Typical texture maximum: 1K.
- Default DPR ceiling: 1.25.
- Scene draw-call target: 60 or fewer.
- Particle target: approximately 800–1,200.
- Avoid mobile realtime shadows when a cheaper lighting solution preserves the design.

### Quality adaptation

High, Balanced, and Lite tiers are selected from device signals and a short measured performance sample. Sustained frame-time pressure degrades DPR, particles, shadows, transparency, and expensive passes in that order while preserving navigation and visual hierarchy.

## 14. Accessibility

Target WCAG 2.2 AA.

- Canvas is marked as decorative or supplementary where equivalent semantic controls provide navigation.
- Every celestial entrance has synchronized HTML text, focus, selection, and activation.
- All routes have correct page titles, landmarks, heading order, and skip navigation.
- World Gate, Search, media inspection, and Bag overlays trap and restore focus.
- `Escape` closes dismissible layers.
- Visible focus never depends only on a shader or material change.
- Color, motion, and depth are never the only carriers of meaning.
- Touch targets are at least `44 × 44px`.
- Text supports browser zoom without clipping or forced shrinking.
- Status changes such as results, Bag updates, validation, and scene fallback are announced appropriately.
- Reduced-motion preference is observed from first render and during preference changes.

## 15. Fallbacks and error handling

### Reduced Motion

- Stop continuous orbits, particle cycles, pointer parallax, and camera flight.
- Preserve final spatial composition and clear celestial controls.
- Use immediate state changes or `150–250ms` opacity transitions.
- Retain static postprocessing tone where WebGL remains available.

### Lite WebGL

- Retain R3F and the postprocessing composer.
- Reduce DPR, particles, shadow cost, transparency, sampling, and nonessential passes.
- Preserve World-specific lighting and color relationships.

### No WebGL or lost context

- Present a layered static space composition, CSS star points, and accessible 2D celestial controls.
- Retain all navigation, Archive, Search, Product, Studio, and Bag functionality.
- Offer one clear retry action after a recoverable context loss.

### Asset or scene failure

- Reserve layout dimensions to avoid collapse.
- Fall back at the smallest boundary: media, atmosphere, World scene, then global static mode.
- Never let one failed texture or effect crash the App Shell.
- Keep World title, content, products, navigation, and retry information visible.
- Route-level error boundaries offer a safe Home or Archive path.

### Local persistence failure

- Continue with in-memory Bag state.
- Show a concise notice that the Bag may not persist after refresh.
- Never block product browsing or Add to Bag solely because storage is unavailable.

## 16. Testing and verification

### Unit tests

- Typed World and Object configuration validation.
- Orbit parameter generation and deterministic star seeds.
- Archive and Search selectors.
- Bag add, remove, quantity, subtotal, version migration, and storage failure.
- Quality-tier selection and degradation thresholds.
- Transition-state reducer and final-intent resolution during rapid selection.

### Component tests

- Global header and route labels.
- World Gate focus trap, `Escape`, and focus restoration.
- Planet semantic controls and select-then-enter mobile behavior.
- Archive filters and result announcements.
- Product size validation and Add to Bag.
- Reduced Motion and fallback content.
- Asset and route error boundaries.

### Browser tests

1. Select and enter each World from Home.
2. Navigate World → Product → Add to Bag.
3. Navigate Menu → Archive → Filter → Product.
4. Navigate Search → Product and restore the originating context.
5. Refresh and confirm supported Bag and recent-World persistence.
6. Rapidly select different Worlds and confirm only the final intent navigates.
7. Simulate reduced motion, unavailable WebGL, context loss, and asset failure.
8. Verify keyboard-only and touch-primary navigation.

### Visual and responsive verification

Verify the running application, not only DOM snapshots, at representative sizes including:

- wide desktop;
- ordinary laptop;
- tablet;
- a narrow phone near 360 CSS pixels;
- a modern phone near 390 CSS pixels;
- landscape or another short-height viewport.

Capture stable reference states for Home, each World threshold, World Gate, Archive, Product Detail, Bag, Reduced Motion, and static fallback.

### Performance verification

- Inspect frame pacing during Home idle, selection, and World entry.
- Record draw calls, triangles, textures, renderer memory, and active postprocessing passes.
- Check critical-route transferred bytes and lazy-loading boundaries.
- Confirm mobile scroll remains responsive while a World scene is active.
- Treat visible stutter, delayed touch response, or sustained budget failure as a failed acceptance test.

## 17. Acceptance criteria

The frontend V1 is complete only when all of the following are true:

1. EROS Core and five celestial entrances render as a coherent cinematic system rather than a classroom model.
2. All five entrances remain reachable through pointer, touch, and keyboard interaction.
3. The four seasonal bodies orbit and rotate independently and continuously in full-motion mode.
4. Spring, Summer, Autumn, and Winter produce clearly different physical and emotional responses before labels are required to explain them.
5. Home-to-World transitions use actual asset readiness and recover safely from failure.
6. Archive, Search, Product Detail, and local Bag complete the agreed commercial browsing path.
7. Mobile is compositionally redesigned and has no unreachable or hover-only action.
8. `@react-three/postprocessing` is active in every WebGL scene, with tier-appropriate settings.
9. Reduced Motion, Lite, and no-WebGL experiences retain the complete site hierarchy and commerce path.
10. Automated tests, production build, browser flows, visual review, accessibility checks, and performance budgets pass with recorded evidence.
11. No real checkout, account, inventory, CMS, or unapproved public deployment is introduced.

## 18. Implementation handoff constraints

- Implementation begins only after the user reviews and approves this written specification.
- `superpowers:writing-plans` is the next workflow after approval.
- The implementation plan must divide work into verifiable increments and preserve the design gates above.
- Complete files should be delivered when practical.
- When an error appears, investigate and reproduce it before editing.
- Browser-visible behavior and screenshots are the final authority for visual acceptance.
