import { describe, it, expect, vi } from 'vitest'
import { PluginHookRunner } from './hooks.js'

describe('PluginHookRunner', () => {
  it('should register and run hooks', async () => {
    const runner = new PluginHookRunner()
    const handler = vi.fn()

    runner.register([{ event: 'test', handler }])
    await runner.run('test', { data: 1 })

    expect(handler).toHaveBeenCalledWith({ data: 1 })
  })

  it('should run hooks in priority order', async () => {
    const runner = new PluginHookRunner()
    const order: number[] = []

    runner.register([
      { event: 'test', handler: async () => { order.push(2) }, priority: 2 },
      { event: 'test', handler: async () => { order.push(1) }, priority: 1 },
      { event: 'test', handler: async () => { order.push(3) }, priority: 3 },
    ])

    await runner.run('test', {})

    expect(order).toEqual([1, 2, 3])
  })

  it('should handle hook errors without breaking pipeline', async () => {
    const runner = new PluginHookRunner()
    const handler2 = vi.fn()

    runner.register([
      { event: 'test', handler: async () => { throw new Error('fail') } },
      { event: 'test', handler: handler2 },
    ])

    await runner.run('test', {})

    expect(handler2).toHaveBeenCalled()
  })

  it('should remove all handlers for an event', async () => {
    const runner = new PluginHookRunner()
    const handler = vi.fn()

    runner.register([{ event: 'test', handler }])
    runner.remove('test')
    await runner.run('test', {})

    expect(handler).not.toHaveBeenCalled()
  })

  it('should remove specific handler', async () => {
    const runner = new PluginHookRunner()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    runner.register([
      { event: 'test', handler: handler1 },
      { event: 'test', handler: handler2 },
    ])
    runner.remove('test', handler1)
    await runner.run('test', {})

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).toHaveBeenCalled()
  })

  it('should list all hooks', () => {
    const runner = new PluginHookRunner()

    runner.register([
      { event: 'a', handler: async () => {} },
      { event: 'b', handler: async () => {} },
    ])

    expect(runner.list()).toHaveLength(2)
  })

  it('should get hooks by event', () => {
    const runner = new PluginHookRunner()

    runner.register([
      { event: 'a', handler: async () => {} },
      { event: 'a', handler: async () => {} },
      { event: 'b', handler: async () => {} },
    ])

    expect(runner.getByEvent('a')).toHaveLength(2)
    expect(runner.getByEvent('b')).toHaveLength(1)
    expect(runner.getByEvent('c')).toHaveLength(0)
  })

  it('should get hooks by plugin name', () => {
    const runner = new PluginHookRunner()

    runner.register([
      { event: 'a', handler: async () => {} },
      { event: 'b', handler: async () => {} },
    ], 'plugin-a')

    runner.register([
      { event: 'c', handler: async () => {} },
    ], 'plugin-b')

    expect(runner.getByPlugin('plugin-a')).toHaveLength(2)
    expect(runner.getByPlugin('plugin-b')).toHaveLength(1)
  })

  it('should not throw when running non-existent event', async () => {
    const runner = new PluginHookRunner()
    await expect(runner.run('nonexistent', {})).resolves.toBeUndefined()
  })
})
