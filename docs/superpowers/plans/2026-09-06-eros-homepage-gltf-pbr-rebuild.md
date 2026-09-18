# EROS Homepage GLTF/PBR Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the low-fidelity primitive Homepage V2 scene with an original, art-directed GLTF/PBR EROS Core and five-body realtime Portal while preserving the approved routes, World pages, semantic controls, performance adaptation, and recovery paths.

**Architecture:** Blender 5.2.1 LTS is the canonical authoring and approval-render environment. Original Core/body geometry is exported as named, budgeted GLB LODs with Meshopt compression and KTX2 textures; a generated manifest drives progressive R3F loading. PBR assets establish form and material, isolated shader layers add only living phenomena, and semantic React remains responsible for labels, activation, accessibility, and fallback navigation.

**Tech Stack:** Blender 5.2.1 LTS, Python/bpy, glTF 2.0/GLB, Meshopt, KTX2/Basis Universal, @gltf-transform 4.5.0, React 19, TypeScript 6, React Three Fiber 9, Drei 10, Three.js 0.185, @react-three/postprocessing 3, Zustand 5, Vitest 4, Playwright 1.62, Sharp 0.35, Git LFS 3.8.

**Spec:** docs/superpowers/specs/2026-09-06-eros-homepage-gltf-pbr-rebuild-design.md

## Global Constraints

- Keep React + React Three Fiber + Three.js as hard runtime requirements.
- Keep @react-three/postprocessing active in every WebGL quality tier.
- Change the Homepage Portal Layer only; do not redesign Spring, Summer, Autumn, Winter, Archive, Product, Search, Bag, World Gate, or Studio route content.
- Preserve the exact opening phrase NOTHING STAYS EXPECTED.
- Preserve order Spring, Summer, Autumn, Winter, Studio and keep Studio selectable but non-navigable.
- Use original EROS geometry and textures; no recognizable stock planets, generic science-fiction assets, or single-image/video fake realtime scene.
- Preserve and audit the existing unstaged changes in CelestialBody.tsx, SemanticCelestialControls.tsx, and universe.module.css. Do not reset, checkout, or discard them.
- First body activation selects; desktop may activate an already selected seasonal body with a second click; visible ENTER remains available to pointer, keyboard, and touch users.
- No visible orbit diagram. The partially off-screen right-side Core is the common gravitational center; all five bodies share one inclined galactic plane with unique `180–360s` elliptical periods, radii, depths, and self-rotation phases. Selection damps the chosen body toward a stable interactive position before it eases back into the shared orbit.
- Reduced motion resolves to an intentionally composed static scene without lowering model quality solely because motion is reduced.
- Desktop High ceiling: 180k visible triangles, 48 draw calls, 14 material programs, one high-detail body, 2048px texture edge.
- Desktop Balanced ceiling: 120k visible triangles, 38 draw calls, 11 material programs, one high-detail body, 2048px texture edge.
- Mobile Lite ceiling: 80k visible triangles, 28 draw calls, 8 material programs, no high-detail body, 1024px texture edge.
- Deferred minimum Portal transfer ceiling: 1.5 MB mobile and 3.5 MB desktop; selected high-detail body increment ceiling: 1.25 MB.
- Do not regenerate visual baselines until the user approves both the Blender art frames and the integrated live-browser visuals.
- Do not publish, deploy, connect a domain, buy assets, or use paid texture/model services.

## File and Responsibility Map

### Toolchain and authoring

- .gitattributes — LFS rules for Blender sources, source textures, and approval renders.
- assets-source/homepage/README.md — source conventions, stable object/material names, and regeneration commands.
- assets-source/homepage/eros-homepage-master.blend — approved canonical source scene, tracked by LFS.
- assets-source/homepage/renders/approval/ — approved desktop/mobile frames and material turntables, tracked by LFS.
- tools/blender/homepage/geometry.py — deterministic Core/body sculptural geometry.
- tools/blender/homepage/materials.py — Blender PBR node graphs and bake targets.
- tools/blender/homepage/composition.py — desktop/mobile cameras, studio-light rig, and render settings.
- tools/blender/homepage/build_scene.py — builds and saves the canonical .blend scene.
- tools/blender/homepage/render_approval.py — renders named approval frames and turntables.
- tools/blender/homepage/export_runtime.py — exports named LOD collections and source GLBs.

### Build pipeline

- scripts/homepage-assets/run-blender.mjs — resolves the project-local Blender binary and runs source/render/export commands.
- scripts/homepage-assets/manifest-schema.mjs — manifest constants, validation, and required slot definitions.
- scripts/homepage-assets/build.mjs — optimizes exports, emits KTX2/GLB delivery assets, posters, and deterministic manifest.
- scripts/homepage-assets/validate.mjs — validates source slots, LODs, formats, hashes, byte ceilings, and triangle ceilings.
- scripts/homepage-assets.test.ts — isolated manifest/build/validation tests.
- public/assets/homepage/manifest.json — generated runtime asset inventory.
- public/assets/homepage/models/ — optimized GLBs.
- public/assets/homepage/basis/ — Three.js KTX2 transcoder files.
- public/assets/homepage/fallback/ — AVIF/WebP posters rendered from the approved scene.

### Runtime

- src/features/universe/assets/homepageAssetTypes.ts — typed runtime manifest contract.
- src/features/universe/assets/homepageAssetSelection.ts — pure quality/viewport/selection-to-LOD policy.
- src/features/universe/assets/homepageAssetSelection.test.ts — LOD and eager-loading tests.
- src/features/universe/assets/useHomepageModel.ts — GLTFLoader, Meshopt, KTX2, cache, and disposal boundary.
- src/features/universe/assets/HomepageAssetGate.tsx — minimum-set readiness and lower-LOD recovery.
- src/features/universe/assets/HomepageAssetGate.test.tsx — readiness/failure tests.
- src/features/universe/materials/portalMaterialRuntime.ts — pure effect uniforms and reduced-motion mapping.
- src/features/universe/materials/portalMaterialRuntime.test.ts — deterministic profile tests.
- src/features/universe/materials/CoreEffectLayers.tsx — liquid membrane, crystal response, and corona overlays.
- src/features/universe/materials/BodyEffectLayer.tsx — World-specific living material overlay.
- src/features/universe/PortalLighting.tsx — authored reflection environment and quality-tier light rig.
- src/features/universe/portalMotion.ts — deterministic anchor drift and rotation transforms.
- src/features/universe/portalMotion.test.ts — unique-period/static-reduced-motion tests.
- src/features/universe/PortalTakeover.tsx — selected World material takeover before route commit.
- src/features/universe/PortalTakeover.test.tsx — World identity and completion tests.

### Existing files changed

