import { describe, it, expect } from 'vitest'
import {
  PluginError,
  createPluginNotFoundError,
  createPluginLoadError,
  createPluginIncompatibleError,
  createPluginPermissionError,
  createPluginDependencyError,
} from './errors.js'
import { ErrorCode } from '@forge/shared'

describe('Plugin Errors', () => {
  it('should create plugin not found error', () => {
    const error = createPluginNotFoundError('my-plugin')

    expect(error).toBeInstanceOf(PluginError)
    expect(error.code).toBe(ErrorCode.PLUGIN_NOT_FOUND)
    expect(error.message).toContain('my-plugin')
    expect(error.recovery.length).toBeGreaterThan(0)
  })

  it('should create plugin load error', () => {
    const cause = new Error('Module not found')
    const error = createPluginLoadError('my-plugin', cause)

    expect(error).toBeInstanceOf(PluginError)
    expect(error.code).toBe(ErrorCode.PLUGIN_LOAD_FAILED)
    expect(error.message).toContain('my-plugin')
    expect(error.cause).toBe(cause)
  })

  it('should create plugin incompatible error', () => {
    const error = createPluginIncompatibleError('my-plugin', '>=2.0.0', '1.0.0')

    expect(error).toBeInstanceOf(PluginError)
    expect(error.code).toBe(ErrorCode.PLUGIN_INCOMPATIBLE)
    expect(error.message).toContain('my-plugin')
    expect(error.message).toContain('>=2.0.0')
  })

  it('should create plugin permission error', () => {
    const error = createPluginPermissionError('my-plugin', 'filesystem.write')

    expect(error).toBeInstanceOf(PluginError)
    expect(error.code).toBe(ErrorCode.PLUGIN_PERMISSION_DENIED)
    expect(error.message).toContain('my-plugin')
    expect(error.message).toContain('filesystem.write')
  })

  it('should create plugin dependency error', () => {
    const error = createPluginDependencyError('my-plugin', 'dep-plugin')

    expect(error).toBeInstanceOf(PluginError)
    expect(error.code).toBe(ErrorCode.PLUGIN_DEPENDENCY_MISSING)
    expect(error.message).toContain('my-plugin')
    expect(error.message).toContain('dep-plugin')
  })

  it('should be instance of ForgeError', () => {
    const error = createPluginNotFoundError('test')
    expect(error.name).toBe('ForgeError')
    expect(error.severity).toBe('error')
    expect(error.category).toBe('plugin')
  })

  it('should serialize to JSON', () => {
    const error = createPluginNotFoundError('test')
    const json = error.toJSON()

    expect(json.code).toBe(ErrorCode.PLUGIN_NOT_FOUND)
    expect(json.severity).toBe('error')
    expect(json.category).toBe('plugin')
  })
})
