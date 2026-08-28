import { execFile } from 'node:child_process'
import { cp, mkdtemp, mkdir, readdir, rm } from 'node:fs/promises'
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

afterEach(async () => {
  await Promise.all(temporaryProjects.splice(0).map((directory) => rm(directory, { force: true, recursive: true })))
})

describe('EROS demonstration media builder', () => {
  it('writes all variants to an explicitly selected output directory', async () => {
    const projectRoot = resolve(process.cwd())
    const temporaryProject = await mkdtemp(join(projectRoot, '.tmp-demo-media-builder-'))
    temporaryProjects.push(temporaryProject)
    const outputDirectory = join(temporaryProject, 'isolated-output')
    const sourceDirectory = join(temporaryProject, 'work', 'demo-media-source')

    await Promise.all([
      mkdir(join(temporaryProject, 'scripts'), { recursive: true }),
      mkdir(sourceDirectory, { recursive: true }),
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
    ])

    await execFileAsync(process.execPath, ['scripts/build-demo-media.mjs', '--output-dir', outputDirectory], {
      cwd: temporaryProject,
    })

    expect(existsSync(outputDirectory)).toBe(true)
    expect((await readdir(outputDirectory)).filter((entry) => /\.(avif|webp)$/.test(entry))).toHaveLength(72)
    expect(existsSync(join(temporaryProject, 'public', 'media', 'demo'))).toBe(false)
  }, 180_000)
})
