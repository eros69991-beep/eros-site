# EROS Studio V1 QA checklist

## Repeatable automated coverage

Run from a fresh production build:

```bash
pnpm build
pnpm budget:check
pnpm e2e
```

The Playwright projects cover 1440×900, 1280×800, 768×1024, 390×844, 360×800, and 844×390. `e2e/visual.spec.ts` freezes development scene time to `137.5` before realtime captures; this hook, and the scene-error hook, are asserted absent from the production preview.

| Surface or behavior | Automated evidence |
| --- | --- |
| Home → each World; rapid final intent | `e2e/navigation.spec.ts` |
| World → Object → size → Bag; Archive; Search Back; persistence | `e2e/commerce.spec.ts` |
| Keyboard Gate; Object Back focus and scroll restoration | `e2e/navigation.spec.ts` |
| Reduced Motion, no WebGL, scene error, production hook boundary | `e2e/fallbacks.spec.ts` |
| Serious/critical axe violations on primary routes, Gate, and static fallback | `e2e/accessibility.spec.ts` |
| Home, four World thresholds, Gate, Archive, Product, Bag, reduced-motion, static fallback screenshots | `e2e/visual.spec.ts` |

## Manual visual and interaction inventory

Check the actual running application at every configured viewport:

- Home: five semantic entrance controls; on touch layouts, select then enter.
- World Gate: open, Tab cycle, select destinations, Escape, and focus restoration.
- Seasonal routes: atmosphere, editorial image, prototype Objects, and next-World link.
- Archive filters, Search query and Back, Product size validation, Bag quantity/remove actions.
- Reduced Motion, no-WebGL static navigation, and scene-failure static continuation.

## Recorded evidence

### Latest complete verification — 2026-08-31

- `pnpm lint`: passed.
- `pnpm test`: 34 files / 205 tests passed.
- `pnpm build`: passed. Vite reported its existing `>500 kB` chunk advisory; it did not prevent a production build.
- `pnpm budget:check`: passed — Home `1,384,444` bytes; Spring `1,504,861`; Summer `1,452,449`; Autumn `1,541,880`; Winter `1,480,164`.
- `pnpm e2e`: 24/24 passed. This includes the functional, accessibility, fallback, six-viewport visual, and production-preview projects.
- The visual suite contains 66 named baselines (11 states × 6 viewports). Home was visually inspected at all six viewports; the desktop review also covered all four World thresholds, World Gate, reduced motion, and the static fallback.

| Check | Evidence / status |
| --- | --- |
| Browser screenshots | Stored by Playwright snapshot tests under `e2e/visual.spec.ts-snapshots/` after `pnpm e2e --update-snapshots`; inspect diffs before accepting a baseline. |
| Keyboard and touch | Covered by semantic controls, Gate keyboard test, and mobile visual projects. A final manual touch pass remains required on an actual touch device. |
| Draw calls, textures, renderer memory, active passes, FPS | The current V1 does not expose Three renderer telemetry to the test surface. Do not claim numerical measurements from this checklist. Active postprocessing passes are source-verifiable: ToneMapping, Bloom, Noise, Vignette, and tier-gated DepthOfField in `src/scene/PostProcessingStack.tsx`. Add development-only renderer instrumentation before using this prototype for a performance sign-off that requires those live metrics. |
| Build-byte budgets | `scripts/check-performance-budgets.mjs` reports exact byte totals and exceeds the process with a nonzero exit code. |

## Release gate

- [x] Run the complete final command sequence and retain its output.
- [x] Verify all named visual states at their configured viewport with the 66-image Playwright baseline suite; inspect the Home at all six viewports and the complete desktop state set.
- [ ] Perform the actual-touch-device pass.
- [ ] Record live renderer/FPS metrics if a release requires performance sign-off beyond the automated byte and configuration ceilings.
- [x] Confirm no checkout, data collection, account, CMS, or deployment work was added.
