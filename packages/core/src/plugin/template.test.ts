import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PluginTemplate } from './template.js'
import { Logger } from '../logging/logger.js'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

describe('PluginTemplate', () => {
  let tmpDir: string
  let template: PluginTemplate

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-plugin-template-'))
    template = new PluginTemplate(new Logger({ level: 'silent' }))
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('should scaffold a plugin', async () => {
    const result = await template.scaffold({
      name: 'test-plugin',
      description: 'A test plugin',
      author: 'Test Author',
      outputDir: tmpDir,
      logger: new Logger({ level: 'silent' }),
    })

    expect(result.success).toBe(true)
    expect(result.files.length).toBeGreaterThan(0)
    expect(result.files).toContain('package.json')
    expect(result.files).toContain('tsconfig.json')
    expect(result.files).toContain('src/index.ts')
  })

  it('should create valid package.json', async () => {
    await template.scaffold({
      name: 'test-plugin',
      description: 'A test plugin',
      outputDir: tmpDir,
      logger: new Logger({ level: 'silent' }),
    })

    const pkgPath = path.join(tmpDir, 'test-plugin', 'package.json')
    const content = await fs.readFile(pkgPath, 'utf-8')
    const pkg = JSON.parse(content)

    expect(pkg.name).toBe('test-plugin')
    expect(pkg.version).toBe('0.1.0')
    expect(pkg.type).toBe('module')
    expect(pkg.forge).toBeDefined()
    expect(pkg.forge.type).toBe('plugin')
  })

  it('should create valid src/index.ts', async () => {
    await template.scaffold({
      name: 'test-plugin',
      outputDir: tmpDir,
      logger: new Logger({ level: 'silent' }),
    })

    const srcPath = path.join(tmpDir, 'test-plugin', 'src', 'index.ts')
    const content = await fs.readFile(srcPath, 'utf-8')

    expect(content).toContain('definePlugin')
    expect(content).toContain('test-plugin')
  })

  it('should create test file', async () => {
    await template.scaffold({
      name: 'test-plugin',
      outputDir: tmpDir,
      logger: new Logger({ level: 'silent' }),
    })

    const testPath = path.join(tmpDir, 'test-plugin', 'src', 'index.test.ts')
    const content = await fs.readFile(testPath, 'utf-8')

    expect(content).toContain('describe')
    expect(content).toContain('test-plugin')
  })

  it('should create README', async () => {
    await template.scaffold({
      name: 'test-plugin',
      description: 'My plugin',
      outputDir: tmpDir,
      logger: new Logger({ level: 'silent' }),
    })

    const readmePath = path.join(tmpDir, 'test-plugin', 'README.md')
    const content = await fs.readFile(readmePath, 'utf-8')

    expect(content).toContain('test-plugin')
    expect(content).toContain('My plugin')
  })
})
