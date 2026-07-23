import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PluginConfigManager } from './config.js'
import { Logger } from '../logging/logger.js'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

describe('PluginConfigManager', () => {
  let tmpDir: string
  let mgr: PluginConfigManager

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-plugin-config-'))
    mgr = new PluginConfigManager({
      logger: new Logger({ level: 'silent' }),
      workspaceRoot: tmpDir,
    })
  })

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true })
  })

  it('should get empty config for unknown plugin', () => {
    expect(mgr.get('unknown')).toEqual({})
  })

  it('should set and get config', () => {
    mgr.set('plugin-a', { key: 'value' })
    expect(mgr.get('plugin-a')).toEqual({ key: 'value' })
  })

  it('should set nested values', () => {
    mgr.setValues('plugin-a', 'nested.key', 'value')
    expect(mgr.getValues('plugin-a', 'nested.key')).toBe('value')
  })

  it('should get undefined for missing keys', () => {
    expect(mgr.getValues('plugin-a', 'missing')).toBeUndefined()
  })

  it('should delete plugin config', () => {
    mgr.set('plugin-a', { key: 'value' })
    mgr.delete('plugin-a')
    expect(mgr.has('plugin-a')).toBe(false)
  })

  it('should check if plugin has config', () => {
    expect(mgr.has('plugin-a')).toBe(false)
    mgr.set('plugin-a', { key: 'value' })
    expect(mgr.has('plugin-a')).toBe(true)
  })

  it('should list all configs', () => {
    mgr.set('plugin-a', { a: 1 })
    mgr.set('plugin-b', { b: 2 })

    const list = mgr.list()
    expect(list).toHaveLength(2)
    expect(list.find((c) => c.name === 'plugin-a')).toBeDefined()
    expect(list.find((c) => c.name === 'plugin-b')).toBeDefined()
  })

  it('should save and load from file', async () => {
    mgr.set('plugin-a', { key: 'value' })
    await mgr.save()

    const mgr2 = new PluginConfigManager({
      logger: new Logger({ level: 'silent' }),
      workspaceRoot: tmpDir,
    })
    await mgr2.load()

    expect(mgr2.get('plugin-a')).toEqual({ key: 'value' })
  })

  it('should handle missing config file gracefully', async () => {
    await expect(mgr.load()).resolves.toBeUndefined()
  })
})