- src/features/universe/ErosCore.tsx — render Core GLTF and Core effect layers.
- src/features/universe/CelestialBody.tsx — render body LODs, selection, activation, and body effect layer.
- src/features/universe/UniverseScene.tsx — compose loading gate, lighting, motion, models, and takeover.
- src/features/universe/universeConfig.ts — approved anchor, camera, light, and quality constants.
- src/features/universe/universeConfig.test.ts — camera/anchor/quality contract.
- src/features/universe/SemanticCelestialControls.tsx — visible selected identity, ENTER, keyboard, and mobile swipe.
- src/features/universe/SemanticCelestialControls.test.tsx — selection and activation semantics.
- src/features/universe/universe.module.css — editorial label placement and responsive controls.
- src/features/home/HomePage.tsx — intro completion waits for the minimum visual set.
- src/features/home/HomePage.test.tsx — session intro and asset-readiness behavior.
- src/features/fallback/StaticUniverse.tsx — approved model-derived fallback posters with semantic controls.
- src/features/fallback/fallback.module.css — responsive poster treatment.
- src/features/transitions/homepageMaterialHandoff.ts — frame-progress-aware material takeover.
- src/features/transitions/homepageMaterialHandoff.test.ts — progress/completion/reduced-motion tests.
- src/scene/sceneClock.ts — migrate the production clock from deprecated THREE.Clock to THREE.Timer.
- src/scene/PostProcessingStack.tsx — quality-aware Portal finish.
- src/scene/PostProcessingStack.test.tsx — Portal effect profile tests.
- scripts/check-performance-budgets.mjs — include Portal manifest and measured scene ceilings.
- scripts/check-performance-budgets.test.ts — Portal asset budget failures.
- src/vite-env.d.ts — development-only scene metrics API.
- e2e/navigation.spec.ts — body selection/activation and Studio behavior.
- e2e/accessibility.spec.ts — visible focus, reduced motion, and semantic fallback.
- e2e/fallbacks.spec.ts — low-LOD, asset failure, no-WebGL, and context-loss recovery.
- e2e/visual.spec.ts — approved live Portal states only.
- docs/qa/eros-v1-checklist.md — GLTF/PBR visual, runtime, and budget evidence.

---

### Task 1: Pin the Authoring Toolchain and Asset Contract

**Files:**

- Create: .gitattributes
- Create: assets-source/homepage/README.md
- Create: scripts/homepage-assets/run-blender.mjs
- Create: scripts/homepage-assets/manifest-schema.mjs
- Create: scripts/homepage-assets.test.ts
- Modify: package.json
- Modify: pnpm-lock.yaml

**Interfaces:**

- Produces: HOMEPAGE_ASSET_IDS, HOMEPAGE_LODS, REQUIRED_MATERIAL_SLOTS, validateHomepageManifest(value), and runBlender(command, args).
- Consumes: Node.js 24 already configured for the workspace.

- [ ] **Step 1: Write the failing manifest-contract test**

~~~ts
import { describe, expect, it } from 'vitest'
import {
  HOMEPAGE_ASSET_IDS,
  HOMEPAGE_LODS,
  validateHomepageManifest,
} from './homepage-assets/manifest-schema.mjs'

describe('homepage asset manifest', () => {
  it('requires six original assets at all three LODs', () => {
    expect(HOMEPAGE_ASSET_IDS).toEqual([
      'core', 'spring', 'summer', 'autumn', 'winter', 'studio',
    ])
    expect(HOMEPAGE_LODS).toEqual(['low', 'medium', 'high'])
    expect(() => validateHomepageManifest({ schemaVersion: 1, assets: {} }))
      .toThrow(/missing core low/i)
  })
})
~~~

- [ ] **Step 2: Run the focused test and verify RED**

Run: pnpm test -- scripts/homepage-assets.test.ts

Expected: FAIL because scripts/homepage-assets/manifest-schema.mjs does not exist.

- [ ] **Step 3: Install project-local toolchain dependencies**

Add exact Node dependencies:

~~~bash
pnpm add -D @gltf-transform/cli@4.5.0 @gltf-transform/core@4.5.0 @gltf-transform/extensions@4.5.0 @gltf-transform/functions@4.5.0
~~~

Download Blender 5.2.1 LTS Apple Silicon into ignored work/toolchain, verify SHA-256
6409e21de80994db5f4c4a34486b6fd43cea21085b912f7491c53e923acb65a3,
mount the DMG, and copy Blender.app into work/toolchain/Blender.app. Do not modify
/Applications.

Download Git LFS 3.8.0 Apple Silicon from the official git-lfs release into
work/toolchain, verify SHA-256
caff76a7d070d8160c89bc39b6e85d98f24135b6fed038a3b4de2590d25102d8,
and run its binary with git lfs install --local.

Verification:

~~~bash
work/toolchain/Blender.app/Contents/MacOS/Blender --version
work/toolchain/git-lfs/git-lfs version
pnpm exec gltf-transform --version
~~~

Expected: Blender 5.2.1 LTS, git-lfs 3.8.0, and glTF Transform 4.5.0.

- [ ] **Step 4: Implement the manifest contract**

Use these exact identifiers and stable slots:

~~~js
export const HOMEPAGE_ASSET_IDS = [
  'core', 'spring', 'summer', 'autumn', 'winter', 'studio',
]
export const HOMEPAGE_LODS = ['low', 'medium', 'high']
export const REQUIRED_MATERIAL_SLOTS = {
  core: ['core_obsidian', 'core_matte_metal', 'core_liquid_mask', 'core_crystal', 'core_emissive_mask'],
  spring: ['spring_shell', 'spring_interior', 'spring_growth_mask'],
  summer: ['summer_metal', 'summer_heat_mask'],
  autumn: ['autumn_mineral', 'autumn_oxidation_mask'],
  winter: ['winter_ice', 'winter_fissure'],
  studio: ['studio_absorber', 'studio_rim_mask'],
}
~~~

validateHomepageManifest must reject missing IDs/LODs, mismatched assetId/role/lod
metadata, duplicate URLs, non-GLB models, non-KTX2 material texture entries,
absent required slots, incomplete finite bounding spheres, invalid SHA-256,
non-positive bytes/triangles, and values exceeding the spec ceilings. Responsive
fallback poster entries are separately restricted to AVIF/WebP.

- [ ] **Step 5: Add the project-local Blender runner and scripts**

run-blender.mjs resolves EROS_BLENDER_BIN first and otherwise uses:

~~~js
const defaultBinary = resolve(
  root,
  'work/toolchain/Blender.app/Contents/MacOS/Blender',
)
~~~

Add package scripts:

~~~json
{
  "homepage:source:build": "node scripts/homepage-assets/run-blender.mjs build",
  "homepage:source:render": "node scripts/homepage-assets/run-blender.mjs render",
  "homepage:source:export": "node scripts/homepage-assets/run-blender.mjs export",
  "homepage:assets:build": "node scripts/homepage-assets/build.mjs",
  "homepage:assets:validate": "node scripts/homepage-assets/validate.mjs"
}
~~~

- [ ] **Step 6: Configure LFS without touching existing history**

.gitattributes:

