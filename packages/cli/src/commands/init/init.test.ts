import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { withCapturedConsole } from '../../testing/console.js'
import { createFakeKernel } from '../../testing/kernel.js'
import { runInit } from './index.js'

describe('init command', () => {
  const tempDirs: string[] = []

  afterEach(async () => {
    const cwd = process.cwd()
    if (cwd.startsWith(os.tmpdir())) {
      process.chdir(os.tmpdir())
    }
    for (const dir of tempDirs.splice(0)) {
      await fs.rm(dir, { recursive: true, force: true })
    }
  })

  async function inTempDir(): Promise<string> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-init-'))
    tempDirs.push(dir)
    const previous = process.cwd()
    process.chdir(dir)
    return previous
  }

  it('creates forge.config.json and .editorconfig', async () => {
    const previousCwd = await inTempDir()
    try {
      const { capture } = await withCapturedConsole(() => runInit(createFakeKernel()))

      const config = JSON.parse(await fs.readFile('forge.config.json', 'utf-8'))
      expect(config.project.name).toBe('my-project')
      expect(await fs.readFile('.editorconfig', 'utf-8')).toContain('indent_style = space')
      expect(capture.output()).toContain('Forge initialized successfully!')
    } finally {
      process.chdir(previousCwd)
    }
  })

  it('uses the package.json name for the generated config', async () => {
    const previousCwd = await inTempDir()
    try {
      await fs.writeFile('package.json', JSON.stringify({ name: 'existing-app' }), 'utf-8')

      await withCapturedConsole(() => runInit(createFakeKernel()))

      const config = JSON.parse(await fs.readFile('forge.config.json', 'utf-8'))
      expect(config.project.name).toBe('existing-app')
    } finally {
      process.chdir(previousCwd)
    }
  })

  it('is idempotent: skips files that already exist', async () => {
    const previousCwd = await inTempDir()
    try {
      await fs.writeFile('forge.config.json', '{"kept":true}', 'utf-8')
      await fs.writeFile('.editorconfig', 'root = true\n', 'utf-8')

      const { capture } = await withCapturedConsole(() => runInit(createFakeKernel()))

      expect(await fs.readFile('forge.config.json', 'utf-8')).toBe('{"kept":true}')
      expect(await fs.readFile('.editorconfig', 'utf-8')).toBe('root = true\n')
      expect(capture.output()).toContain('already exists, skipping')
    } finally {
      process.chdir(previousCwd)
    }
  })
})
