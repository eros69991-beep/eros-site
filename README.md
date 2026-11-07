# EROS Studio V1

EROS Studio V1 is a frontend-only fashion-universe prototype. It combines semantic React editorial and commerce routes with R3F/Three.js atmosphere.

**Live demo:** [eros-site-nine.vercel.app](https://eros-site-nine.vercel.app)

## Prerequisites

- Node.js 24+
- pnpm 11+
- Chromium for Playwright: `pnpm exec playwright install chromium`

## Run and verify

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm test
pnpm budget:check
pnpm e2e
```

`pnpm e2e` starts a development server for the development-only scene test API and a production preview for production-boundary assertions. Run `pnpm build` first so the preview and budget checker use a fresh production build.

## Architecture

- `src/app`: router, document metadata, shell, and route-backed overlays.
- `src/scene`: fixed Scene Host, quality tiers, WebGL support, error boundaries, and postprocessing.
- `src/features/universe` and `src/features/worlds`: realtime celestial and seasonal atmosphere modules with matching semantic controls and content.
- `src/features/archive`, `search`, `product`, and `bag`: the functional browsing and local-Bag path.
- `src/domain` and `src/media`: typed World/Object fixtures and responsive demonstration-media metadata.

All product names, prices, imagery, and stories are explicitly demonstration prototypes. They do not represent released EROS products.

## Quality and fallbacks

High, Balanced, and Lite tiers cap DPR, draw calls, particles, and expensive passes. Every WebGL scene uses the postprocessing composer. Reduced Motion stops continuous scene motion while retaining navigation; no-WebGL and scene-error paths preserve the complete semantic site with static celestial visuals.

`pnpm budget:check` enforces the 3 MB desktop Home, 1.5 MB mobile Home, and 2 MB mobile World-entry transfer budgets against the Vite and media manifests.

## Prototype limits

The Bag persists locally in the browser. This V1 has no checkout, payment collection, inventory, orders, accounts, CMS, analytics, or backend. It is deployed as a static site on Vercel.

See [the QA checklist](docs/qa/eros-v1-checklist.md) for the repeatable browser coverage and recorded QA evidence.
