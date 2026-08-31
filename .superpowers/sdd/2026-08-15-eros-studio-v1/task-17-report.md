### Task 17 report: Responsive, typography, focus, and motion polish

Implemented the route-level interface system:

- Added Latin variable Instrument Sans and Newsreader font faces with `font-display: swap`, neutral/color/type/safe-area tokens, and tabular numerals.
- Added the route title hook with exact Home, World, Archive, Studio, Search, Bag, and Object titles plus unmount cleanup.
- Added the App Shell skip link and focusable `main` target; route tests cover one main, one H1, skip navigation, unique IDs, and 44px primary controls.
- Added global responsive foundations for 320px minimum layout, dynamic viewport height, safe areas, restrained focus treatment, short landscape placement, and reduced-motion transition/animation suppression. Editorial text links are not globally enlarged.

Verification completed:

- `pnpm test` — 33 files, 201 tests passed.
- `pnpm lint` — passed.
- `pnpm build` — passed. Vite reports an existing warning for a minified chunk over 500 kB.
- `git diff --check` — passed.

Browser smoke was attempted for the requested 1440×900, 390×844, 360×800, and 844×390 viewports. It could not run because this environment has no Chrome/Chromium executable and the Playwright CLI reports that Chrome is missing. No browser artifacts were retained.

Cleanup: moved `.tmp-demo-media-builder-PUavqH` to Trash.
