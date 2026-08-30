# Task 13 review stabilization report

## RED

- Reproduced that a rejected editorial image decode only committed a route; it did not select an image-safe scene fallback.
- Reproduced that the World Gate alignment branch performed no material handoff.
- Reproduced the old 767px-only preload decision selecting the 1600px asset for an `844 × 390` coarse-pointer viewport.
- Reproduced direct next-World links retaining document scroll and threshold headings exposing only their season as the accessible name.

## GREEN

- Failed entry preload now activates the shared `reducedVisualWorld` override before committing; `SceneHost` consumes it and renders `StaticUniverse`, without retrying the failed decoder or scene import.
- World Gate applies a selected World DOM-state handoff for 200ms; `prefers-reduced-motion` uses the immediate version. Universe alignment remains the only path that flies the camera.
- Entry commit resets document scroll before route navigation and each World route resets it after route change, including direct next-World links.
- Spring samples its mutable progress ref in the R3F frame loop and mutates fog, wet-film opacity, living light, and fracture intensity without changing scene ownership.
- Headings now expose `SEASON / CONCEPT`; landscape touch phones select 960px editorial preloads.

## Verification

- Focused transition regressions: 20 passing (Canvas/EffectComposer suspension and bounded preload timeout included).
- The earlier full suite passed before the final runtime regressions; a subsequent single-worker sweep reached the existing World-page coverage without an assertion failure before the runner stopped reporting completion.
- Lint, production build, and `git diff --check` passed; clean-status check follows the commit.

## WebGL limitation

Headless unit tests verify the frame-time data path and scene fallback selection, but cannot faithfully assert GPU-rendered fog/material pixels. Browser validation therefore confirms route and fallback behavior; a GPU-enabled visual run remains the authoritative check for final material tuning.

## Final veil correction

- World Gate handoff now renders a fixed, non-interactive DOM material veil above the WebGL canvas and beneath semantic navigation and entry overlays. Its active material state is bounded to 200ms; reduced motion resolves without animation.

## Realtime transition stabilization

- A lazy World scene now suspends inside the already-mounted WebGL canvas. The initial realtime-layer import remains the only outer suspense boundary, so route-scene loading cannot tear down the canvas or its EffectComposer.
- Critical scene import plus editorial image decode is bounded to 8 seconds in production. A timeout takes the existing failed-entry recovery path, exposing reduced visuals instead of leaving the entry overlay indefinitely in `Preparing`.
- Regression coverage proves the canvas and EffectComposer remain mounted during lazy World-scene suspension and that a never-resolving decode rejects through an injected short timeout.
