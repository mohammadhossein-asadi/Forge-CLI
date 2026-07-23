import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PluginUpdater } from './updater.js'
import { Logger } from '../logging/logger.js'
import type { PluginEntry } from './types.js'

describe('PluginUpdater', () => {
  let updater: PluginUpdater
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    updater = new PluginUpdater({
      logger: new Logger({ level: 'silent' }),
    })
    fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy
  })

  const createEntry = (name: string, version: string): PluginEntry => ({
    name,
    version,
    status: 'loaded',
    source: '/path/to/plugin',
    loadTime: 0,
    commands: [],
    hooks: [],
    generators: [],
    permissions: [],
    dependencies: [],
  })

  it('should detect updates available', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ version: '2.0.0' }),
    })

    const update = await updater.checkPlugin(createEntry('test', '1.0.0'))

    expect(update.updateAvailable).toBe(true)
    expect(update.latestVersion).toBe('2.0.0')
  })

  it('should detect no update needed', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ version: '1.0.0' }),
    })

    const update = await updater.checkPlugin(createEntry('test', '1.0.0'))

    expect(update.updateAvailable).toBe(false)
  })

  it('should handle network errors', async () => {
    fetchSpy.mockRejectedValue(new Error('Network error'))

    const update = await updater.checkPlugin(createEntry('test', '1.0.0'))

    expect(update.updateAvailable).toBe(false)
    expect(update.latestVersion).toBe('1.0.0')
  })

  it('should cache results', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ version: '2.0.0' }),
    })

    await updater.checkPlugin(createEntry('test', '1.0.0'))
    await updater.checkPlugin(createEntry('test', '1.0.0'))

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('should check multiple plugins', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ version: '2.0.0' }),
    })

    const entries = [
      createEntry('plugin-a', '1.0.0'),
      createEntry('plugin-b', '1.0.0'),
    ]

    const updates = await updater.checkForUpdates(entries)

    expect(updates.length).toBe(2)
    expect(updates.every((u) => u.updateAvailable)).toBe(true)
  })

  it('should clear cache', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ version: '2.0.0' }),
    })

    await updater.checkPlugin(createEntry('test', '1.0.0'))
    updater.clearCache()
    await updater.checkPlugin(createEntry('test', '1.0.0'))

    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })
})
