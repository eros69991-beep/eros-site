import { readFile, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export const DEFAULT_BUDGETS = {
  desktopHomeBytes: 3 * 1024 * 1024,
  mobileHomeBytes: 1.5 * 1024 * 1024,
  mobileWorldEntryBytes: 2 * 1024 * 1024,
  desktop: { dpr: 1.5, maxDrawCalls: 120, maxParticles: 4_000 },
  mobile: { dpr: 1.25, maxDrawCalls: 60, maxParticles: 1_200 },
}

const DEFAULT_SCENE_BUDGETS = {
  desktop: { dpr: 1.5, maxDrawCalls: 120, maxParticles: 4_000 },
  mobile: { dpr: 1.25, maxDrawCalls: 60, maxParticles: 1_200 },
}

function asManifest(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object.`)
  }
  return value
}

async function readJson(path) {
  return asManifest(JSON.parse(await readFile(path, 'utf8')), path)
}

function collectChunkFiles(manifest, entryKey) {
  const files = new Set()
  const visited = new Set()

  const visit = (key) => {
    if (visited.has(key)) return
    visited.add(key)
    const entry = manifest[key]
    if (!entry || typeof entry !== 'object') return
    if (typeof entry.file === 'string') files.add(entry.file)
    for (const child of [...(entry.imports ?? []), ...(entry.dynamicImports ?? [])]) {
      visit(child)
    }
  }

  visit(entryKey)
  return files
}

async function totalFiles(distDirectory, files) {
  const sizes = await Promise.all([...files].map(async (file) => {
    try {
      return (await stat(join(distDirectory, file))).size
    } catch {
      return 0
    }
  }))
  return sizes.reduce((total, bytes) => total + bytes, 0)
}

function findHomeEntry(manifest) {
  const explicit = Object.entries(manifest).find(([key, entry]) => (
    key === 'index.html' && entry && typeof entry === 'object' && entry.isEntry === true
  ))
  if (explicit) return explicit[0]
  return Object.entries(manifest).find(([, entry]) => entry && typeof entry === 'object' && entry.isEntry === true)?.[0]
}

function findWorldEntry(manifest, world) {
  const normalized = world.toLowerCase()
  return Object.entries(manifest).find(([key, entry]) => (
    key.toLowerCase().includes(normalized)
      && entry
      && typeof entry === 'object'
      && (entry.isEntry === true || entry.isDynamicEntry === true)
  ))?.[0]
}

function criticalMediaBytes(mediaManifest, routeGroup) {
  const assets = Array.isArray(mediaManifest.assets) ? mediaManifest.assets : []
  const selected = assets.filter((asset) => (
    asset
      && typeof asset === 'object'
      && asset.classification === 'critical'
      && asset.routeGroup === routeGroup
      && Number.isFinite(asset.bytes)
  ))
  const byKey = new Map()
  for (const asset of selected) {
    const current = byKey.get(asset.key)
    if (!current || asset.width > current.width) byKey.set(asset.key, asset)
  }
  return [...byKey.values()].reduce((total, asset) => total + asset.bytes, 0)
}

function verifySceneBudget(failures, label, actual, ceiling) {
  const fields = [
    ['dpr', 'DPR'],
    ['maxDrawCalls', 'draw calls'],
    ['maxParticles', 'particles'],
  ]
  for (const [field, name] of fields) {
    if (actual[field] > ceiling[field]) {
      failures.push(`${label} scene ${name} exceeded: ${actual[field]} > ${ceiling[field]}`)
    }
  }
}

/**
 * Checks the built JavaScript graph, the largest critical responsive media
 * candidate for each route group, and declared scene ceilings.
 */
export async function checkPerformanceBudgets({
  manifestPath,
  mediaManifestPath,
  distDirectory,
  budgets = DEFAULT_BUDGETS,
  sceneBudgets = DEFAULT_SCENE_BUDGETS,
} = {}) {
  const manifest = await readJson(manifestPath)
  const mediaManifest = await readJson(mediaManifestPath)
  const failures = []
  const homeEntry = findHomeEntry(manifest)
  if (!homeEntry) throw new Error('Vite manifest has no application entry.')

  const homeChunks = await totalFiles(distDirectory, collectChunkFiles(manifest, homeEntry))
  const homeMedia = criticalMediaBytes(mediaManifest, 'home')
  const homeBytes = homeChunks + homeMedia
  if (homeBytes > budgets.desktopHomeBytes) {
    failures.push(`Home desktop critical bytes exceeded: ${homeBytes} bytes > ${budgets.desktopHomeBytes} bytes`)
  }
  if (homeBytes > budgets.mobileHomeBytes) {
    failures.push(`Home mobile critical bytes exceeded: ${homeBytes} bytes > ${budgets.mobileHomeBytes} bytes`)
  }

  const worlds = ['spring', 'summer', 'autumn', 'winter']
  const worldResults = {}
  for (const world of worlds) {
    const entry = findWorldEntry(manifest, world)
    const chunkBytes = entry ? await totalFiles(distDirectory, collectChunkFiles(manifest, entry)) : 0
    const mediaBytes = criticalMediaBytes(mediaManifest, `world:${world}`)
    const bytes = chunkBytes + mediaBytes
    worldResults[world] = { bytes, chunkBytes, mediaBytes }
    if (bytes > budgets.mobileWorldEntryBytes) {
      failures.push(`World ${world} mobile entry bytes exceeded: ${bytes} bytes > ${budgets.mobileWorldEntryBytes} bytes`)
    }
  }

  verifySceneBudget(failures, 'Desktop', sceneBudgets.desktop, budgets.desktop)
  verifySceneBudget(failures, 'Mobile', sceneBudgets.mobile, budgets.mobile)

  return {
    failures,
    home: { bytes: homeBytes, chunkBytes: homeChunks, mediaBytes: homeMedia },
    worlds: worldResults,
  }
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const result = await checkPerformanceBudgets({
    manifestPath: join(root, 'dist', '.vite', 'manifest.json'),
    mediaManifestPath: join(root, 'public', 'media', 'demo', 'manifest.json'),
    distDirectory: join(root, 'dist'),
  })

  if (result.failures.length > 0) {
    process.stderr.write(`${result.failures.join('\n')}\n`)
    process.exitCode = 1
    return
  }

  process.stdout.write(`Performance budgets pass: Home ${result.home.bytes} bytes; ${Object.entries(result.worlds).map(([world, value]) => `${world} ${value.bytes} bytes`).join(', ')}.\n`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
