# EROS Homepage GLTF/PBR Rebuild — Design Specification

**Date:** 2026-09-06

**Status:** Confirmed architecture captured; awaiting review of this written specification

**Design process:** Corrective continuation of the approved EROS Homepage V2 direction

**Implementation gate:** No implementation work begins until the user reviews and approves this document. After approval, a new implementation plan is required.

## 1. Authority and scope

This specification governs the visual asset and realtime rendering architecture of the EROS homepage at `/`. It supersedes the primitive-only scene implementation prescribed by `2026-09-01-eros-homepage-v2.md`, but preserves the confirmed experience, copy, route boundaries, World order, interaction model, and material identities in `2026-09-01-eros-homepage-v2-design.md`.

The rebuild is limited to:

- the EROS Core;
- the five homepage celestial bodies, of which four are World entrances and Studio is deliberately non-navigable;
- homepage lighting, spatial atmosphere, motion, labels, selection, and entry handoff;
- homepage model loading, quality tiers, and visual fallbacks;
- homepage-specific tests and visual baselines.

Spring, Summer, Autumn, Winter, Archive, Product, Search, Bag, World Gate, and Studio route content remain outside this visual rebuild. Existing uncommitted homepage interaction work must be preserved, audited, and either incorporated or superseded explicitly rather than discarded.

## 2. Corrective finding

The current browser output is not an asset-loading failure. The WebGL scene renders successfully, but its implementation cannot produce the approved art direction:

- the Core is assembled from one scaled icosahedron, one sphere, and one octahedron;
- the five entrances share one icosahedron geometry and differ mainly by flat material parameters;
- transmission and metal materials have no sufficiently authored reflection environment, surface maps, displacement, or silhouette detail;
- celestial positions are static anchors, so the bodies rotate but do not sustain convincing spatial motion;
- the camera crop gives the Core monumental area without enough surface information to justify that scale;
- duplicated control styles displace contextual identity and visually clip the enter action;
- visual regression baselines were updated from the low-fidelity implementation, so passing screenshot tests preserved the wrong visual result.

The repair must therefore replace the asset/rendering foundation and reset visual approval practice. It must not merely tune colors, light intensity, or postprocessing.

## 3. Confirmed architectural choice

The homepage uses a hybrid realtime pipeline:

```text
Original Blender source assets
  -> authored silhouettes and material slots
  -> GLTF/GLB export
  -> Meshopt geometry optimization + KTX2 texture compression
  -> manifest-driven LOD selection
  -> R3F scene orchestration
  -> PBR base materials + isolated procedural effect layers
  -> @react-three/postprocessing finish
```

Responsibilities are separated as follows:

- **GLTF geometry:** recognizable silhouette, medium-scale fracture, erosion, crystalline protrusions, cavities, and sculptural asymmetry.
- **PBR maps:** base color, normal, roughness, metalness, ambient occlusion, and packed masks for fine material character.
- **Procedural effect layers:** only phenomena that must remain alive, including liquid drift, internal growth, retained heat, oxidation change, frost response, corona, and local atmospheric contamination.
- **R3F/Three.js:** loading, LOD, camera, lighting, selection, raycasting, slow movement, reduced motion, transition control, and quality adaptation.
- **Semantic React:** labels, keyboard access, mobile status, enter actions, announcements, and fallback navigation.

The production homepage must never depend on a single rendered image or video to impersonate realtime motion. Still renders derived from the same models are permitted only for no-WebGL and failure fallbacks.

## 4. Original asset policy

The EROS Core and all five celestial bodies are original EROS assets. Do not download or adapt recognizable stock planets, astronomy models, game assets, or science-fiction props.

Authoring source is versioned separately from delivery assets:

```text
assets-source/homepage/
  eros-homepage-master.blend
  textures/
  renders/approval/

public/assets/homepage/
  manifest.json
  core/core-{high,medium,low}.glb
  bodies/<world>/<world>-{high,medium,low}.glb
  textures/*.ktx2
  fallback/home-{desktop,mobile}.{avif,webp}
```

The exact filenames may be refined in the implementation plan, but source and runtime assets must remain distinct. Every exported mesh uses stable names and material slots so code does not depend on traversal order.

Binary authoring sources, high-resolution textures, and approval renders must use Git LFS or an explicitly versioned external artifact store before they enter shared history. Small optimized runtime assets may remain in the repository when they satisfy the declared budgets. Do not repeatedly commit heavyweight raw exports as ordinary Git blobs.

The asset manifest records URL, role, LOD, compressed bytes, triangle count, material count, texture set, bounding volume, and integrity hash. A build-time validator rejects missing slots, unexpected material names, budget violations, and uncompressed delivery textures.

## 5. EROS Core

The Core remains monumental, right-weighted, elegant, and approximately `85% beauty / 15% otherness`. It is not a round planet.

The authored silhouette must contain controlled asymmetry at three scales:

- a calm overall mass that can be read from a distance;
- broad compression, folds, cuts, or displaced planes that break the planetary sphere;
- limited crystal incursions and liquid boundaries visible only under changing light.

