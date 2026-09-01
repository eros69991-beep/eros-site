# EROS Homepage V2 — Design Specification

**Date:** 2026-09-01

**Status:** Confirmed design captured; awaiting review of this written specification

**Design process:** Continuation of the approved EROS Homepage V2 direction

**Implementation gate:** No implementation work may begin until the user reviews and approves this document. After approval, implementation planning is the next step.

## 1. Authority and supersession

This specification defines the approved V2 design for the EROS homepage at `/` only. It replaces the homepage-specific direction in `2026-08-15-eros-studio-design.md` where the two documents differ, including the opening sequence, EROS Core composition, celestial selection behavior, mobile browsing model, and the homepage behavior of Studio.

This is a deliberately narrow supersession. Every route and surface outside the homepage remains governed by the existing project and its approved specifications.

The homepage is an entrance layer, referred to here as the **Portal Layer**. Its responsibility ends when its material transition completes and navigation hands off to an existing seasonal detail route.

## 2. Locked scope

### Included

- The full homepage experience at `/`.
- A session-scoped black-field opening sequence.
- The EROS Core and five visible celestial bodies.
- Desktop pointer, hover, focus, selection, and activation behavior within the Portal Layer.
- A separately composed mobile swipe experience.
- A World-specific material takeover before navigation to an existing seasonal detail page.
- Studio / Unknown as a visible but non-navigable fifth body.

### Excluded

- Any modification to Spring, Summer, Autumn, or Winter detail-page layout, content, styling, components, media, motion, or internal interaction.
- Any redesign of Archive, Product, Search, Bag, World Gate / Menu, or other non-home routes.
- Any new Studio detail page, temporary Studio page, or homepage navigation to Studio.
- Product, commerce, content-model, CMS, hosting, or deployment changes.
- Implementation work of any kind during the specification phase.

### Route boundary

The four navigable bodies hand off only to the routes that already exist:

| No. | Homepage body | Existing destination |
|---:|---|---|
| 01 | `SPRING / AWAKENING` | `/world/spring` |
| 02 | `SUMMER / BURN` | `/world/summer` |
| 03 | `AUTUMN / FADE` | `/world/autumn` |
| 04 | `WINTER / FREEZE` | `/world/winter` |
| 05 | `STUDIO / UNKNOWN` | No destination; inactive |

The material takeover belongs to the homepage. Once it covers the frame and the route changes, the existing destination page takes control without being restructured or visually “harmonized” with Homepage V2.

The existing `/studio` route remains unchanged and outside this specification. Homepage V2 must not link its Studio / Unknown body to that route.

## 3. Experience objective

The homepage must feel like entering an unknown space belonging to a fashion brand, not like opening a conventional portfolio, ecommerce homepage, or Three.js solar-system demonstration.

The governing impression is:

> **An elegant sculptural universe with a small, controlled amount of material strangeness.**

Atmosphere, scale, material response, and restraint carry the experience. Explanatory copy, obvious orbit diagrams, interface panels, cards, and spectacle for its own sake do not.

## 4. Experience state model

```text
First visit in browsing session
  → Black field
  → “NOTHING STAYS EXPECTED.”
  → Phrase departs
  → EROS Core emerges
  → Interactive Portal Layer

Repeat visit in the same browsing session
  → Interactive Portal Layer

Interactive Portal Layer
  → Explore or select one of five bodies
  → Activate Spring / Summer / Autumn / Winter
  → World-specific material takeover
  → Existing seasonal detail route

Interactive Portal Layer
  → Select Studio / Unknown
  → Full selection feedback, no activation or navigation
```

A **browsing session** means the lifetime of one top-level browser tab or window, including reloads and in-app Back/Forward navigation. Opening a new tab or window starts a new session. The implementation mechanism may be chosen later, but it must reproduce this behavior.

## 5. Opening sequence

### First visit

The complete opening lasts approximately `4–5 seconds`:

1. Begin with a pure black frame.
2. Present the exact line `NOTHING STAYS EXPECTED.`
3. Let the line recede completely.
4. Reveal the giant EROS Core from darkness.
5. Resolve into the fully interactive Portal Layer.

The sequence is a single atmospheric arrival. It plays once per browsing session.

### Repeat visit

Reloading, returning Home, or navigating Back to Home in the same browsing session must not replay the full opening. The visitor returns directly to the resolved Portal Layer.

## 6. Spatial composition

### Desktop

