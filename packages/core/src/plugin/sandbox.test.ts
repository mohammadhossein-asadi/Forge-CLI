import { describe, it, expect } from 'vitest'
import { PluginSandbox } from './sandbox.js'
import { Logger } from '../logging/logger.js'

function createSandbox() {
  return new PluginSandbox({
    logger: new Logger({ level: 'silent' }),
    maxMemory: 128 * 1024 * 1024,
    maxCpuTime: 5000,
  })
}

describe('PluginSandbox', () => {
  it('should execute successful functions', async () => {
    const sandbox = createSandbox()
    const result = await sandbox.execute(async () => 42)

    expect(result.success).toBe(true)
    expect(result.result).toBe(42)
    expect(result.duration).toBeGreaterThanOrEqual(0)
  })

  it('should handle synchronous functions', async () => {
    const sandbox = createSandbox()
    const result = await sandbox.execute(() => 'hello')

    expect(result.success).toBe(true)
    expect(result.result).toBe('hello')
  })

  it('should catch errors', async () => {
    const sandbox = createSandbox()
    const result = await sandbox.execute(async () => {
      throw new Error('test error')
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('test error')
  })

  it('should timeout long-running functions', async () => {
    const sandbox = new PluginSandbox({
      logger: new Logger({ level: 'silent' }),
      maxCpuTime: 100,
    })

    const result = await sandbox.execute(async () => {
      await new Promise((r) => setTimeout(r, 200))
      return 'done'
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('timed out')
  })

  it('should track duration', async () => {
    const sandbox = createSandbox()
    const result = await sandbox.execute(async () => {
      await new Promise((r) => setTimeout(r, 50))
      return 'done'
    })

    expect(result.duration).toBeGreaterThanOrEqual(40)
  })

  it('should check module permissions', () => {
    const sandbox = new PluginSandbox({
      logger: new Logger({ level: 'silent' }),
      blockedModules: ['child_process', 'worker_threads'],
    })

    expect(sandbox.isModuleAllowed('fs')).toBe(true)
    expect(sandbox.isModuleAllowed('child_process')).toBe(false)
    expect(sandbox.isModuleAllowed('worker_threads')).toBe(false)
  })

  it('should respect allowed modules list', () => {
    const sandbox = new PluginSandbox({
      logger: new Logger({ level: 'silent' }),
      allowedModules: ['fs', 'path'],
    })

    expect(sandbox.isModuleAllowed('fs')).toBe(true)
    expect(sandbox.isModuleAllowed('path')).toBe(true)
    expect(sandbox.isModuleAllowed('child_process')).toBe(false)
  })
})
