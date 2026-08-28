import { execFile } from 'node:child_process'
import { cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import sharp from 'sharp'
import { afterEach, describe, expect, it } from 'vitest'

const execFileAsync = promisify(execFile)
const temporaryProjects: string[] = []
const sourceKeys = [
  'spring-editorial', 'spring-object-001', 'spring-object-002',
  'summer-editorial', 'summer-object-001', 'summer-object-002',
  'autumn-editorial', 'autumn-object-001', 'autumn-object-002',
  'winter-editorial', 'winter-object-001', 'winter-object-002',
]
const expectedVariantNames = sourceKeys.flatMap((key) => [640, 960, 1600].flatMap((width) => [
  `${key}-${width}.avif`,
  `${key}-${width}.webp`,
]))

afterEach(async () => {
  await Promise.all(temporaryProjects.splice(0).map((directory) => rm(directory, { force: true, recursive: true })))
})

describe('EROS demonstration media builder', () => {
  it('preserves unrelated files in an explicitly selected output directory', async () => {
    const projectRoot = resolve(process.cwd())
    const temporaryProject = await mkdtemp(join(projectRoot, '.tmp-demo-media-builder-'))
    temporaryProjects.push(temporaryProject)
    const outputDirectory = join(temporaryProject, 'isolated-output')
    const sourceDirectory = join(temporaryProject, 'work', 'demo-media-source')

    await Promise.all([
      mkdir(join(temporaryProject, 'scripts'), { recursive: true }),
      mkdir(sourceDirectory, { recursive: true }),
      mkdir(outputDirectory, { recursive: true }),
    ])
    await Promise.all([
      cp(join(projectRoot, 'scripts', 'build-demo-media.mjs'), join(temporaryProject, 'scripts', 'build-demo-media.mjs')),
      ...sourceKeys.map((key, index) => sharp({
        create: {
          width: 2,
          height: 3,
          channels: 3,
          background: { r: index * 13, g: index * 7, b: index * 3 },
        },
      }).png().toFile(join(sourceDirectory, `${key}.png`))),
      sharp({
        create: { width: 2, height: 3, channels: 3, background: { r: 40, g: 50, b: 60 } },
      }).avif().toFile(join(outputDirectory, 'unrelated-reference.avif')),
      sharp({
        create: { width: 2, height: 3, channels: 3, background: { r: 70, g: 80, b: 90 } },
      }).webp().toFile(join(outputDirectory, 'unrelated-reference.webp')),
      writeFile(join(outputDirectory, 'unrelated-data.json'), '{"preserve":true}\n'),
    ])

    await execFileAsync(process.execPath, ['scripts/build-demo-media.mjs', '--output-dir', outputDirectory], {
      cwd: temporaryProject,
    })

    expect(existsSync(outputDirectory)).toBe(true)
    const outputEntries = await readdir(outputDirectory)
    expect(expectedVariantNames.every((name) => outputEntries.includes(name))).toBe(true)
    expect(existsSync(join(outputDirectory, 'unrelated-reference.avif'))).toBe(true)
    expect(existsSync(join(outputDirectory, 'unrelated-reference.webp'))).toBe(true)
    expect(existsSync(join(outputDirectory, 'unrelated-data.json'))).toBe(true)
    expect(existsSync(join(temporaryProject, 'public', 'media', 'demo'))).toBe(false)
  }, 180_000)

  it('refuses to overwrite an unrelated manifest in an explicitly selected output directory', async () => {
    const projectRoot = resolve(process.cwd())
    const temporaryProject = await mkdtemp(join(projectRoot, '.tmp-demo-media-builder-'))
    temporaryProjects.push(temporaryProject)
    const outputDirectory = join(temporaryProject, 'isolated-output')
    const sourceDirectory = join(temporaryProject, 'work', 'demo-media-source')
    const unrelatedManifest = '{"owner":"another-tool"}\n'

    await Promise.all([
      mkdir(join(temporaryProject, 'scripts'), { recursive: true }),
      mkdir(sourceDirectory, { recursive: true }),
      mkdir(outputDirectory, { recursive: true }),
    ])
    await Promise.all([
      cp(join(projectRoot, 'scripts', 'build-demo-media.mjs'), join(temporaryProject, 'scripts', 'build-demo-media.mjs')),
      ...sourceKeys.map((key, index) => sharp({
        create: {
          width: 2,
          height: 3,
          channels: 3,
          background: { r: index * 13, g: index * 7, b: index * 3 },
        },
      }).png().toFile(join(sourceDirectory, `${key}.png`))),
      writeFile(join(outputDirectory, 'manifest.json'), unrelatedManifest),
    ])

    await expect(execFileAsync(process.execPath, ['scripts/build-demo-media.mjs', '--output-dir', outputDirectory], {
      cwd: temporaryProject,
    })).rejects.toMatchObject({ stderr: expect.stringContaining('Refusing to overwrite unrelated manifest') })

    await expect(readFile(join(outputDirectory, 'manifest.json'), 'utf8')).resolves.toBe(unrelatedManifest)
  }, 180_000)
})