- The EROS Core is not fixed at the geometric center.
- It enters the frame at monumental scale from the right or upper-right edge, with part of its form allowed to remain outside the viewport.
- Large areas of black negative space must remain available.
- The five celestial bodies occupy different apparent depths and must not form a balanced ring or evenly distributed diagram.
- Do not draw prominent orbital paths. Any spatial relationship must be perceived through scale, depth, movement, and material response rather than a visible astronomy diagram.
- The overall frame remains asymmetrical, editorial, and controlled.

### Mobile

- Mobile is a distinct composition, not a scaled desktop canvas.
- The Core intrudes at very large scale and may remain partially outside the screen.
- Only one celestial body is visually dominant at a time.
- The visitor moves through the ordered sequence `Spring → Summer → Autumn → Winter → Studio` with horizontal swipes.
- A minimal `01–05` status indicator is the only persistent sequence control at the bottom.
- Do not use carousel cards, arrow controls, pagination dots, or spring-loaded snapping aesthetics.

## 7. EROS Core art direction

The EROS Core must not read as a familiar planet, literal monster, or generic sci-fi asset.

### Form

- Use an elegant, sculptural silhouette.
- Preserve a visual balance of approximately `85% beauty / 15% otherness`.
- Let the unfamiliar quality come from material ambiguity and restrained response, not grotesque anatomy or aggressive distortion.

### Material system

The Core combines:

- obsidian-like darkness;
- matte metal;
- limited translucent crystal;
- controlled liquid-surface behavior.

No single material should explain the entire form. The result must remain refined and difficult to classify.

### Relationship to input

Pointer movement produces very small changes in space, Core orientation, light, or nearby material response. The response must be local and restrained; it must not turn the entire scene into a pointer-driven parallax demonstration.

## 8. Celestial bodies

The five bodies share a spatial system but must remain materially distinct.

| No. | Body | Material identity | Functional state |
|---:|---|---|---|
| 01 | `SPRING / AWAKENING` | Moist, translucent crystal | Navigable |
| 02 | `SUMMER / BURN` | Ablated metal and dark internal heat | Navigable |
| 03 | `AUTUMN / FADE` | Oxidized, faded mineral | Navigable |
| 04 | `WINTER / FREEZE` | Milky ice-crystal mass interrupted by black fissures | Navigable |
| 05 | `STUDIO / UNKNOWN` | Near-light-absorbing unknown black matter | Visible and selectable, not navigable |

Seasonal color is environmental contamination, never the primary identifier. Material, reflection, opacity, erosion, fracture, temperature, and surface behavior must distinguish the bodies before saturated color does.

Studio / Unknown receives the same quality of hover, focus, and selected-state feedback as the four seasonal bodies. It must not expose an `ENTER` action, behave like a link, launch a material takeover, navigate to a route, or show `COMING SOON`.

## 9. Color and light

- The first viewport is approximately `90%` black, grey, and cold white.
- Seasonal hues appear only as slight local contamination around the relevant body or material response.
- Material recognition always takes priority over color coding.
- Avoid broad seasonal color fields, neon accents, rainbow separation, and colorful galaxy spectacle.
- Darkness must provide scale and negative space rather than merely functioning as a background fill.

## 10. Typography and visible copy

### Persistent interface

The resolved homepage keeps visible interface chrome to the minimum necessary:

- `EROS`
- `MENU`
- the `01–05` mobile state indicator
- contextual World information while a body is approached, focused, or selected

Do not place explanatory World-building paragraphs or conventional homepage marketing copy in the Portal Layer. `MENU` continues to invoke the existing navigation system; this specification does not redesign that system.

### Type roles

- Brand words and World names use a high-contrast serif role.
- Numbers, `MENU`, state labels, and supporting information use a calm sans-serif role.
- These roles apply to Homepage V2 only and do not authorize type changes inside the existing seasonal detail pages or other routes.

### Contextual labels

World information is primarily revealed through proximity, focus, or selection rather than displayed continuously. Whenever the contextual label is shown, use the complete three-part identity. Responsive layouts may reflow it but must not omit any part. For example:

```text
01 / SPRING / AWAKENING
```

The corresponding labels are:

```text
02 / SUMMER / BURN
03 / AUTUMN / FADE
04 / WINTER / FREEZE
05 / STUDIO / UNKNOWN
```

The opening phrase is fixed as `NOTHING STAYS EXPECTED.`. This specification does not introduce additional public-facing copy.

## 11. Desktop interaction

