import { afterEach, describe, expect, it } from 'vitest'
import {
  getEnvVar,
  getEnvVarWithDefault,
  getNodeEnv,
  isVerbose,
  requireEnvVar,
  setEnvVar,
} from './env.js'

describe('env helpers', () => {
  afterEach(() => {
    // biome-ignore lint/performance/noDelete: process.env coerces assignments to strings, so delete is the only way to unset
    delete process.env.FORGE_TEST
    // biome-ignore lint/performance/noDelete: see above
    delete process.env.FORGE_VERBOSE
    // biome-ignore lint/performance/noDelete: see above
    delete process.env.FORGE_MISSING
    // biome-ignore lint/performance/noDelete: see above
    delete process.env.DEBUG
  })

  it('reads FORGE_-prefixed variables case-insensitively', () => {
    process.env.FORGE_TEST = 'hello'
    expect(getEnvVar('test')).toBe('hello')
    expect(getEnvVar('TEST')).toBe('hello')
  })

  it('returns undefined for unset variables', () => {
    expect(getEnvVar('missing')).toBeUndefined()
  })

  it('applies defaults when the variable is unset', () => {
    expect(getEnvVarWithDefault('missing', 'fallback')).toBe('fallback')
    process.env.FORGE_TEST = 'value'
    expect(getEnvVarWithDefault('test', 'fallback')).toBe('value')
  })

  it('writes FORGE_-prefixed variables', () => {
    setEnvVar('test', 'written')
    expect(process.env.FORGE_TEST).toBe('written')
  })

  it('requireEnvVar returns the value or throws with a helpful message', () => {
    process.env.FORGE_TEST = 'present'
    expect(requireEnvVar('test')).toBe('present')
    expect(() => requireEnvVar('missing')).toThrow('FORGE_MISSING is not set')
  })

  it('detects verbose mode from env or argv', () => {
    process.env.FORGE_VERBOSE = 'true'
    expect(isVerbose()).toBe(true)
  })

  it('defaults NODE_ENV to development', () => {
    expect(getNodeEnv()).toBe(process.env.NODE_ENV ?? 'development')
  })
})
