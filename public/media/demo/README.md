# EROS demonstration media

These responsive AVIF and WebP files are generated prototype studies for the EROS Studio V1 frontend. They are demonstrations, not released products or availability claims.

Rebuild the directory with `pnpm media:build`. The build reads the twelve exact PNG sources in `work/demo-media-source/`, applies orientation, strips source metadata, and emits 640, 960, and 1600 pixel variants at AVIF quality 55 and WebP quality 78. Do not edit generated variants or `manifest.json` by hand.
