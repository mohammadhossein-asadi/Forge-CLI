import { describe, it, expect } from 'vitest'
import { PluginValidator } from './validator.js'

describe('PluginValidator', () => {
  const validator = new PluginValidator()

  it('should validate a valid plugin', () => {
    const result = validator.validate({
      name: 'test-plugin',
      version: '1.0.0',
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject non-object plugins', () => {
    const result = validator.validate(null)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should reject plugin without name', () => {
    const result = validator.validate({ version: '1.0.0' })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('name'))).toBe(true)
  })

  it('should reject plugin with empty name', () => {
    const result = validator.validate({ name: '', version: '1.0.0' })
    expect(result.valid).toBe(false)
  })

  it('should reject plugin without version', () => {
    const result = validator.validate({ name: 'test' })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.includes('version'))).toBe(true)
  })

  it('should reject invalid semver', () => {
    const result = validator.validate({ name: 'test', version: 'invalid' })
    expect(result.valid).toBe(false)
  })

  it('should accept valid semver with prerelease', () => {
    const result = validator.validate({ name: 'test', version: '1.0.0-beta.1' })
    expect(result.valid).toBe(true)
  })

  it('should warn about non-string description', () => {
    const result = validator.validate({
      name: 'test',
      version: '1.0.0',
      description: 123,
    })
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('should warn about non-array commands', () => {
    const result = validator.validate({
      name: 'test',
      version: '1.0.0',
      commands: 'not-an-array',
    })
    expect(result.warnings.length).toBeGreaterThan(0)
  })
})