~~~gitattributes
assets-source/homepage/*.blend filter=lfs diff=lfs merge=lfs -text
assets-source/homepage/textures/** filter=lfs diff=lfs merge=lfs -text
assets-source/homepage/renders/approval/** filter=lfs diff=lfs merge=lfs -text
~~~

Do not run git lfs migrate. No pre-existing history is rewritten.

- [ ] **Step 7: Run tests and commit**

Run:

~~~bash
pnpm test -- scripts/homepage-assets.test.ts
pnpm lint
git diff --check
~~~

Expected: focused test and lint PASS; diff check emits no output.

Commit only Task 1 files:

~~~bash
git add .gitattributes assets-source/homepage/README.md scripts/homepage-assets package.json pnpm-lock.yaml scripts/homepage-assets.test.ts
git commit -m "build: add EROS homepage asset toolchain"
~~~

---

### Task 2: Author the Core, Five Silhouettes, and Approval Composition

**Files:**

- Create: tools/blender/homepage/geometry.py
- Create: tools/blender/homepage/composition.py
- Create: tools/blender/homepage/build_scene.py
- Create: tools/blender/homepage/render_approval.py
- Create: assets-source/homepage/eros-homepage-master.blend
- Create: assets-source/homepage/renders/approval/portal-desktop-1440x900.png
- Create: assets-source/homepage/renders/approval/portal-mobile-390x844.png
- Modify: scripts/homepage-assets.test.ts

**Interfaces:**

- Consumes: Blender binary and stable asset/material names from Task 1.
- Produces: canonical Blender collections SOURCE_CORE, SOURCE_SPRING, SOURCE_SUMMER, SOURCE_AUTUMN, SOURCE_WINTER, SOURCE_STUDIO; cameras CAMERA_DESKTOP and CAMERA_MOBILE.

- [ ] **Step 1: Add a failing source-scene audit test**

The Blender build script writes work/homepage-source-audit.json. Add:

~~~ts
it('contains original named source collections and both approval cameras', async () => {
  const audit = JSON.parse(await readFile('work/homepage-source-audit.json', 'utf8'))
  expect(audit.collections).toEqual(expect.arrayContaining([
    'SOURCE_CORE', 'SOURCE_SPRING', 'SOURCE_SUMMER',
    'SOURCE_AUTUMN', 'SOURCE_WINTER', 'SOURCE_STUDIO',
  ]))
  expect(audit.cameras).toEqual(['CAMERA_DESKTOP', 'CAMERA_MOBILE'])
  expect(audit.objects.SOURCE_CORE).toBeGreaterThan(3)
})
~~~

- [ ] **Step 2: Run the test and verify RED**

Run: pnpm test -- scripts/homepage-assets.test.ts

Expected: FAIL because the audit does not exist.

- [ ] **Step 3: Build deterministic sculptural geometry**

geometry.py exposes:

~~~py
def build_core(seed: int = 1701) -> bpy.types.Collection: ...
def build_spring(seed: int = 2101) -> bpy.types.Collection: ...
def build_summer(seed: int = 2203) -> bpy.types.Collection: ...
def build_autumn(seed: int = 2309) -> bpy.types.Collection: ...
def build_winter(seed: int = 2411) -> bpy.types.Collection: ...
def build_studio(seed: int = 2503) -> bpy.types.Collection: ...
~~~

Use deterministic mathutils.noise displacement, broad geological compression,
limited booleans, remesh, and hand-authored proportional transforms. The Core's
first read must be a near-spherical planetary mass with a strong curved limb and
terminator; its second read is an original EROS object with distinct metal strata,
liquid boundaries, and smoked-crystal faults. It must not become a stock planet,
perfect sphere, or biological body. Each body must differ at silhouette level
before any material is assigned. Apply transforms and recalculate normals before saving.

- [ ] **Step 4: Build the two approved compositions**

composition.py creates:

~~~py
CAMERA_PROFILES = {
    'desktop': {'resolution': (1440, 900), 'lens_mm': 54, 'core_crop': (0.28, 0.42)},
    'mobile': {'resolution': (390, 844), 'lens_mm': 62, 'dominant_body': 'spring'},
}
~~~

Desktop reproduces `homepage-v2-desktop-galactic-orbit-approved.png`: the Core
enters from the right/upper-right, deliberate black space remains dominant, and
five bodies occupy unique apparent depths within one soft graphite-silver galactic
plane. Mobile reproduces `homepage-v2-mobile-galactic-orbit-approved.png` with a
separate camera: the Core enters from the upper-right, Spring dominates the
lower-middle, four bodies remain quiet depth cues, and the bottom safe area is
reserved for the `01–05` semantic state row.

Use Cycles, AgX, 256 samples, denoising, transparent false, and a cold three-area
studio rig. Prefer Metal GPU when available and fall back to CPU without changing
the scene.

- [ ] **Step 5: Generate source, audit, and approval frames**

Run:

~~~bash
pnpm homepage:source:build
pnpm homepage:source:render -- --set portal
pnpm test -- scripts/homepage-assets.test.ts
~~~

Expected: the .blend file, audit JSON, desktop PNG, and mobile PNG exist; audit
test passes.

- [ ] **Step 6: Perform the first visual approval gate**

Open both PNG files at original resolution. Check:

- the Core reads first as a strange near-spherical planet and second as an EROS material object, never as a stock planet, biological form, flat disc, or visible primitive stack;
- its crop has enough surface information to justify monumental scale;
- all five body silhouettes differ without relying on hue;
- the desktop frame keeps strong black negative space;
- mobile is recomposed rather than scaled down.

STOP and show both images to the user. Do not proceed, export GLBs, or update
Playwright screenshots until the user explicitly approves or requests changes.
Iterate only geometry, cameras, and broad light at this gate.

- [ ] **Step 7: Commit the approved forms and composition**

After approval:

~~~bash
git add tools/blender/homepage/geometry.py tools/blender/homepage/composition.py tools/blender/homepage/build_scene.py tools/blender/homepage/render_approval.py assets-source/homepage/eros-homepage-master.blend assets-source/homepage/renders/approval/portal-desktop-1440x900.png assets-source/homepage/renders/approval/portal-mobile-390x844.png scripts/homepage-assets.test.ts
git commit -m "art: define EROS portal sculpture and composition"
~~~

---

### Task 3: Author and Approve the Six PBR Material Systems

**Files:**

- Create: tools/blender/homepage/materials.py
- Create: assets-source/homepage/textures/
- Create: assets-source/homepage/renders/approval/core-turntable.png
- Create: assets-source/homepage/renders/approval/spring-turntable.png
- Create: assets-source/homepage/renders/approval/summer-turntable.png
- Create: assets-source/homepage/renders/approval/autumn-turntable.png
- Create: assets-source/homepage/renders/approval/winter-turntable.png
- Create: assets-source/homepage/renders/approval/studio-turntable.png
- Modify: tools/blender/homepage/build_scene.py
- Modify: tools/blender/homepage/render_approval.py
- Modify: assets-source/homepage/eros-homepage-master.blend
- Modify: scripts/homepage-assets.test.ts

**Interfaces:**

- Consumes: approved geometry and stable slots.
- Produces: glTF-compatible Principled BSDF bases, packed PBR masks, and six approved neutral-light studies.

- [ ] **Step 1: Extend the audit test for exact material slots**

~~~ts
it('assigns every required stable material slot exactly once', async () => {
  const audit = JSON.parse(await readFile('work/homepage-source-audit.json', 'utf8'))
  for (const [asset, required] of Object.entries(REQUIRED_MATERIAL_SLOTS)) {
    expect(audit.materialSlots[asset].sort()).toEqual([...required].sort())
  }
})
~~~

- [ ] **Step 2: Run the test and verify RED**

Run: pnpm homepage:source:build && pnpm test -- scripts/homepage-assets.test.ts

Expected: FAIL with missing stable material slots.

- [ ] **Step 3: Implement glTF-compatible PBR bases**

materials.py exports:

~~~py
def build_core_materials() -> dict[str, bpy.types.Material]: ...
def build_body_materials(body_id: str) -> dict[str, bpy.types.Material]: ...
def configure_bake_targets(body_id: str, resolution: int) -> dict[str, bpy.types.Image]: ...
~~~

Use Principled BSDF for base materials and bake base color, tangent-space normal,
roughness, metalness, ambient occlusion, emissive mask, and effect masks. Pack
occlusion/roughness/metalness into one ORM texture. Do not bake the living effect
itself into the base color.

Required readings:

- Spring: moist translucent crystal over dense interior and pressure fractures.
- Summer: ablated metal, burned edges, dark internal heat; no flame.
- Autumn: eroded mineral strata, oxidized seams, controlled edge loss.
- Winter: milky depth and authored black fissures; no wireframe.
- Studio: light-absorbing body readable by silhouette and narrow rim.

- [ ] **Step 4: Render neutral-light material studies**

Render each asset at three-quarter angles in the same neutral studio rig. Each
PNG is a 2400x800 three-frame contact sheet showing front, three-quarter, and
rim-lit views.

Run:

~~~bash
pnpm homepage:source:build
pnpm homepage:source:render -- --set turntables
pnpm test -- scripts/homepage-assets.test.ts
~~~

- [ ] **Step 5: Perform the material approval gate**

Open all six turntables and compare them with
`homepage-v2-core-material-approved.png` and
`homepage-v2-five-world-materials-approved.png`. Reject any body that reads
mainly through color, any Core that becomes glossy slime, any Winter wireframe,
any Summer flame, or any Studio body that disappears against black.

STOP and show the six studies to the user. Iterate materials and medium-scale
geometry until explicitly approved. Do not export runtime assets before approval.

- [ ] **Step 6: Commit approved materials**

~~~bash
git add tools/blender/homepage/materials.py tools/blender/homepage/build_scene.py tools/blender/homepage/render_approval.py assets-source/homepage/eros-homepage-master.blend assets-source/homepage/textures assets-source/homepage/renders/approval scripts/homepage-assets.test.ts
git commit -m "art: author EROS portal PBR materials"
~~~

---

### Task 4: Export, Optimize, Validate, and Manifest Runtime Assets

**Files:**

- Create: tools/blender/homepage/export_runtime.py
- Create: scripts/homepage-assets/build.mjs
- Create: scripts/homepage-assets/validate.mjs
- Create: public/assets/homepage/manifest.json
- Create: public/assets/homepage/models/
- Create: public/assets/homepage/textures/
- Create: public/assets/homepage/basis/
- Create: public/assets/homepage/fallback/
- Modify: scripts/homepage-assets.test.ts

**Interfaces:**

- Consumes: approved .blend scene and Task 1 manifest validator.
- Produces: buildHomepageAssets(options), HomepageAssetManifest v1, and all URLs consumed by Task 5.

- [ ] **Step 1: Add a failing full-output test**

~~~ts
it('emits validated LODs, KTX2 textures, posters, and hashes', async () => {
  const manifest = await buildHomepageAssets({ sourceRoot, outputRoot })
  expect(() => validateHomepageManifest(manifest)).not.toThrow()
  expect(manifest.fallback.desktop.avif).toMatch(/\.avif$/)
  expect(manifest.fallback.mobile.webp).toMatch(/\.webp$/)
  expect(manifest.assets.core.low.sha256).toMatch(/^[a-f0-9]{64}$/)
  expect(manifest.assets.core.low.bounds.radius).toBeGreaterThan(0)
  expect(manifest.assets.winter.high.textures.orm).toMatch(/\.ktx2$/)
})
~~~

Use an isolated temporary source/output root. The test must never clear
public/assets/homepage.

- [ ] **Step 2: Run the test and verify RED**

Run: pnpm test -- scripts/homepage-assets.test.ts

Expected: FAIL because buildHomepageAssets is undefined.

- [ ] **Step 3: Export named LOD collections from Blender**

export_runtime.py duplicates approved source collections into temporary export
collections and applies deterministic decimation targets:

~~~py
TRIANGLE_TARGETS = {
    'core': {'high': 90000, 'medium': 60000, 'low': 32000},
    'spring': {'high': 34000, 'medium': 18000, 'low': 7000},
    'summer': {'high': 38000, 'medium': 20000, 'low': 7500},
    'autumn': {'high': 42000, 'medium': 22000, 'low': 8000},
    'winter': {'high': 36000, 'medium': 19000, 'low': 7500},
    'studio': {'high': 26000, 'medium': 14000, 'low': 5500},
}
~~~

Preserve material slots, UVs, normals, tangents, custom extras assetId/lod, and
Y-up conversion. Export binary GLB with applied modifiers and no cameras/lights.

- [ ] **Step 4: Build compressed delivery assets**

build.mjs must:

1. run Blender export into work/homepage-export;
2. run glTF Transform dedup, prune, weld, and meshopt at medium level;
3. encode normal/ORM textures with UASTC level 4 plus RDO and zstd 18;
4. encode base-color/emissive textures with ETC1S quality 255;
5. cap desktop texture edges at 2048 and mobile/low at 1024;
6. copy Three.js Basis transcoder files;
7. create AVIF/WebP fallback posters with Sharp from the approved frames;
8. hash final bytes and write a stable-key-order manifest without timestamps;
9. replace the target directory only after the complete temporary build validates.

- [ ] **Step 5: Validate real outputs**

Run:

~~~bash
pnpm homepage:source:export
pnpm homepage:assets:build
pnpm homepage:assets:validate
pnpm exec gltf-transform inspect public/assets/homepage/models/core-medium.glb
pnpm test -- scripts/homepage-assets.test.ts
~~~

Expected: all commands pass; no PNG/JPEG delivery texture exists; every GLB uses
Meshopt and KTX2; manifest byte and triangle ceilings pass.

- [ ] **Step 6: Commit deterministic runtime assets**

~~~bash
git add tools/blender/homepage/export_runtime.py scripts/homepage-assets public/assets/homepage package.json pnpm-lock.yaml
git commit -m "build: export optimized EROS portal assets"
~~~

---

### Task 5: Add Manifest-Driven Loading and LOD Selection

**Files:**

- Create: src/features/universe/assets/homepageAssetTypes.ts
- Create: src/features/universe/assets/homepageAssetSelection.ts
- Create: src/features/universe/assets/homepageAssetSelection.test.ts
- Create: src/features/universe/assets/useHomepageModel.ts
- Create: src/features/universe/assets/HomepageAssetGate.tsx
- Create: src/features/universe/assets/HomepageAssetGate.test.tsx
- Modify: src/features/home/HomePage.tsx
- Modify: src/features/home/HomePage.test.tsx

**Interfaces:**

- Produces: HomepageLod, HomepageAssetId, HomepageAssetManifest, selectHomepageLod(input), selectHomepageLods(input), getEagerAssetKeys(input), useHomepageModel(assetId, lod), and HomepageAssetGate.
- Consumes: public/assets/homepage/manifest.json and existing quality tier.

- [ ] **Step 1: Write failing pure selection tests**

~~~ts
expect(selectHomepageLod({
  assetId: 'core', quality: 'high', mobile: false, selected: true,
})).toBe('high')
expect(selectHomepageLod({
  assetId: 'winter', quality: 'lite', mobile: true, selected: true,
})).toBe('low')
expect(selectHomepageLod({
  assetId: 'autumn', quality: 'high', mobile: false, selected: false,
})).toBe('low')
expect(getEagerAssetKeys({ mobile: true })).toEqual([
  'core:low', 'spring:low', 'summer:low', 'autumn:low', 'winter:low', 'studio:low',
])
expect(selectHomepageLods({
  selected: 'winter', quality: 'high', mobile: false,
})).toMatchObject({
  core: 'high', spring: 'low', summer: 'low', autumn: 'low', winter: 'high', studio: 'low',
})
~~~

- [ ] **Step 2: Run selection tests and verify RED**

Run: pnpm test -- src/features/universe/assets/homepageAssetSelection.test.ts

Expected: FAIL because the selection module does not exist.

- [ ] **Step 3: Implement typed manifest and selection policy**

~~~ts
export type HomepageAssetId =
  | 'core' | 'spring' | 'summer' | 'autumn' | 'winter' | 'studio'
export type HomepageLod = 'low' | 'medium' | 'high'

export interface HomepageAssetRecord {
  assetId: HomepageAssetId
  role: 'core' | 'portal-body'
  lod: HomepageLod
  url: string
  bytes: number
  triangles: number
  materials: number
  materialSlots: string[]
  textures: {
    baseColor: string
    normal: string
    orm: string
    emissiveMask?: string
    effectMasks: string[]
  }
  bounds: {
    center: [number, number, number]
    radius: number
  }
  textureMaxEdge: number
  sha256: string
}
~~~

Desktop High selects Core high and the selected body high. Desktop Balanced
selects Core medium and the selected body medium. Mobile Lite selects low for
the Core and all five bodies so the declared 80k-triangle ceiling remains valid
for every selection. Every unselected desktop body remains low.
selectHomepageLods is the single whole-scene selector and must derive every
per-asset value through selectHomepageLod so the policy cannot drift.

- [ ] **Step 4: Implement the GLTF/KTX2 loader**

useHomepageModel uses GLTFLoader with:

~~~ts
loader.setMeshoptDecoder(MeshoptDecoder)
loader.setKTX2Loader(
  new KTX2Loader()
    .setTranscoderPath('/assets/homepage/basis/')
    .detectSupport(gl),
)
~~~

Cache by manifest hash plus asset/lod. Dispose cloned scene instances on unmount,
but do not dispose shared cached geometry or textures until the asset cache is
explicitly cleared after context loss. After decode, compare the loaded material
names and finite bounding sphere with the selected manifest record. A mismatch is
a recoverable asset failure handled by HomepageAssetGate, never a partial render.

- [ ] **Step 5: Gate the first Portal frame on minimum readiness**

HomepageAssetGate preloads six low LODs during the session intro and exposes:

~~~ts
interface HomepageAssetGateState {
  minimumReady: boolean
  failedAssets: HomepageAssetId[]
  retry(): void
  continueWithPosters(): void
}
~~~

HomePage ends the first-session intro only after both the fixed opening sequence
and minimumReady resolve. If loading is slower, retain the black field and expose
the existing polite loading status. Repeat visits skip the phrase but retain a
black readiness field until the low set is ready.

- [ ] **Step 6: Verify and commit**

Run:

~~~bash
pnpm test -- src/features/universe/assets src/features/home
pnpm lint
pnpm build
git diff --check
~~~

Commit:

~~~bash
git add src/features/universe/assets src/features/home/HomePage.tsx src/features/home/HomePage.test.tsx
git commit -m "feat: load EROS portal assets progressively"
~~~

---

### Task 6: Render the GLTF Core and Authored Reflection Rig

**Files:**

- Create: src/features/universe/PortalLighting.tsx
- Create: src/features/universe/materials/CoreEffectLayers.tsx
- Modify: src/features/universe/ErosCore.tsx
- Modify: src/features/universe/UniverseScene.tsx
- Modify: src/features/universe/universeConfig.ts
- Modify: src/features/universe/universeConfig.test.ts
- Modify: src/scene/PostProcessingStack.tsx
- Modify: src/scene/PostProcessingStack.test.tsx

**Interfaces:**

- Consumes: useHomepageModel('core', lod), named Core slots, and current quality.
- Produces: CORE_REQUIRED_SLOTS, getPortalLightingProfile(quality), ErosCore with PBR base plus separately quality-gated effect layers, and PortalLighting.

- [ ] **Step 1: Write failing Core contract tests**

~~~ts
expect(CORE_REQUIRED_SLOTS).toEqual([
  'core_obsidian', 'core_matte_metal', 'core_liquid_mask',
  'core_crystal', 'core_emissive_mask',
])
expect(getPortalLightingProfile('lite').environmentResolution).toBe(64)
expect(getPortalLightingProfile('high').environmentResolution).toBe(256)
~~~

- [ ] **Step 2: Run focused tests and verify RED**

Run: pnpm test -- src/features/universe/universeConfig.test.ts src/scene/PostProcessingStack.test.tsx

Expected: FAIL because Core slot and reflection profiles are absent.

- [ ] **Step 3: Replace the primitive Core**

ErosCore receives:

~~~ts
interface ErosCoreProps {
  lod: HomepageLod
  quality: 'high' | 'balanced' | 'lite'
  reducedMotion: boolean
  selectedBody: CelestialId
}
~~~

Render only named GLTF meshes. Preserve imported PBR materials for
core_obsidian/core_matte_metal, clone only materials whose opacity/emissive
uniforms must change, and mount CoreEffectLayers for liquid/crystal/corona.
Remove all fallback icosahedron/sphere/octahedron geometry from the WebGL path.

- [ ] **Step 4: Add the cold studio reflection rig**

PortalLighting uses Drei Environment with authored Lightformers, one broad cold
key, one edge source, and one selected-World contamination source. Environment
resolution is 256/128/64 for High/Balanced/Lite. Lock tone mapping/exposure in
universeConfig so screenshots are deterministic.

- [ ] **Step 5: Tune postprocessing by measured material response**

Keep ToneMapping, low selective Bloom, Noise, Vignette, and quality-gated DOF.
Do not raise Bloom to compensate for unreadable dark material. Add tests proving
Lite still mounts EffectComposer and omits only expensive DOF/transmission work.

- [ ] **Step 6: Verify and commit**

Run:

~~~bash
pnpm test -- src/features/universe src/scene/PostProcessingStack.test.tsx
pnpm lint
pnpm build
git diff --check
~~~

Commit:

~~~bash
git add src/features/universe/ErosCore.tsx src/features/universe/UniverseScene.tsx src/features/universe/PortalLighting.tsx src/features/universe/materials/CoreEffectLayers.tsx src/features/universe/universeConfig.ts src/features/universe/universeConfig.test.ts src/scene/PostProcessingStack.tsx src/scene/PostProcessingStack.test.tsx
git commit -m "feat: render the GLTF EROS Core"
~~~

---

### Task 7: Render Five Distinct Bodies and Approve the Realtime First Frame

**Files:**

- Create: src/features/universe/materials/BodyEffectLayer.tsx
- Create: src/features/universe/bodyRenderPlan.ts
- Create: src/features/universe/bodyRenderPlan.test.ts
- Modify: src/features/universe/CelestialBody.tsx
- Modify: src/features/universe/UniverseScene.tsx
- Modify: src/features/universe/assets/homepageAssetSelection.test.ts
- Modify: e2e/visual.spec.ts

**Interfaces:**

- Consumes: asset selection/loader, body material slots, selected body, and existing World entry controller.
- Produces: createBodyRenderPlan(input), BodyRenderPlan, and GLTF CelestialBody with low/medium/high handoff and no primitive fallback in WebGL.

- [ ] **Step 1: Write failing body LOD/slot tests**

~~~ts
const lods = selectHomepageLods({
  selected: 'winter', quality: 'high', mobile: false,
})
expect(
  (['spring', 'summer', 'autumn', 'winter', 'studio'] as const)
    .filter((body) => lods[body] === 'high'),
).toEqual(['winter'])

expect(createBodyRenderPlan({
  id: 'winter', selected: 'winter', lods,
})).toMatchObject({
  baseLod: 'low', requestedLod: 'high', effect: 'winter',
})
expect(createBodyRenderPlan({
  id: 'spring', selected: 'winter', lods,
})).toMatchObject({
  baseLod: 'low', requestedLod: 'low', effect: null,
})
~~~

- [ ] **Step 2: Run focused tests and verify RED**

Run: pnpm test -- src/features/universe/assets/homepageAssetSelection.test.ts src/features/universe/bodyRenderPlan.test.ts

Expected: FAIL because bodyRenderPlan.ts does not yet exist.

- [ ] **Step 3: Replace the shared icosahedron body**

CelestialBody loads the low LOD immediately and the selected LOD on demand.
Keep the low model visible until the selected model is decoded; crossfade for
250ms without changing world position or scale. Use imported PBR materials and
mount BodyEffectLayer only for selected/proximate bodies. Winter fissures come
from winter_fissure geometry/mask; delete the wireframe overlay.

bodyRenderPlan.ts owns the pure low-to-selected LOD handoff and selected-effect
decision. CelestialBody receives only scenes already validated by useHomepageModel;
on a selected-LOD failure it retains the low LOD without a broken-object flash.

Studio uses studio_absorber and studio_rim_mask, remains raycastable, and never
calls enterWorld.

- [ ] **Step 4: Assemble the first realtime frame**

UniverseScene provides one selectedBody value to Core, bodies, lighting, and
effects. Verify first load defaults to Spring when no recent World exists while
preserving an existing recent World. At this stage keep all continuous effect
uniforms frozen at their approved reference value.

- [ ] **Step 5: Capture and inspect live frames without updating baselines**

Run the app and capture:

- 1440x900 desktop High;
- 390x844 mobile Lite;
- 1440x900 reduced motion.

Compare side by side with the approved Blender frames. Check silhouette, crop,
relative scale, material hierarchy, labels, and exposure. Playwright snapshots
remain untouched.

- [ ] **Step 6: Perform the realtime first-frame approval gate**

STOP and show desktop/mobile live frames beside their approved Blender renders.
Iterate loading/material/lighting/camera integration until the user explicitly
approves. Do not add motion or update visual baselines before approval.

- [ ] **Step 7: Commit the approved first frame**

~~~bash
git add src/features/universe/CelestialBody.tsx src/features/universe/UniverseScene.tsx src/features/universe/bodyRenderPlan.ts src/features/universe/bodyRenderPlan.test.ts src/features/universe/materials/BodyEffectLayer.tsx src/features/universe/assets/homepageAssetSelection.test.ts e2e/visual.spec.ts
git commit -m "feat: render five GLTF portal bodies"
~~~

---

### Task 8: Add Living Materials, Slow Spatial Motion, and Modern Scene Time

**Files:**

- Create: src/features/universe/materials/portalMaterialRuntime.ts
- Create: src/features/universe/materials/portalMaterialRuntime.test.ts
- Create: src/features/universe/portalMotion.ts
- Create: src/features/universe/portalMotion.test.ts
- Modify: src/features/universe/materials/CoreEffectLayers.tsx
- Modify: src/features/universe/materials/BodyEffectLayer.tsx
- Modify: src/features/universe/ErosCore.tsx
- Modify: src/features/universe/CelestialBody.tsx
- Modify: src/features/universe/UniverseScene.tsx
- Modify: src/scene/sceneClock.ts

**Interfaces:**

- Produces: PORTAL_MOTION_PROFILES, getPortalBodyTransform(id, time, selectionAmount, reducedMotion), getPortalMaterialRuntime(id, time, selectionAmount, reducedMotion), and Timer-backed getSceneTime().
- Consumes: approved anchors and existing development setSceneTime API.

- [ ] **Step 1: Write failing deterministic runtime tests**

~~~ts
expect(getPortalBodyTransform('spring', 137.5, 0, false))
  .toEqual(getPortalBodyTransform('spring', 137.5, 0, false))
expect(getPortalBodyTransform('spring', 0, 0, false))
  .not.toEqual(getPortalBodyTransform('spring', 120, 0, false))
expect(getPortalBodyTransform('winter', 0, 0, true))
  .toEqual(getPortalBodyTransform('winter', 120, 0, true))
expect(new Set(PORTAL_MOTION_PROFILES.map((profile) => profile.periodSeconds)).size)
  .toBe(5)
expect(getPortalBodyTransform('spring', 120, 1, false).orbitalVelocity)
  .toBeLessThan(getPortalBodyTransform('spring', 120, 0, false).orbitalVelocity)
~~~

Add material assertions for Spring internal migration, Summer retained heat,
Autumn particulate release, Winter near-still opacity, Studio rim response, and
zero time evolution in reduced motion.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

~~~bash
pnpm test -- src/features/universe/portalMotion.test.ts src/features/universe/materials/portalMaterialRuntime.test.ts
~~~

Expected: FAIL because both modules are absent.

- [ ] **Step 3: Implement the shared inclined galactic orbit**

Place the common gravitational center partly outside the viewport with the Core.
Use periods 181, 223, 269, 313, and 359 seconds for Spring through Studio. Each
body receives a distinct wide elliptical radius, depth, and phase in the same
inclined plane; near bodies show more screen displacement than distant bodies.
Selection smoothly damps orbital velocity and settles the chosen body without
snapping, then eases it back into the common orbit. Rotate the graphite-silver
galactic dust in the same direction at a slower rate. Add independent self-rotation.
Reduced motion returns the exact approved static composition and rotations.

- [ ] **Step 4: Implement isolated living effects**

Keep PBR bases static. Animate only overlay uniforms:

~~~ts
export interface PortalMaterialRuntime {
  time: number
  selection: number
  motionScale: number
  internalEnergy: number
  surfaceResponse: number
  particulateAmount: number
}
~~~

Core liquid drift and crystal response remain subtle. Spring migrates internally;
Summer heat decays/shimmers locally; Autumn releases sparse particles; Winter
settles almost completely; Studio changes rim visibility only.

- [ ] **Step 5: Replace deprecated THREE.Clock**

Use THREE.Timer while preserving getSceneTime(), freezeSceneTime(), and the
development setSceneTime(seconds) contract used by visual tests. Add a regression
test proving monotonic production time and exact frozen test time.

- [ ] **Step 6: Verify and commit**

Run:

~~~bash
pnpm test -- src/features/universe src/scene
pnpm lint
pnpm build
git diff --check
~~~

Expected: no THREE.Clock deprecation warning in a browser console smoke run.

Commit:

~~~bash
git add src/features/universe/materials src/features/universe/portalMotion.ts src/features/universe/portalMotion.test.ts src/features/universe/ErosCore.tsx src/features/universe/CelestialBody.tsx src/features/universe/UniverseScene.tsx src/scene/sceneClock.ts
git commit -m "feat: animate EROS portal materials and drift"
~~~

---

### Task 9: Restore Visible Semantic Controls and Mobile Interaction

**Files:**

- Modify: src/features/universe/CelestialBody.tsx
- Modify: src/features/universe/SemanticCelestialControls.tsx
- Modify: src/features/universe/SemanticCelestialControls.test.tsx
- Modify: src/features/universe/universe.module.css
- Modify: src/features/universe/portalModel.ts
- Modify: src/features/universe/portalModel.test.ts
- Modify: e2e/navigation.spec.ts
- Modify: e2e/accessibility.spec.ts

**Interfaces:**

- Consumes: selectedCelestial, useWorldEntry(), and body raycast callbacks.
- Produces: one shared selection/activation policy across 3D, pointer, keyboard, and touch.

- [ ] **Step 1: Preserve and characterize the existing unstaged diff**

Before editing, record:

~~~bash
git status --short
git diff -- src/features/universe/CelestialBody.tsx src/features/universe/SemanticCelestialControls.tsx src/features/universe/universe.module.css
~~~

Expected: the three known files remain modified. Do not restore them. Carry their
default Spring selection and selected-body activation intent into the tests below.

- [ ] **Step 2: Add failing semantic and browser-layout tests**

Unit test:

~~~ts
expect(screen.getByRole('status')).toHaveTextContent('01 / SPRING / AWAKENING')
expect(screen.getByRole('button', { name: 'ENTER' })).toBeVisible()
~~~

Browser test at 1440x900 and 390x844:

~~~ts
const identity = page.getByRole('status')
await expect(identity).toBeInViewport()
await expect(identity).toBeVisible()
await expect(page.getByRole('button', { name: 'ENTER' })).toBeVisible()
~~~

Also assert all five body buttons receive visible focus and Studio never exposes
ENTER.

- [ ] **Step 3: Run tests and verify RED**

Run:

~~~bash
pnpm test -- src/features/universe/SemanticCelestialControls.test.tsx src/features/universe/portalModel.test.ts
pnpm e2e -- --project=desktop-1440 --grep "Portal identity"
~~~

Expected: the browser test fails because duplicated celestialControls positioning
places the identity under the header and ENTER is clipped.

- [ ] **Step 4: Implement one explicit control layout**

Remove the duplicate position: relative override. Desktop fixes the semantic
control group in the lower-left editorial zone with a visible complete identity
and visible ENTER threshold. Keep the five-item selector visually restrained but
focusable with an on-screen focus treatment; do not clip actionable controls to
1x1 pixels.

Mobile presents selected identity, 01–05 status, and ENTER at rest. Use one
full-viewport swipe surface with pan-y preserved and the existing 16%/48px
threshold. Ignore the click following a successful swipe.

- [ ] **Step 5: Unify body activation**

First body click selects. A second click on an already-selected seasonal GLTF
body calls enterWorld(world, 'universe'). ENTER calls the same controller.
Studio selection never activates. Keyboard focus exposes the same identity and
ENTER path.

- [ ] **Step 6: Verify and commit, including the original three files**

Run:

~~~bash
pnpm test -- src/features/universe
pnpm e2e -- --project=desktop-1440 --project=mobile-390 --grep "Portal identity|Studio|body selection"
pnpm lint
git diff --check
~~~

Commit:

~~~bash
git add src/features/universe/CelestialBody.tsx src/features/universe/SemanticCelestialControls.tsx src/features/universe/SemanticCelestialControls.test.tsx src/features/universe/universe.module.css src/features/universe/portalModel.ts src/features/universe/portalModel.test.ts e2e/navigation.spec.ts e2e/accessibility.spec.ts
git commit -m "fix: restore EROS portal interaction affordances"
~~~

---

### Task 10: Connect Material Takeovers and Model-Derived Fallbacks

**Files:**

- Create: src/features/universe/PortalTakeover.tsx
- Create: src/features/universe/PortalTakeover.test.tsx
- Modify: src/features/transitions/homepageMaterialHandoff.ts
- Modify: src/features/transitions/homepageMaterialHandoff.test.ts
- Modify: src/features/universe/UniverseScene.tsx
- Modify: src/features/fallback/StaticUniverse.tsx
- Modify: src/features/fallback/fallback.module.css
- Modify: src/features/fallback/SceneFallback.test.tsx
- Modify: e2e/fallbacks.spec.ts
- Modify: e2e/navigation.spec.ts

**Interfaces:**

- Consumes: homepageMaterialHandoff World state, World effect profiles, and fallback poster URLs.
- Produces: getTakeoverProfile(world), getTakeoverProgress(elapsedMs, reducedMotion), takeover progress 0..1, and the complete signal consumed by the existing World entry machine.

- [ ] **Step 1: Write failing takeover profile tests**

~~~ts
expect(getTakeoverProfile('spring').effect).toBe('growth')
expect(getTakeoverProfile('summer').effect).toBe('scorch')
expect(getTakeoverProfile('autumn').effect).toBe('oxidation')
expect(getTakeoverProfile('winter').effect).toBe('freeze')
expect(getTakeoverProgress(450, false)).toBeCloseTo(0.5)
expect(getTakeoverProgress(0, true)).toBe(1)
~~~

Test that Studio has no takeover profile.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

~~~bash
pnpm test -- src/features/universe/PortalTakeover.test.tsx src/features/transitions/homepageMaterialHandoff.test.ts
~~~

Expected: FAIL because takeover progress and profile mapping are absent.

- [ ] **Step 3: Render four material-specific fullscreen effects**

PortalTakeover renders a camera-facing quad after body activation. Reuse the
selected body's authored masks and effect functions:

- Spring propagates pressure/growth from the selected body screen coordinate.
- Summer expands scorching and heat distortion from the selected body.
- Autumn spreads oxidation with dry edge breakup.
- Winter seals the frame with milky opacity and black structural fissures.

All finish at exactly 900ms and signal completion before route commit. Reduced
motion resolves to the completed material frame immediately while preserving
semantic status.

- [ ] **Step 4: Replace Homepage static primitives with approved posters**

StaticUniverse interactive Home mode uses:

~~~tsx
<picture aria-hidden="true">
  <source media="(max-width: 600px)" srcSet={fallback.mobile.avif} type="image/avif" />
  <source media="(max-width: 600px)" srcSet={fallback.mobile.webp} type="image/webp" />
  <source srcSet={fallback.desktop.avif} type="image/avif" />
  <img alt="" src={fallback.desktop.webp} />
</picture>
~~~

Keep SemanticCelestialControls above the poster. Non-home fallback remains
unchanged. Asset/GLTF failure falls back without losing the current route,
selection, or focus.

- [ ] **Step 5: Perform the motion and takeover approval gate**

In a visible browser, inspect idle drift, Hover/focus, selected emphasis, mobile
swipe, and all four takeovers. Inspect reduced motion and poster fallback.

STOP and obtain explicit user approval. Iterate motion/effect intensity only.
Do not update visual regression snapshots before approval.

- [ ] **Step 6: Verify and commit**

Run:

~~~bash
pnpm test -- src/features/universe/PortalTakeover.test.tsx src/features/transitions src/features/fallback
pnpm e2e -- --project=desktop-1440 --project=mobile-390 --grep "takeover|fallback|Studio"
pnpm lint
pnpm build
git diff --check
~~~

Commit:

~~~bash
git add src/features/universe/PortalTakeover.tsx src/features/universe/PortalTakeover.test.tsx src/features/universe/UniverseScene.tsx src/features/transitions/homepageMaterialHandoff.ts src/features/transitions/homepageMaterialHandoff.test.ts src/features/fallback/StaticUniverse.tsx src/features/fallback/fallback.module.css src/features/fallback/SceneFallback.test.tsx e2e/fallbacks.spec.ts e2e/navigation.spec.ts
git commit -m "feat: complete EROS material entry handoffs"
~~~

---

### Task 11: Enforce Runtime Metrics and Asset Budgets

**Files:**

- Create: src/features/universe/portalMetrics.ts
- Create: src/features/universe/portalMetrics.test.ts
- Modify: src/features/universe/UniverseScene.tsx
- Modify: src/scene/PostProcessingStack.tsx
- Modify: scripts/check-performance-budgets.mjs
- Modify: scripts/check-performance-budgets.test.ts
- Modify: src/vite-env.d.ts
- Modify: package.json

**Interfaces:**

- Produces: PortalSceneMetrics, validatePortalMetrics(metrics), collectPortalMetrics(renderer, manifest, activeLods), and development-only window.__EROS_TEST_API__.getPortalMetrics().
- Consumes: HomepageAssetManifest and WebGLRenderer.info.

- [ ] **Step 1: Write failing metric and budget tests**

~~~ts
expect(validatePortalMetrics({
  quality: 'lite',
  triangles: 80001,
  drawCalls: 29,
  materialPrograms: 9,
  maxTextureEdge: 2048,
})).toEqual(expect.arrayContaining([
  expect.stringMatching(/triangles exceeded/i),
  expect.stringMatching(/draw calls exceeded/i),
]))
~~~

Extend the synthetic budget fixture with a Homepage manifest whose mobile
minimum set is 1,500,001 bytes and assert an exact failure.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

~~~bash
pnpm test -- src/features/universe/portalMetrics.test.ts scripts/check-performance-budgets.test.ts
~~~

Expected: FAIL because Portal metrics and manifest budgets are not included.

- [ ] **Step 3: Collect development metrics**

Read renderer.info.render.calls, renderer.info.render.triangles, renderer.info.memory.textures,
active material programs, active LOD keys, and manifest texture edges. Expose the
snapshot only when import.meta.env.DEV or MODE is test. Do not ship a visible
debug panel or production API.

- [ ] **Step 4: Extend budget:check**

checkPerformanceBudgets receives homepageAssetManifestPath and reports:

- semantic-shell critical bytes using the existing Vite graph;
- mobile/desktop minimum Portal transfer bytes separately;
- selected high-detail increments;
- per-tier triangles, draw calls, programs, and texture-edge ceilings.

Never add deferred Portal bytes to the existing JavaScript critical-route value;
report both categories explicitly.

- [ ] **Step 5: Verify on High and Lite**

Run:

~~~bash
pnpm build
pnpm budget:check
pnpm test -- src/features/universe/portalMetrics.test.ts scripts/check-performance-budgets.test.ts
pnpm lint
git diff --check
~~~

Use the development metrics API in 1440x900 High and 390x844 Lite. If a budget
fails, reduce LOD or material/effect work; do not raise the ceilings.

- [ ] **Step 6: Commit**

~~~bash
git add src/features/universe/portalMetrics.ts src/features/universe/portalMetrics.test.ts src/features/universe/UniverseScene.tsx src/scene/PostProcessingStack.tsx scripts/check-performance-budgets.mjs scripts/check-performance-budgets.test.ts src/vite-env.d.ts package.json
git commit -m "perf: enforce EROS portal runtime budgets"
~~~

---

### Task 12: Lock Approved Visuals and Run Complete Regression QA

**Files:**

- Modify: e2e/visual.spec.ts
- Modify: e2e/visual.spec.ts-snapshots/home-*.png
- Modify: e2e/visual.spec.ts-snapshots/reduced-motion-*.png
- Modify: e2e/visual.spec.ts-snapshots/static-fallback-*.png
- Modify: e2e/navigation.spec.ts
- Modify: e2e/accessibility.spec.ts
- Modify: e2e/fallbacks.spec.ts
- Modify: docs/qa/eros-v1-checklist.md
- Modify: README.md

**Interfaces:**

- Consumes: all approved Task 1–11 behavior and metrics.
- Produces: final browser evidence and release-quality handoff.

- [ ] **Step 1: Freeze deterministic visual states**

For each moving Home screenshot:

~~~ts
await page.evaluate(() => window.__EROS_TEST_API__?.setSceneTime(137.5))
await expect(page.locator('canvas')).toBeVisible()
await expect(page.getByRole('status')).toContainText('01 / SPRING / AWAKENING')
~~~

Add selected Spring, Summer, Autumn, Winter, and Studio Home states. Keep masks
limited to browser-native scrollbar differences.

- [ ] **Step 2: Run functional E2E before snapshot changes**

Run:

~~~bash
pnpm e2e -- --project=desktop-1440 --project=mobile-390 --grep-invert "stable visual reference states"
~~~

Expected: navigation, material handoff, keyboard, swipe, Studio non-navigation,
asset fallback, no-WebGL, context-loss, and reduced-motion flows PASS.

- [ ] **Step 3: Reconfirm the live visual before locking**

Show the final live desktop and mobile Portal to the user. Confirm no visual
change has occurred since Task 10 approval. If anything changed, fix and repeat
the relevant focused tests.

Only after explicit approval, run:

~~~bash
pnpm e2e -- --grep "stable visual reference states" --update-snapshots
~~~

- [ ] **Step 4: Replay all six visual projects without update mode**

Run: pnpm e2e -- --grep "stable visual reference states"

Expected: 1440x900, 1280x800, 768x1024, 390x844, 360x800, and 844x390 all PASS
against the newly approved baselines.

- [ ] **Step 5: Run complete technical verification**

Run in this order:

~~~bash
pnpm test
pnpm lint
pnpm build
pnpm budget:check
pnpm e2e
git diff --check
git status --short
~~~

Expected:

- all Vitest files pass;
- ESLint exits zero;
- production build exits zero;
- critical and deferred Portal budgets pass;
- all Playwright projects pass;
- diff check emits no output;
- status contains only Task 12 files before staging.

- [ ] **Step 6: Inspect final evidence manually**

Inspect Home in every viewport, all five selection states, first and repeat
session entry, four takeovers, reduced motion, poster fallback, and at least one
measured High and Lite runtime metrics snapshot. Record exact results in
docs/qa/eros-v1-checklist.md. Do not mark actual-device touch or GPU telemetry
complete unless it was truly observed.

- [ ] **Step 7: Commit final approved evidence**

~~~bash
git add e2e README.md docs/qa/eros-v1-checklist.md
git diff --cached --check
git commit -m "test: approve EROS GLTF portal experience"
git status --short
~~~

Expected: commit succeeds and the worktree is clean.

## Implementation References

- Blender 5.2 LTS download and support lifecycle: https://www.blender.org/download/lts/
- Blender background rendering: https://docs.blender.org/manual/en/latest/advanced/command_line/render.html
- Blender glTF exporter API: https://docs.blender.org/api/main/bpy.ops.export_scene.html
- glTF Transform CLI and KTX2 examples: https://gltf-transform.dev/
- Git LFS installation and tracking: https://git-lfs.com/

## Plan Self-Review

- Spec coverage: Tasks 2–3 cover original forms and visual approval; Task 4 covers GLB/Meshopt/KTX2 and manifest; Tasks 5–7 cover loading, PBR, LOD, lighting, and realtime first frame; Tasks 8–10 cover motion, material effects, controls, takeover, and fallback; Task 11 covers network/GPU budgets; Task 12 covers all visual, accessibility, responsive, and regression gates.
- Resolution scan: no unresolved markers, vague deferred work, or unspecified error-handling steps remain.
- Type consistency: HomepageAssetId/HomepageLod originate in Task 5; manifest constants originate in Task 1; renderer components consume those exact types; takeover and metrics interfaces are introduced before final QA uses them.
- Scope check: all work is sequentially dependent on one Homepage asset/runtime system and retains existing non-Home route contracts, so a single plan is appropriate.
