import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useConsoleCapture } from '../../testing/console.js'
import { createFakeKernel } from '../../testing/kernel.js'
import { runList, runListAvailable } from './index.js'

describe('list command', () => {
  let out: () => string
  let fixtureRoot: string
  const tempDirs: string[] = []

  beforeEach(async () => {
    out = useConsoleCapture().output
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-list-'))
    tempDirs.push(dir)
    fixtureRoot = dir
  })

  afterEach(async () => {
    for (const dir of tempDirs.splice(0)) {
      await fs.rm(dir, { recursive: true, force: true })
    }
  })

  it('runListAvailable lists every listable type and usage', async () => {
    await runListAvailable()

    const output = out()
    for (const type of ['projects', 'plugins', 'templates', 'config', 'tools', 'files']) {
      expect(output).toContain(type)
    }
    expect(output).toContain('Usage: forge list <type> [options]')
    expect(output).toContain('--filter <text>')
    expect(output).toContain('--json')
  })

  it('runList renders discovered forge plugin packages with version', async () => {
    const pluginDir = path.join(fixtureRoot, 'node_modules', '@forge', 'plugin-a')
    await fs.mkdir(pluginDir, { recursive: true })
    await fs.writeFile(
      path.join(pluginDir, 'package.json'),
      JSON.stringify({
        name: '@forge/plugin-a',
        version: '1.2.3',
        forge: { version: '>=0.1.0', type: 'plugin', entry: 'index.js' },
      }),
      'utf-8',
    )
    const kernel = createFakeKernel({ workspace: { root: fixtureRoot } })

    await runList(kernel, 'plugins')

    const output = out()
    expect(output).toContain('@forge/plugin-a')
    expect(output).toContain('v1.2.3')
  })

  it('runList renders a single project with version and description', async () => {
    await fs.writeFile(
      path.join(fixtureRoot, 'package.json'),
      JSON.stringify({ name: 'fixture-app', version: '2.0.0', description: 'A fixture app' }),
      'utf-8',
    )
    const kernel = createFakeKernel({ workspace: { root: fixtureRoot } })

    await runList(kernel, 'projects')

    const output = out()
    expect(output).toContain('fixture-app v2.0.0')
    expect(output).toContain('A fixture app')
  })

  it('runList reports an empty workspace and suggests next actions', async () => {
    const kernel = createFakeKernel({ workspace: { root: fixtureRoot } })

    await runList(kernel, 'projects')

    const output = out()
    expect(output).toContain('No projects found.')
    expect(output).toContain('forge create <name>')
  })

  it('runList suggests installing a plugin when none are installed', async () => {
    const kernel = createFakeKernel({ workspace: { root: fixtureRoot } })

    await runList(kernel, 'plugins')

    expect(out()).toContain('forge plugin install <name>')
  })

  it('runList --json emits machine-readable output', async () => {
    const kernel = createFakeKernel({ workspace: { root: fixtureRoot } })

    await runList(kernel, 'plugins', { json: true })

    const parsed = JSON.parse(out()) as { type: string; items: unknown[]; total: number }
    expect(parsed.type).toBe('plugins')
    expect(parsed.items).toEqual([])
    expect(parsed.total).toBe(0)
  })
})