Required stable material slots:

- `core_obsidian`: near-black mineral/metal base with readable roughness variation;
- `core_matte_metal`: broad quiet planes that catch cold area lights;
- `core_liquid_mask`: restrained animated membrane, never a glossy slime layer;
- `core_crystal`: sparse translucent interruptions with controlled dispersion/refraction;
- `core_emissive_mask`: very limited internal energy, not a glowing core or neon outline.

The Core's large screen area must reveal grazing highlights, subtle surface relief, and occlusion. A dark flat disc is a failed state. Pointer response is limited to small orientation/light changes and local liquid response; the Core never chases the pointer.

## 6. Five material-specific bodies

All bodies share a spatial grammar but use independently authored silhouettes and maps.

### 01 / Spring / Awakening

- Moist translucent crystal over a denser interior.
- Pressure fractures and restrained subsurface growth are modeled or masked, not painted as green decoration.
- Motion is a slow internal migration and minute condensation response.

### 02 / Summer / Burn

- Ablated metal with burned edges, uneven thermal roughness, and a dark retained-heat interior.
- Heat appears locally through emissive masks and refractive disturbance; the body is not a red planet.
- Motion is material heat decay and subtle shimmer, not flame animation.

### 03 / Autumn / Fade

- Eroded mineral layers, oxidized seams, exposed aggregate, and controlled loss at the silhouette.
- Warmth survives in isolated recesses while the overall body remains subdued.
- Motion is sparse particulate release and nearly imperceptible surface change.

### 04 / Winter / Freeze

- Milky ice/mineral mass with opaque depth, frosted roughness, and black structural fissures.
- Fissures belong to geometry or authored masks; wireframe overlays are prohibited.
- Motion approaches stillness: minute frost opacity and cold light response only.

### 05 / Studio / Unknown

- A near-light-absorbing sculptural form with a readable silhouette created by occultation and a very narrow rim.
- It receives the same focus and selection quality as the seasonal bodies but has no Enter state, takeover, or route.
- It must not become invisible simply because its material is black.

## 7. Spatial composition and motion

Desktop preserves the approved asymmetrical Portal Layer: the Core enters from the right or upper-right, black negative space remains dominant, and the five bodies occupy distinct depths without a balanced ring.

Static placement constants become authored anchor points rather than final frozen positions. Each body receives:

- a unique slow orbit or elliptical drift around its anchor;
- a unique self-rotation period;
- a small depth oscillation with no synchronized phase;
- restrained selected-state emphasis without jumping position.

No prominent orbit lines are drawn. Movement must be visible over time but slow enough that the composition still feels controlled. Reduced motion resolves every body to a stable, deliberately composed frame.

Mobile uses a separate camera and composition profile. One body is dominant at a time, four remain as quiet depth cues, and horizontal swipe changes the selected body over the confirmed `0.9–1.2s` settling interval. Mobile never loads desktop high LOD merely because device pixel ratio is high.

## 8. Lighting, reflection, and postprocessing

Material recognition is established before postprocessing.

- Use an original low-resolution reflection environment or procedural light cards for cold studio reflections; do not rely on an unrelated stock space HDRI.
- Use broad area-like key and edge sources, a controlled local fill, and World-specific contamination near the selected body.
- Keep the background approximately `90%` black/grey/cold white.
- Bloom is selective and low; ordinary stars and broad surfaces must not glow.
- Depth of field clarifies spatial layers without making unselected bodies look like accidental blur.
- Noise and vignette remain filmic finishing passes, not substitutes for surface detail.
- Tone mapping and exposure are locked per quality profile so material approval is reproducible.

`@react-three/postprocessing` remains active in every WebGL quality tier. Lite removes expensive depth/refraction effects but keeps tone mapping and the approved restrained finish.

## 9. Interaction and semantic controls

Raycast Hover, pointer focus, keyboard focus, and semantic button selection share one selected-body state. A first body click selects it. Desktop may activate an already-selected seasonal body with a second click, while the visible Enter action remains the explicit activation path for pointer, keyboard, and touch users. Studio never activates.

The contextual identity must remain visibly readable and use the complete label, for example `01 / SPRING / AWAKENING`. The desktop label and Enter threshold occupy a deliberate lower-left editorial zone above the scene. CSS may visually minimize the full five-button list, but the list must remain keyboard accessible and cannot be clipped to unusable `1px` controls.

Mobile exposes the selected identity and `01–05` position without Hover. The entire deliberate swipe region is touch-operable while normal browser navigation, focus, and minimum target sizes remain intact.

World-specific material takeover remains the final homepage action before the existing route commits. It originates from the selected body's effect layer and may not degrade into a differently colored generic wipe.

## 10. Progressive loading and failure behavior

The opening phrase provides a genuine loading boundary, not an artificial delay:

1. Load the semantic shell immediately.
2. Preload the Core and five-body low LOD set while the first-session black-field introduction runs.
3. Reveal the Portal only when its minimum viable visual set is decoded and uploaded.
4. Load medium/high Core detail after the stable first frame.
5. Load a body's higher LOD and effect textures only when proximity, focus, or selection makes them useful.
6. Retain recently used assets for Back navigation without replaying the intro.

