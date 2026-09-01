# Task 2 Report — Portal contract and semantic controls

## Status

Complete.

## Delivered

- Added the typed Portal contract with fixed order, exact V2 labels/materials, seasonal `WorldId` handoff, and non-navigable Studio body.
- Added clamped horizontal swipe destination logic using the required `16%` / `48px` threshold.
- Reworked semantic portal controls so all five bodies are selectable by pointer, hover, focus, keyboard, and touch swipe; only seasonal selections render `ENTER`.
- Added the contextual identity output and mobile `01–05` position output, plus the requested mobile vertical-pan and `1050ms cubic-bezier(.22, .72, .18, 1)` settle treatment.
- Limited the Home header to EROS and MENU while retaining Search and Bag on every non-home route.
- Updated the existing bag-count assertion to run on a non-home route, matching the new Home header contract.

## Scope verification

- No `src/features/worlds/` file changed.
- No routes, Studio page, Archive, Product, Search, Bag, or World Gate implementation changed.
- Studio / Unknown remains selectable and has no entry action or route handoff.

## Tests

- TDD red: `portalModel.test.ts` initially failed because `portalModel.ts` did not exist.
- TDD red: semantic/header tests initially failed against the V1 labels, Studio entry behavior, and Home Search/Bag links.
- Final: `pnpm test` — 39 test files and 215 tests passed.
- Final: `pnpm build` — TypeScript and production build passed.

## Review note

The Portal position output intentionally follows the supplied `<output aria-label="Portal position">` contract. The local accessibility test addresses it by label because Testing Library does not expose a name for an `output` through a `status` role in this environment.
