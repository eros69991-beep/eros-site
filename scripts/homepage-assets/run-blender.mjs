import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const defaultBinary = resolve(
  root,
  'work/toolchain/Blender.app/Contents/MacOS/Blender',
)

const sourceScripts = {
  build: resolve(root, 'tools/blender/homepage/build_scene.py'),
  render: resolve(root, 'tools/blender/homepage/render_approval.py'),
  export: resolve(root, 'tools/blender/homepage/export_runtime.py'),
}

export function runBlender(command, args = []) {
  const script = sourceScripts[command]
  if (!script) throw new Error(`Unsupported homepage Blender command: ${command}`)

  return spawnSync(process.env.EROS_BLENDER_BIN || defaultBinary, [
    '--background',
    '--python',
    script,
    '--',
    ...args,
  ], {
    encoding: 'utf8',
  })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, ...args] = process.argv.slice(2)
  const result = runBlender(command, args)
  if (result.error) throw result.error
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  process.exitCode = result.status ?? 1
}
