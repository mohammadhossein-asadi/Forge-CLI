import { describe, it, expect, vi } from 'vitest'
import { EventBus } from './event-bus.js'

describe('EventBus', () => {
  it('should emit and receive events', async () => {
    const bus = new EventBus()
    const handler = vi.fn()

    bus.on('cli:init', handler)
    await bus.emit('cli:init', { timestamp: Date.now() })

    expect(handler).toHaveBeenCalledOnce()
  })

  it('should support multiple handlers', async () => {
    const bus = new EventBus()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    bus.on('cli:init', handler1)
    bus.on('cli:init', handler2)
    await bus.emit('cli:init', { timestamp: Date.now() })

    expect(handler1).toHaveBeenCalledOnce()
    expect(handler2).toHaveBeenCalledOnce()
  })

  it('should support one-time listeners', async () => {
    const bus = new EventBus()
    const handler = vi.fn()

    bus.once('cli:init', handler)
    await bus.emit('cli:init', { timestamp: Date.now() })
    await bus.emit('cli:init', { timestamp: Date.now() })

    expect(handler).toHaveBeenCalledOnce()
  })

  it('should unsubscribe handlers', async () => {
    const bus = new EventBus()
    const handler = vi.fn()

    const subscription = bus.on('cli:init', handler)
    subscription.unsubscribe()
    await bus.emit('cli:init', { timestamp: Date.now() })

    expect(handler).not.toHaveBeenCalled()
  })

  it('should remove all listeners', async () => {
    const bus = new EventBus()
    const handler1 = vi.fn()
    const handler2 = vi.fn()

    bus.on('cli:init', handler1)
    bus.on('cli:ready', handler2)
    bus.removeAllListeners()

    await bus.emit('cli:init', { timestamp: Date.now() })
    await bus.emit('cli:ready', { version: '0.1.0' })

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).not.toHaveBeenCalled()
  })

  it('should count listeners', () => {
    const bus = new EventBus()
    bus.on('cli:init', () => {})
    bus.on('cli:init', () => {})

    expect(bus.listenerCount('cli:init')).toBe(2)
    expect(bus.listenerCount('cli:ready')).toBe(0)
  })

  it('should handle async handlers', async () => {
    const bus = new EventBus()
    const results: number[] = []

    bus.on('cli:init', async () => {
      await new Promise((r) => setTimeout(r, 10))
      results.push(1)
    })

    bus.on('cli:init', async () => {
      results.push(2)
    })

    await bus.emit('cli:init', { timestamp: Date.now() })

    expect(results).toEqual([1, 2])
  })

  it('should not throw when emitting with no listeners', async () => {
    const bus = new EventBus()
    await expect(bus.emit('cli:init', { timestamp: Date.now() })).resolves.toBeUndefined()
  })
})
