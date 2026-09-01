import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { checkPerformanceBudgets } from './check-performance-budgets.mjs'

const temporaryRoots: string[] = []

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'eros-budget-'))
  temporaryRoots.push(root)
  await mkdir(join(root, 'dist', '.vite'), { recursive: true })
  await mkdir(join(root, 'public', 'media', 'demo'), { recursive: true })

  await writeFile(join(root, 'dist', '.vite', 'manifest.json'), JSON.stringify({
    'index.html': { file: 'assets/home.js', isEntry: true, imports: ['assets/shared.js'] },
    'world-spring.html': { file: 'assets/spring.js', isEntry: true, imports: ['assets/shared.js'] },
    'assets/home.js': { file: 'assets/home.js' },
    'assets/spring.js': { file: 'assets/spring.js' },
    'assets/shared.js': { file: 'assets/shared.js' },
  }))
  await mkdir(join(root, 'dist', 'assets'), { recursive: true })
  await Promise.all([
    writeFile(join(root, 'dist', 'assets', 'home.js'), Buffer.alloc(1_000)),
    writeFile(join(root, 'dist', 'assets', 'spring.js'), Buffer.alloc(1_000)),
    writeFile(join(root, 'dist', 'assets', 'shared.js'), Buffer.alloc(1_000)),
  ])
  await writeFile(join(root, 'public', 'media', 'demo', 'manifest.json'), JSON.stringify({
    assets: [
      { key: 'home-core', bytes: 1_000, routeGroup: 'home', classification: 'critical' },
      { key: 'spring-entry', bytes: 1_000, routeGroup: 'world:spring', classification: 'critical' },
    ],
  }))

  return root
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { force: true, recursive: true })))
})

describe('checkPerformanceBudgets', () => {
  it('reports exact desktop, mobile, World-entry, and scene-budget failures without double counting shared chunks', async () => {
    const root = await createFixture()

    const result = await checkPerformanceBudgets({
      manifestPath: join(root, 'dist', '.vite', 'manifest.json'),
      mediaManifestPath: join(root, 'public', 'media', 'demo', 'manifest.json'),
      distDirectory: join(root, 'dist'),
      sceneBudgets: {
        desktop: { dpr: 1.6, maxDrawCalls: 121, maxParticles: 4_001 },
        mobile: { dpr: 1.3, maxDrawCalls: 61, maxParticles: 1_201 },
      },
      budgets: {
        desktopHomeBytes: 2_500,
        mobileHomeBytes: 2_500,
        mobileWorldEntryBytes: 1_500,
        desktop: { dpr: 1.5, maxDrawCalls: 120, maxParticles: 4_000 },
        mobile: { dpr: 1.25, maxDrawCalls: 60, maxParticles: 1_200 },
      },
    })

    expect(result.home.bytes).toBe(3_000)
    expect(result.failures).toEqual(expect.arrayContaining([
      'Home desktop critical bytes exceeded: 3000 bytes > 2500 bytes',
      'Home mobile critical bytes exceeded: 3000 bytes > 2500 bytes',
      'World spring mobile entry bytes exceeded: 3000 bytes > 1500 bytes',
      'Desktop scene DPR exceeded: 1.6 > 1.5',
      'Desktop scene draw calls exceeded: 121 > 120',
      'Desktop scene particles exceeded: 4001 > 4000',
      'Mobile scene DPR exceeded: 1.3 > 1.25',
      'Mobile scene draw calls exceeded: 61 > 60',
      'Mobile scene particles exceeded: 1201 > 1200',
    ]))
  })
})
