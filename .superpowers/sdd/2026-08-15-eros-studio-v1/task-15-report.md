# Task 15 report: Quiet Product Detail and persistent local Bag

Implemented the approved Product Detail and Bag surfaces.

- Product routes now render manifest-backed responsive primary, editorial, and detail media; Object facts; size selection; material and construction; design concept; validated Add to Bag; and a World return link.
- Sized Objects require a selected size, with an accessible validation announcement. Unknown Object slugs render `OBJECT UNAVAILABLE` and retain an Archive exit.
- Product routes preserve the active realtime composer while reducing the scene layer's visual intensity.
- Bag renders browser-local lines, quantity controls, removal, subtotal, empty state, persistence-failure notice, and the required unavailable-checkout statement. There is no personal-information collection or checkout form.
- Existing state behavior merges matching Object/size lines and preserves distinct sizes; the header already derives its item count from Bag quantities.

Verification completed:

- RED: `pnpm test -- src/features/product/ProductPage.test.tsx src/features/bag/BagPage.test.tsx` failed with the expected missing Product and Bag controls before implementation.
- GREEN: the same focused command passed: 30 files, 173 tests.
- Full: `pnpm test` passed: 30 files, 173 tests.
- `pnpm lint` passed.
- `pnpm build` passed. Vite reported only its existing advisory about chunks over 500 kB.
- `git diff --check` passed.

Browser smoke was not run because this worktree has no Playwright configuration or `e2e` suite.

## Follow-up: quiet Product postprocessing

Product routes now pass their quiet visual state through `RealtimeSceneLayer` into `PostProcessingStack`. The active composer and tone mapping remain mounted for all WebGL quality tiers while Product rendering halves Bloom intensity, Noise opacity, and Vignette darkness, and omits depth of field. Source World effect profiles are not mutated.

- RED: the new quiet Product effects test failed before implementation because Product effects matched the normal World profile.
- GREEN: `pnpm test -- src/scene/PostProcessingStack.test.tsx` passed: 30 files, 177 tests.
- `pnpm lint`, `pnpm build`, and `git diff --check` passed. The build emitted only the existing Vite chunk-size advisory.
