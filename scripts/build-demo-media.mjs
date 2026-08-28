import { access, mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import { constants } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import console from 'node:console'
import sharp from 'sharp'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDirectory, '..')
const sourceRoot = join(projectRoot, 'work', 'demo-media-source')
const outputDirectoryArgumentIndex = process.argv.indexOf('--output-dir')
const outputDirectoryArgument = outputDirectoryArgumentIndex === -1
  ? undefined
  : process.argv[outputDirectoryArgumentIndex + 1]
const outputRoot = outputDirectoryArgument
  ? resolve(projectRoot, outputDirectoryArgument)
  : join(projectRoot, 'public', 'media', 'demo')
const TypeScriptManifestPath = join(projectRoot, 'src', 'media', 'mediaManifest.ts')

const widths = [640, 960, 1600]
const formats = {
  avif: { quality: 55 },
  webp: { quality: 78 },
}
const criticalRouteBudgetBytes = 2 * 1024 * 1024

const mediaDefinitions = [
  { key: 'spring-editorial', routeGroup: 'world:spring', classification: 'critical', alt: 'Demonstration image: SPRING / AWAKENING editorial study with a wet mineral surface, condensation, and restrained cold-green traces.' },
  { key: 'spring-object-001', routeGroup: 'world:spring', classification: 'deferred', alt: 'Demonstration image: Mist Shell coated-cotton and mesh prototype object study.' },
  { key: 'spring-object-002', routeGroup: 'world:spring', classification: 'deferred', alt: 'Demonstration image: Dew Spine resin and stainless-steel prototype object study.' },
  { key: 'summer-editorial', routeGroup: 'world:summer', classification: 'critical', alt: 'Demonstration image: SUMMER / BURN editorial study with severe white light, dry air, and hard shadow.' },
  { key: 'summer-object-001', routeGroup: 'world:summer', classification: 'deferred', alt: 'Demonstration image: Noon Veil technical-nylon and mesh prototype object study.' },
  { key: 'summer-object-002', routeGroup: 'world:summer', classification: 'deferred', alt: 'Demonstration image: Heat Trace aluminum and elastomer prototype object study.' },
  { key: 'autumn-editorial', routeGroup: 'world:autumn', classification: 'critical', alt: 'Demonstration image: AUTUMN / FADE editorial study with an eroded dry surface, dust, and receding warmth.' },
  { key: 'autumn-object-001', routeGroup: 'world:autumn', classification: 'deferred', alt: 'Demonstration image: Erosion Layer waxed-cotton and recycled-wool prototype object study.' },
  { key: 'autumn-object-002', routeGroup: 'world:autumn', classification: 'deferred', alt: 'Demonstration image: Afterlight Strap leather and oxidized-brass prototype object study.' },
  { key: 'winter-editorial', routeGroup: 'world:winter', classification: 'critical', alt: 'Demonstration image: WINTER / FREEZE editorial study with a cold grey field, remote fog, and sparse frost.' },
  { key: 'winter-object-001', routeGroup: 'world:winter', classification: 'deferred', alt: 'Demonstration image: Still Field wool and technical-nylon prototype object study.' },
  { key: 'winter-object-002', routeGroup: 'world:winter', classification: 'deferred', alt: 'Demonstration image: Cold Signal coated-cable and stainless-steel prototype object study.' },
]

const sourcePathFor = (key) => join(sourceRoot, `${key}.png`)
const outputNameFor = (key, width, format) => `${key}-${width}.${format}`
const generatedOutputNames = new Set(mediaDefinitions.flatMap(({ key }) => (
  widths.flatMap((width) => Object.keys(formats).map((format) => outputNameFor(key, width, format)))
)))
const manifestName = 'manifest.json'

const isGeneratedManifest = (manifest) => {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return false
  if (manifest.version !== 1 || manifest.generator !== 'scripts/build-demo-media.mjs') return false
  if (JSON.stringify(manifest.widths) !== JSON.stringify(widths) || !Array.isArray(manifest.assets)) return false

  const outputNames = manifest.assets.map((asset) => {
    if (!asset || typeof asset !== 'object' || typeof asset.src !== 'string') return ''
    return asset.src.startsWith('/media/demo/') ? asset.src.slice('/media/demo/'.length) : ''
  })

  return outputNames.length === generatedOutputNames.size
    && new Set(outputNames).size === generatedOutputNames.size
    && outputNames.every((name) => generatedOutputNames.has(name))
}

const hasGeneratedManifest = async (manifestPath) => {
  try {
    return isGeneratedManifest(JSON.parse(await readFile(manifestPath, 'utf8')))
  } catch {
    return false
  }
}

