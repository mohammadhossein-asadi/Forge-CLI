import { describe, expect, it } from 'vitest'
import * as forge from './index.js'
import { VERSION } from './version.js'

describe('forge package', () => {
  it('exposes the CLI version', () => {
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('re-exports the core engine classes', () => {
    for (const exported of ['Kernel', 'Container', 'Logger', 'EventBus', 'HookRunner']) {
      expect(forge, `missing export: ${exported}`).toHaveProperty(exported)
      expect(typeof (forge as Record<string, unknown>)[exported]).toBe('function')
    }
  })

  it('re-exports the bootstrap helper', async () => {
    expect(typeof forge.bootstrap).toBe('function')
    const kernel = await forge.bootstrap()
    expect(typeof kernel.shutdown).toBe('function')
    await kernel.shutdown()
  })
})
