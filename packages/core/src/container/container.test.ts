import { describe, it, expect } from 'vitest'
import { Container } from './container.js'

describe('Container', () => {
  it('should register and resolve a transient instance', () => {
    const container = new Container()
    container.register('greeter', () => ({ greet: () => 'hello' }))

    const instance1 = container.resolve<{ greet: () => string }>('greeter')
    const instance2 = container.resolve<{ greet: () => string }>('greeter')

    expect(instance1.greet()).toBe('hello')
    expect(instance1).not.toBe(instance2) // transient = new instance each time
  })

  it('should register and resolve a singleton instance', () => {
    const container = new Container()
    container.registerSingleton('greeter', () => ({ greet: () => 'hello' }))

    const instance1 = container.resolve<{ greet: () => string }>('greeter')
    const instance2 = container.resolve<{ greet: () => string }>('greeter')

    expect(instance1.greet()).toBe('hello')
    expect(instance1).toBe(instance2) // singleton = same instance
  })

  it('should register and resolve a pre-built instance', () => {
    const container = new Container()
    const instance = { value: 42 }
    container.registerInstance('value', instance)

    expect(container.resolve('value')).toBe(instance)
  })

  it('should throw when resolving unregistered token', () => {
    const container = new Container()
    expect(() => container.resolve('nonexistent')).toThrow('No registration found for token: nonexistent')
  })

  it('should check if token is registered', () => {
    const container = new Container()
    container.registerInstance('exists', 'yes')

    expect(container.has('exists')).toBe(true)
    expect(container.has('missing')).toBe(false)
  })

  it('should delegate to parent container', () => {
    const parent = new Container()
    parent.registerInstance('parent-value', 'from-parent')

    const child = parent.createChild()
    expect(child.resolve('parent-value')).toBe('from-parent')
  })

  it('should prioritize child over parent', () => {
    const parent = new Container()
    parent.registerInstance('value', 'parent')

    const child = parent.createChild()
    child.registerInstance('value', 'child')

    expect(child.resolve('value')).toBe('child')
    expect(parent.resolve('value')).toBe('parent')
  })

  it('should return all tokens', () => {
    const container = new Container()
    container.registerInstance('a', 1)
    container.registerInstance('b', 2)

    const tokens = container.tokens()
    expect(tokens).toContain('a')
    expect(tokens).toContain('b')
  })

  it('should dispose all singletons', async () => {
    const container = new Container()
    let disposed = false
    container.registerInstance('disposable', {
      dispose: async () => {
        disposed = true
      },
    })

    await container.dispose()
    expect(disposed).toBe(true)
  })

  it('should skip self-reference during dispose', async () => {
    const container = new Container()
    container.registerInstance('Container', container)

    // Should not throw or infinite loop
    await container.dispose()
  })

  it('should create child containers', () => {
    const parent = new Container()
    const child = parent.createChild()

    expect(child).toBeInstanceOf(Container)
    expect(parent.has('child')).toBe(false)
  })
})
