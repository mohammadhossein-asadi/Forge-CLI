import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useConsoleCapture } from '../../testing/console.js'
import { createFakeKernel } from '../../testing/kernel.js'
import { runUpgrade } from './index.js'

function stubRegistry(distTags: Record<string, string>): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ 'dist-tags': distTags }), { status: 200 })),
  )
}

describe('upgrade command', () => {
  let out: () => string

  beforeEach(() => {
    out = useConsoleCapture().output
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('reports being up to date and which channel was checked', async () => {
    stubRegistry({ latest: '0.1.0', stable: '0.1.0' })

    await runUpgrade(createFakeKernel(), { channel: 'stable' })

    const output = out()
    expect(output).toContain('Checking for updates (stable channel)...')
    expect(output).toContain('Current version: 0.1.0')
    expect(output).toContain('Latest version:  0.1.0')
    expect(output).toContain('You are running the latest version.')
  })

  it('suggests the upgrade command when an update exists', async () => {
    stubRegistry({ latest: '99.0.0', stable: '99.0.0' })

    await runUpgrade(createFakeKernel(), { channel: 'stable' })

    const output = out()
    expect(output).toContain('Update available!')
    expect(output).toContain('npm install -g forge@latest')
  })

  it('degrades gracefully when the registry is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )

    await runUpgrade(createFakeKernel(), { channel: 'stable' })

    const output = out()
    expect(output).toContain('Current version: 0.1.0')
    expect(output).toContain('You are running the latest version.')
  })
})