If a high LOD fails, retain the lower LOD and expose no broken-object flash. If the minimum GLTF set or WebGL fails, render responsive AVIF/WebP stills produced from the approved Blender scene and preserve the same semantic controls. Reduced motion disables continuous effect animation but does not force a visually inferior model tier.

## 11. Performance budgets

The implementation plan must validate both network and GPU budgets.

### Runtime scene ceilings

| Budget | Desktop High | Desktop Balanced | Mobile Lite |
|---|---:|---:|---:|
| Visible triangles | `<= 180k` | `<= 120k` | `<= 80k` |
| Draw calls | `<= 48` | `<= 38` | `<= 28` |
| Active material programs | `<= 14` | `<= 11` | `<= 8` |
| Simultaneous high-detail bodies | `1` | `1` | `0` |
| Max texture edge | `2048px` | `2048px` | `1024px` |

The semantic shell and opening remain within the existing critical-route JavaScript budgets. Deferred Portal assets are measured separately:

- mobile minimum viable Portal set: `<= 1.5 MB` compressed transfer;
- desktop minimum viable Portal set: `<= 3.5 MB` compressed transfer;
- selected high-detail body increment: `<= 1.25 MB`;
- no eager download of every high LOD or every 2K texture set.

Quality selection considers viewport, device memory when available, rendering performance, and current quality monitor state. It never upgrades during the same visit after a measured downgrade.

## 12. Visual development and approval gates

Screenshot regression is evidence only after the visual target is approved. It must never define the target by itself.

The rebuild proceeds through these gates:

1. **Art-direction frame:** render the complete desktop Portal composition from Blender at `1440×900` and a dedicated mobile composition at `390×844`. Confirm Core silhouette, balance, and all five body identities before integration.
2. **Material turntables:** review the Core and each body under the same neutral studio light, including silhouette, roughness, and material response.
3. **Realtime first frame:** integrate low/medium LODs and compare browser output with the approved renders before motion work.
4. **Motion and interaction:** approve drift, selection, labels, mobile swipe, and each material takeover in the live browser.
5. **Regression lock:** only after the live visual review passes, regenerate the six supported viewport baselines.

Each gate uses visible imagery. Unit tests may validate contracts and budgets, but cannot approve art direction.

## 13. Testing and observability

- Asset contract tests validate manifest shape, stable mesh/material slots, LOD coverage, hashes, triangle counts, and compressed texture formats.
- Scene tests validate quality-tier selection, one-high-detail-body loading, fallback behavior, selected state, reduced motion, and successor-safe cleanup.
- Interaction tests cover pointer, keyboard, touch swipe, double activation, Studio non-navigation, and return-state preservation.
- Browser tests cover first/repeat session intro, loading transitions, World entry, no-WebGL fallback, context loss, and all supported viewports.
- Visual QA records Core/body material reviews separately from layout screenshots.
- Development-only telemetry reports active LODs, triangles, draw calls, texture memory estimate, and frame-time tier without shipping a public debug panel.

The existing `THREE.Clock` deprecation warning is addressed during implementation so the rebuilt scene begins without known Three.js runtime warnings.

## 14. Acceptance criteria

The GLTF/PBR rebuild is complete only when:

1. The browser first frame matches the approved desktop and mobile art-direction renders closely enough that the Core silhouette, composition, material hierarchy, and body identities are unmistakably the same design.
2. The Core cannot be described as a planet, dark disc, or stack of visible primitives.
3. Each seasonal body is recognizable by geometry and surface response before its label or color is read.
4. All five bodies remain slowly alive in realtime without visible orbit diagrams or synchronized motion.
5. Labels and Enter controls are visibly placed, keyboard accessible, and do not depend on clipped hidden controls.
6. Studio is selectable and perceptible but never activatable.
7. Desktop, tablet, narrow mobile, and landscape mobile retain deliberate compositions and meet their quality budgets.
8. Low LOD, high LOD, reduced-motion, no-WebGL, context-loss, and failed-asset paths preserve the complete browsing route.
9. Existing World and commerce pages remain outside the change except for shared contracts strictly required by the homepage loader.
10. Visual baselines are updated only after explicit live-browser visual approval.

## 15. Confirmed and open decisions

### Confirmed

- Use custom original GLTF/PBR assets as the long-term visual foundation.
- Combine them with isolated procedural effects and R3F realtime orchestration.
- Preserve the approved Homepage V2 identity, World order, route boundary, opening phrase, Studio behavior, and mobile swipe model.
- Use staged visual approval before motion and before screenshot baselines.

### Open within execution, not identity

- Exact Core sculptural topology and the final relative crop are resolved through the art-direction frame review.
- Exact texture authoring tools may be chosen during implementation; Blender is the canonical geometry/source scene.
- Exact Meshopt/KTX2 command configuration is selected after representative asset measurements while retaining the budgets above.

No other identity, route, copy, or World-page decision is reopened by this specification.