const ensureSourcesExist = async () => {
  const missing = []
  for (const { key } of mediaDefinitions) {
    try {
      await access(sourcePathFor(key), constants.R_OK)
    } catch {
      missing.push(relative(projectRoot, sourcePathFor(key)))
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing demonstration media source(s):\n${missing.join('\n')}`)
  }
}

const clearGeneratedOutputs = async () => {
  await mkdir(outputRoot, { recursive: true })
  const entries = await readdir(outputRoot, { withFileTypes: true })
  const manifestEntry = entries.find((entry) => entry.name === manifestName)
  const manifestPath = join(outputRoot, manifestName)

  if (manifestEntry && (!manifestEntry.isFile() || !await hasGeneratedManifest(manifestPath))) {
    throw new Error(`Refusing to overwrite unrelated manifest: ${manifestPath}`)
  }

  for (const entry of entries) {
    if (!entry.isFile()) continue
    if (generatedOutputNames.has(entry.name) || entry.name === manifestName) {
      await unlink(join(outputRoot, entry.name))
    }
  }
}

const encodeVariant = async ({ normalizedSource, key, width, format }) => {
  const outputName = outputNameFor(key, width, format)
  const outputPath = join(outputRoot, outputName)
  const pipeline = sharp(normalizedSource)
    .resize({ width, withoutEnlargement: false })

  if (format === 'avif') {
    pipeline.avif({ quality: formats.avif.quality, effort: 6, chromaSubsampling: '4:2:0' })
  } else {
    pipeline.webp({ quality: formats.webp.quality, effort: 6, smartSubsample: true })
  }

  await pipeline.toFile(outputPath)
  const [fileStats, metadata] = await Promise.all([stat(outputPath), sharp(outputPath).metadata()])
  const retainedMetadata = ['exif', 'icc', 'iptc', 'xmp'].filter((field) => metadata[field] !== undefined)
  if (retainedMetadata.length > 0) {
    throw new Error(`${outputName} retained metadata: ${retainedMetadata.join(', ')}`)
  }
  const hasExpectedFormat = format === 'avif'
    ? metadata.format === 'heif' && metadata.mediaType === 'image/avif'
    : metadata.format === format
  if (!metadata.width || !metadata.height || !hasExpectedFormat) {
    throw new Error(`${outputName} has invalid intrinsic media metadata`)
  }

  return {
    key,
    src: `/media/demo/${outputName}`,
    bytes: fileStats.size,
    width: metadata.width,
    height: metadata.height,
    format,
  }
}

const toTypeScriptManifest = (manifest) => {
  const keys = mediaDefinitions.map(({ key }) => `'${key}'`).join('\n  | ')
  const entries = Object.fromEntries(mediaDefinitions.map((definition) => {
    const variants = manifest.assets.filter((asset) => asset.key === definition.key)
    const sources = Object.fromEntries(Object.keys(formats).map((format) => [
      format,
      variants
        .filter((asset) => asset.format === format)
        .map(({ src, bytes, width, height }) => ({ src, bytes, width, height })),
    ]))
    const largest = sources.webp.at(-1)
    return [definition.key, {
      alt: definition.alt,
      width: largest.width,
      height: largest.height,
      routeGroup: definition.routeGroup,
      classification: definition.classification,
      sources,
    }]
  }))

  return `export type DemoMediaKey =\n  | ${keys}\n\nexport type DemoMediaFormat = 'avif' | 'webp'\nexport type DemoMediaClassification = 'critical' | 'deferred'\n\nexport interface DemoMediaSource {\n  src: string\n  bytes: number\n  width: number\n  height: number\n}\n\nexport interface DemoMedia {\n  alt: string\n  width: number\n  height: number\n  routeGroup: \`world:\${'spring' | 'summer' | 'autumn' | 'winter'}\`\n  classification: DemoMediaClassification\n  sources: Record<DemoMediaFormat, DemoMediaSource[]>\n}\n\nexport const mediaManifest = ${JSON.stringify(entries, null, 2)} as const satisfies Record<DemoMediaKey, DemoMedia>\n`
}

const build = async () => {
  if (outputDirectoryArgumentIndex !== -1 && (!outputDirectoryArgument || outputDirectoryArgument.startsWith('--'))) {
    throw new Error('The --output-dir option requires a directory path.')
  }

  await ensureSourcesExist()
  await clearGeneratedOutputs()

  const assets = []
  for (const definition of mediaDefinitions) {
    const source = await readFile(sourcePathFor(definition.key))
    const normalizedSource = await sharp(source).rotate().toBuffer()

    for (const format of Object.keys(formats)) {
      for (const width of widths) {
        const variant = await encodeVariant({ normalizedSource, key: definition.key, width, format })
        const budgetBytes = definition.classification === 'critical' ? criticalRouteBudgetBytes : null
        if (budgetBytes !== null && variant.bytes > budgetBytes) {
          throw new Error(`${variant.src} exceeds its ${budgetBytes}-byte critical-route budget with ${variant.bytes} bytes`)
        }
        assets.push({
          ...variant,
          routeGroup: definition.routeGroup,
          classification: definition.classification,
          budgetBytes,
        })
      }
    }
  }

  const manifest = {
    version: 1,
    generator: 'scripts/build-demo-media.mjs',
    widths,
    quality: Object.fromEntries(Object.entries(formats).map(([format, settings]) => [format, settings.quality])),
    criticalRouteBudgetBytes,
    assets,
  }

  await Promise.all([
    writeFile(join(outputRoot, manifestName), `${JSON.stringify(manifest, null, 2)}\n`),
    mkdir(dirname(TypeScriptManifestPath), { recursive: true }).then(() => writeFile(TypeScriptManifestPath, toTypeScriptManifest(manifest))),
  ])

  console.log(`Built ${assets.length} deterministic demonstration media variants from ${mediaDefinitions.length} sources.`)
}

await build().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
