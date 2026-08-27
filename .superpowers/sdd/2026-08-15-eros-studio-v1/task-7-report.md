# Task 7 — Asset-aware World Entry transition state machine

## Summary

Implemented the isolated World Entry transition layer only. It supplies a reducer-backed Zustand store, dependency-injected controller/provider, and accessible recovery overlay. No SceneHost, media manifest, router, Universe, World Gate, or Archive integration was added; those remain Task 13 work.

## RED / GREEN evidence

1. `worldEntryMachine.test.ts` was created before its production module.
   - RED command: `pnpm test -- src/features/transitions/worldEntryMachine.test.ts`
   - Initial environmental result: Vitest could not start because `node` was absent from the inherited `PATH`.
   - Root-cause evidence: `/Users/eros/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node` existed, but its directory was not in `PATH`. No source/configuration change was made for this; verification commands use a one-command `PATH` prefix.
   - Verified RED command: `PATH="/Users/eros/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" pnpm test -- src/features/transitions/worldEntryMachine.test.ts`
   - RED result: `Failed to resolve import "./worldEntryMachine"` — the expected missing reducer/module reason.
   - GREEN result after minimal reducer implementation: 12 test files / 71 tests passing.

2. `useWorldEntry.test.tsx` was created before the provider/controller module.
   - RED command: `PATH="…/dependencies/node/bin:$PATH" pnpm test -- src/features/transitions/useWorldEntry.test.tsx`
   - RED result: `Failed to resolve import "./useWorldEntry"` — expected missing controller/provider.
   - GREEN result: 13 test files / 72 tests passing. The test uses controlled injected promises, not timers, and proves stale Spring completions do not commit after a Winter request.

3. `WorldEntryOverlay.test.tsx` was created before the overlay module.
   - RED command: `PATH="…/dependencies/node/bin:$PATH" pnpm test -- src/features/transitions/WorldEntryOverlay.test.tsx`
   - RED result: `Failed to resolve import "./WorldEntryOverlay"` — expected missing overlay.
   - GREEN result: 14 test files / 73 tests passing. It verifies selected World identity, polite live status, no percentage content, and both failure recovery choices.

4. Added a regression test for stale completion after `RESET`.
   - RED command: `PATH="…/dependencies/node/bin:$PATH" pnpm test -- src/features/transitions/useWorldEntry.test.tsx`
   - RED result: expected no route commit after first attempt resolved, received `["spring"]`; the controller reused request ID 1 after reset.
   - GREEN result: 14 test files / 74 tests passing after adding monotonically increasing module-local request IDs.

## Files

- `src/features/transitions/worldEntryMachine.ts` — explicit states/events/reducer and public transition interfaces.
- `src/features/transitions/worldEntryMachine.test.ts` — rapid final-intent reducer regression.
- `src/features/transitions/worldEntryStore.ts` — shared Zustand state plus its single `dispatch` action.
- `src/features/transitions/useWorldEntry.ts` — provider and readiness coordination through injected promises.
- `src/features/transitions/useWorldEntry.test.tsx` — controlled-promise coordination and reset stale-event regression tests.
- `src/features/transitions/WorldEntryOverlay.tsx` — semantic transition/recovery UI.
- `src/features/transitions/WorldEntryOverlay.test.tsx` — accessible failure/recovery behavior.
- `src/features/transitions/transitions.module.css` — overlay styling with no timing/progress presentation.

## Verification

Commands run after the final production change:

```text
PATH="…/dependencies/node/bin:$PATH" pnpm test
14 test files passed; 74 tests passed.

PATH="…/dependencies/node/bin:$PATH" pnpm lint
Exited 0 with no lint output.

PATH="…/dependencies/node/bin:$PATH" pnpm build
tsc -b && vite build exited 0; 615 modules transformed.

git diff --check
Exited 0.
```

## Self-review

- Stale readiness and failure events are reducer-guarded by both `world` and `requestId`.
- A monotonic request ID is retained across resets, so an old promise cannot match a new attempt for the same World.
- Promise callbacks test that their request is still active; no timers, intervals, forced dwell, fake asset delay, or percentage calculation exists.
- `alignTarget` and `preloadCriticalAssets` are started together and route commitment occurs only after both resolve. The caller owns the reduced-motion alignment behavior through `alignTarget`.
- The hook cleanup marks unmounted providers disposed so unresolved promises cannot dispatch or navigate after teardown.
- The overlay preserves World identity, exposes a `role="status"` / `aria-live="polite"` message, and exposes both required recovery choices after a failure.

## Concerns

- The existing Vite build emits its pre-existing large-chunk advisory for `PostProcessingStack`; the build succeeds and Task 7 does not alter scene bundling.
- The shell supplied to this worktree omits the bundled Node directory from `PATH`; all tests/build/lint were verified by explicitly prepending the already-installed runtime, with no repository changes for the environment.
