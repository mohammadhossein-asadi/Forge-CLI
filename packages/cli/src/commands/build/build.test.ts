import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useConsoleCapture } from '../../testing/console.js'
import { createFakeKernel } from '../../testing/kernel.js'
import { runBuild, runBuildDetect } from './index.js'

describe('build command', () => {
  let out: () => string
  let fixtureRoot: string
  const tempDirs: string[] = []

  beforeEach(async () => {
    out = useConsoleCapture().output
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-build-'))
    tempDirs.push(dir)
    fixtureRoot = dir
  })

  afterEach(async () => {
    for (const dir of tempDirs.splice(0)) {
      await fs.rm(dir, { recursive: true, force: true })
    }
  })

  /**
   * The BuildDetector recognizes a tool when a tool-named script exists in
   * package.json, and rewrites its command to `npm run <tool>` — which works
   * on every platform and needs no globally installed binary.
   */
  async function writeFixture(scripts: Record<string, string>): Promise<void> {
    await fs.writeFile(
      path.join(fixtureRoot, 'package.json'),
      JSON.stringify({ name: 'fixture', scripts }),
      'utf-8',
    )
  }

  it('reports when no build tool is configured', async () => {
    await fs.writeFile(
      path.join(fixtureRoot, 'package.json'),
      JSON.stringify({ name: 'fixture' }),
      'utf-8',
    )
    const kernel = createFakeKernel({ workspace: { root: fixtureRoot } })

    await runBuild(kernel)

    const output = out()
    expect(output).toContain('No build tools detected.')
    expect(output).toContain('Add a "build" script to package.json')
  })

  it('runs the detected tool and reports success', async () => {
    await fs.writeFile(path.join(fixtureRoot, 'ok.cjs'), "console.log('built')", 'utf-8')
    await writeFixture({ tsc: 'node ok.cjs' })
    const kernel = createFakeKernel({ workspace: { root: fixtureRoot } })

    await runBuild(kernel)

    const output = out()
    expect(output).toContain('Using: tsc')
    expect(output).toContain('Build completed successfully')
    expect(output).toContain('built')
  }, 30000)

  it('reports a failing build with the error output', async () => {
    await fs.writeFile(
      path.join(fixtureRoot, 'fail.cjs'),
      "process.stderr.write('boom\\n'); process.exit(1)",
      'utf-8',
    )
    await writeFixture({ tsc: 'node fail.cjs' })
    const kernel = createFakeKernel({ workspace: { root: fixtureRoot } })

    await runBuild(kernel)

    const output = out()
    expect(output).toContain('Build failed')
    expect(output).toContain('boom')
  }, 30000)

  it('runBuildDetect lists detected tools and the primary choice', async () => {
    await writeFixture({ tsc: 'tsc' })
    const kernel = createFakeKernel({ workspace: { root: fixtureRoot } })

    await runBuildDetect(kernel)

    const output = out()
    expect(output).toContain('Detected build tools:')
    expect(output).toContain('tsc')
    expect(output).toContain('Config: tsconfig.json')
    expect(output).toContain('Primary: tsc')
  })
})
