import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MarketplaceClient } from './marketplace.js'
import { Logger } from '../logging/logger.js'

describe('MarketplaceClient', () => {
  let client: MarketplaceClient
  let fetchSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    client = new MarketplaceClient({
      logger: new Logger({ level: 'silent' }),
      registryUrl: 'https://registry.npmjs.org',
    })
    fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy
  })

  it('should search for plugins', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        objects: [
          {
            package: {
              name: '@forge/plugin-test',
              version: '1.0.0',
              description: 'Test plugin',
              author: { name: 'Test Author' },
              keywords: ['forge'],
            },
            score: { final: 0.8 },
          },
        ],
        total: 1,
      }),
    })

    const result = await client.search({ query: 'test' })

    expect(result.plugins).toHaveLength(1)
    expect(result.plugins[0]!.name).toBe('@forge/plugin-test')
    expect(result.total).toBe(1)
  })

  it('should handle search errors gracefully', async () => {
    fetchSpy.mockRejectedValue(new Error('Network error'))

    const result = await client.search({ query: 'test' })

    expect(result.plugins).toHaveLength(0)
    expect(result.total).toBe(0)
  })

  it('should get plugin info', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        name: '@forge/plugin-test',
        version: '1.0.0',
        description: 'Test plugin',
        author: { name: 'Test Author' },
        keywords: ['forge'],
      }),
    })

    const plugin = await client.getPlugin('@forge/plugin-test')

    expect(plugin).not.toBeNull()
    expect(plugin!.name).toBe('@forge/plugin-test')
    expect(plugin!.version).toBe('1.0.0')
  })

  it('should return null for non-existent plugin', async () => {
    fetchSpy.mockResolvedValue({ ok: false })

    const plugin = await client.getPlugin('nonexistent')

    expect(plugin).toBeNull()
  })

  it('should get latest version', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ version: '2.0.0' }),
    })

    const version = await client.getLatestVersion('@forge/plugin-test')

    expect(version).toBe('2.0.0')
  })

  it('should mark official plugins', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        objects: [
          {
            package: {
              name: '@forge/plugin-official',
              version: '1.0.0',
              description: 'Official plugin',
            },
            score: { final: 1 },
          },
        ],
        total: 1,
      }),
    })

    const result = await client.search({ query: 'official' })

    expect(result.plugins[0]!.official).toBe(true)
  })
})
