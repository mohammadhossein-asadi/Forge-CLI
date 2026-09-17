import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { withCapturedConsole } from '../../testing/console.js'
import { createFakeKernel } from '../../testing/kernel.js'
import { runConfigGet, runConfigList, runConfigSet } from './index.js'

describe('config commands', () => {
  const tempDirs: string[] = []

  afterEach(async () => {
    for (const dir of tempDirs.splice(0)) {
      await fs.rm(dir, { recursive: true, force: true })
    }
  })

  async function inTempDir(): Promise<string> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-config-'))
    tempDirs.push(dir)
    const cwd = process.cwd()
    process.chdir(dir)
    return cwd
  }

  it('runConfigGet prints scalar and nested values', async () => {
    const kernel = createFakeKernel({
      config: {
        defaults: { language: 'typescript' },
        cli: { verbosity: 'normal' },
      } as never,
    })

    const scalar = await withCapturedConsole(() => runConfigGet(kernel, 'cli.verbosity'))
    expect(scalar.capture.output()).toContain('normal')

    const nested = await withCapturedConsole(() => runConfigGet(kernel, 'defaults'))
    expect(JSON.parse(nested.capture.output())).toEqual({ language: 'typescript' })
  })

  it('runConfigGet reports missing keys', async () => {
    const kernel = createFakeKernel()
    const { capture } = await withCapturedConsole(() => runConfigGet(kernel, 'does.not.exist'))
    expect(capture.output()).toContain('Config key "does.not.exist" is not set')
  })

  it('runConfigSet writes nested values into .forge/config.json', async () => {
    const previousCwd = await inTempDir()
    try {
      const kernel = createFakeKernel()
      await withCapturedConsole(() => runConfigSet(kernel, 'defaults.language', 'typescript'))

      const written = JSON.parse(
        await fs.readFile(path.join(process.cwd(), '.forge', 'config.json'), 'utf-8'),
      )
      expect(written).toEqual({ defaults: { language: 'typescript' } })
    } finally {
      process.chdir(previousCwd)
    }
  })

  it('runConfigSet parses JSON values and merges with existing config', async () => {
    const previousCwd = await inTempDir()
    try {
      const kernel = createFakeKernel()
      await withCapturedConsole(() => runConfigSet(kernel, 'cli.verbosity', 'normal'))
      await withCapturedConsole(() => runConfigSet(kernel, 'cli.telemetry', 'false'))

      const written = JSON.parse(
        await fs.readFile(path.join(process.cwd(), '.forge', 'config.json'), 'utf-8'),
      )
      expect(written.cli).toEqual({ verbosity: 'normal', telemetry: false })
    } finally {
      process.chdir(previousCwd)
    }
  })

  it('runConfigList prints the resolved configuration and sources', async () => {
    const kernel = createFakeKernel({
      config: { cli: { verbosity: 'normal' } } as never,
    })
    Object.defineProperty(kernel, 'getConfig', {
      value: () => ({ cli: { verbosity: 'normal' }, _resolvedFrom: ['defaults', 'project'] }),
      configurable: true,
    })

    const { capture } = await withCapturedConsole(() => runConfigList(kernel))
    const out = capture.output()
    expect(out).toContain('Configuration')
    expect(out).toContain('verbosity: "normal"')
    expect(out).toContain('Resolved from: defaults → project')
  })
})
