import os from 'node:os'
import { describe, expect, it } from 'vitest'
import { getArch, getConfigDirectory, getPlatform, supportsColor } from './platform.js'

describe('platform helpers', () => {
  it('maps the running platform into the supported union', () => {
    expect(['windows', 'macos', 'linux']).toContain(getPlatform())
  })

  it('maps the running architecture into the supported union', () => {
    expect(['x64', 'arm64', 'arm']).toContain(getArch())
  })

  it('getPlatform matches node os.platform', () => {
    const expected =
      os.platform() === 'win32' ? 'windows' : os.platform() === 'darwin' ? 'macos' : 'linux'
    expect(getPlatform()).toBe(expected)
  })
})

describe('directory helpers', () => {
  it('returns a config directory containing the CLI name', () => {
    expect(getConfigDirectory()).toMatch(/forge$/)
  })
})

describe('supportsColor', () => {
  it('never throws and returns a boolean', () => {
    expect(typeof supportsColor()).toBe('boolean')
  })
})
