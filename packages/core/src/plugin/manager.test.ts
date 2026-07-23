import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PluginManager } from './manager.js'
import { Logger } from '../logging/logger.js'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

describe('PluginManager', () => {
  let tmpDir: string
  let manager: PluginManager

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-plugin-manager-'))
    manager = new PluginManager({
      logger: new Logger({ level: 'silent' }),
      workspaceRoot: tmpDir,
    })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('should start with no plugins', () => {
    expect(manager.getLoadedPlugins()).toHaveLength(0)
    expect(manager.getAllEntries()).toHaveLength(0)
  })

  it('should return empty commands/hooks/generators initially', () => {
    expect(manager.getCommands()).toHaveLength(0)
    expect(manager.getHooks()).toHaveLength(0)
    expect(manager.getGenerators()).toHaveLength(0)
  })

  it('should track enabled/disabled plugins', () => {
    expect(manager.isEnabled('test')).toBe(true)

    manager.disable('test')
    expect(manager.isEnabled('test')).toBe(false)

    manager.enable('test')
    expect(manager.isEnabled('test')).toBe(true)
  })

  it('should return empty dependency graph initially', () => {
    const graph = manager.getDependencyGraph()
    expect(graph.nodes).toHaveLength(0)
    expect(graph.edges).toHaveLength(0)
    expect(graph.sorted).toHaveLength(0)
  })

  it('should unload non-existent plugin gracefully', async () => {
    await expect(manager.unload('nonexistent')).resolves.toBeUndefined()
  })

  it('should get commands by category', () => {
    expect(manager.getCommandsByCategory('test')).toHaveLength(0)
  })

  it('should get hooks by event', () => {
    expect(manager.getHooksByEvent('test')).toHaveLength(0)
  })
})
