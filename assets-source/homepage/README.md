# EROS Homepage Source Assets

This directory contains canonical Blender source scenes, source textures, and
approval renders for the homepage GLTF/PBR pipeline. These source assets are
distinct from generated runtime assets under `public/assets/homepage/`.

Binary `.blend` files, source textures, and approval renders are tracked with
Git LFS according to the repository `.gitattributes` rules. Do not run `git lfs
migrate`; it would rewrite existing history.

## Project-local toolchain

The authoring tools live only under the ignored `work/toolchain/` directory:

- Blender 5.2.1 LTS Apple Silicon: `work/toolchain/Blender.app`.
  Source: `https://download.blender.org/release/Blender5.2/blender-5.2.1-macos-arm64.dmg`
  SHA-256: `6409e21de80994db5f4c4a34486b6fd43cea21085b912f7491c53e923acb65a3`.
- Git LFS 3.8.0 Apple Silicon: `work/toolchain/git-lfs/git-lfs`.
  Source: `https://github.com/git-lfs/git-lfs/releases/download/v3.8.0/git-lfs-darwin-arm64-v3.8.0.zip`
  SHA-256: `caff76a7d070d8160c89bc39b6e85d98f24135b6fed038a3b4de2590d25102d8`.
- KTX-Software 4.4.2 Apple Silicon: `work/toolchain/ktx/bin/toktx`.
  Source: `https://github.com/KhronosGroup/KTX-Software/releases/download/v4.4.2/KTX-Software-4.4.2-Darwin-arm64.pkg`
  SHA-256: `500bd8f9d63358c3f3a0d83b724c8574436a72c37dc0e4bad90ec1ca38032c3c`.
  The official package is signed by `Developer ID Installer: The Khronos Group,
  Inc. (TD2656HYNK)`, notarized by Apple, and is expanded project-locally into
  `work/toolchain/ktx`; the original signed `toktx` binary and its adjacent
  official `libktx` dynamic library are retained without modification.

No tool is installed into `/Applications` or any global path. `run-blender.mjs`
uses `EROS_BLENDER_BIN` when explicitly set; otherwise it resolves the
project-local Blender binary.

## Task 4 KTX2 encoder check

Task 4 must resolve and verify the local encoder before any KTX2 build:

```sh
KTX_TOKTX=work/toolchain/ktx/bin/toktx
test -x "$KTX_TOKTX"
"$KTX_TOKTX" --version
```

The asset build must fail rather than fall back to a globally installed or
unverified `toktx` binary.