- Keep the conventional pointer visually understated. Do not introduce an oversized custom cursor or cursor spectacle.
- Let pointer movement produce slight spatial and material awareness in the Core and the nearby scene.
- A World name and its number/concept information appear only when the visitor approaches, focuses, or selects its body.
- Hover and keyboard focus must expose equivalent identity information.
- Activating a seasonal body locks that choice, suppresses competing World information, and begins its material takeover.
- Studio / Unknown supports focus and selection with a complete perceptual response, but it exposes no activation and has no route effect.

Interaction must remain immediate and legible even though the scene is atmospheric. Material response may enrich a state, but it must not be the only indication of selection or availability.

## 12. Mobile interaction and motion

- Exactly one body is emphasized at a time.
- Horizontal swiping advances or reverses through the fixed five-body order.
- Each change carries slight weightlessness and inertia over approximately `0.9–1.2 seconds`.
- The motion must settle without elastic bounce, spring physics, card snapping, or exaggerated overshoot.
- The bottom `01–05` state updates with the selected body.
- Selection information remains visible without Hover.
- Activating one of the first four bodies begins its material takeover.
- Studio / Unknown remains the fifth selectable state but exposes no navigation action.

The mobile design must preserve the Core's monumental intrusion and the scene's black negative space rather than filling the screen with interface controls.

## 13. World-entry material takeover

Activation does not cut directly to the destination. The selected World's material expands until it consumes the viewport:

| World | Takeover action |
|---|---|
| Spring | Growth propagates through the frame. |
| Summer | Heat and scorching consume the frame. |
| Autumn | Oxidation spreads across the frame. |
| Winter | Freezing seals the frame. |

The takeover must originate from the selected body's material identity. It is neither a generic route fade nor a shared color wipe with different tints.

Navigation occurs only after the takeover has visually covered the frame. At that moment the homepage's responsibility ends and the existing destination route appears. Homepage V2 must not require edits to the receiving page to complete the transition.

Studio / Unknown has no takeover and no route handoff.

## 14. Motion character

Across the Portal Layer:

- Favor slow spatial drift, slight weightlessness, local material response, and deliberate settling.
- Avoid bounce, elastic easing, fast orbit display, camera shake, particle spectacle, hard carousel snapping, and conspicuous UI animation.
- Motion must reinforce scale and material presence rather than demonstrate the rendering technology.
- The experience must remain elegant when idle; it must not demand constant movement to feel alive.

## 15. Acceptance criteria

Homepage V2 is faithful to this design when all of the following are true:

1. The first visit in a browsing session plays the black-field phrase-and-Core opening in approximately `4–5 seconds`; repeat visits in that session skip it.
2. The resolved homepage is dominated by black space and a monumental, off-center EROS Core entering from the right or upper-right.
3. Five bodies are visible across different depths without a prominent orbit diagram.
4. The four seasons are distinguishable by material before color.
5. Desktop reveals World identity through approach, focus, or selection and uses only restrained scene response.
6. Mobile presents one World at a time in the fixed five-body swipe order with a minimal `01–05` status and `0.9–1.2 second` weightless settling.
7. Seasonal activation uses the correct growth, scorching, oxidation, or freezing takeover before navigating to the existing route.
8. Studio / Unknown can be perceived and selected but cannot be activated, does not show `COMING SOON`, and does not navigate.
9. Persistent homepage chrome is limited to the confirmed minimal interface; no explanatory homepage copy or conventional card/carousel UI appears.
10. Spring, Summer, Autumn, and Winter detail pages remain byte-for-byte outside the implementation scope unless the user later authorizes a separate change.
11. No Archive, Product, Search, Bag, World Gate / Menu, Studio page, route structure, content model, commerce behavior, or deployment behavior is redesigned as part of Homepage V2.

## 16. Implementation handoff constraints

This document defines visual and behavioral intent, not implementation architecture. The later implementation plan may select component boundaries, scene techniques, state storage, transition orchestration, performance strategy, accessible semantic controls, fallback behavior, and test coverage only insofar as those choices reproduce this specification and preserve the locked scope.

The implementation plan must begin by inventorying the existing homepage and shared transition code. It must identify every file it expects to change and explicitly prove that no seasonal detail-page implementation file is included.

There are no unresolved design decisions inside the approved Homepage V2 scope. Any proposed change to identity, World order, labels, material direction, mobile navigation model, Studio availability, route boundary, or detail-page isolation requires a new user decision before implementation.
