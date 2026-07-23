import { describe, it, expect } from 'vitest'
import { CommandRegistry } from './registry.js'
import type { CommandRegistration } from './registry.js'

function createTestCommand(id: string, category?: string): CommandRegistration {
  return {
    id,
    commandClass: class {
      async run() {
        return { success: true }
      }
    } as never,
    metadata: {
      id,
      description: `Test command ${id}`,
      category,
    },
    flags: {},
    args: {},
  }
}

describe('CommandRegistry', () => {
  it('should register and resolve commands', () => {
    const registry = new CommandRegistry()
    const cmd = createTestCommand('test')
    registry.register(cmd)

    expect(registry.resolve('test')).toBe(cmd)
  })

  it('should resolve by alias', () => {
    const registry = new CommandRegistry()
    const cmd = createTestCommand('test')
    cmd.metadata.aliases = ['t']
    registry.register(cmd)

    expect(registry.resolve('t')).toBe(cmd)
  })

  it('should check if command exists', () => {
    const registry = new CommandRegistry()
    registry.register(createTestCommand('test'))

    expect(registry.has('test')).toBe(true)
    expect(registry.has('missing')).toBe(false)
  })

  it('should list commands', () => {
    const registry = new CommandRegistry()
    registry.register(createTestCommand('a'))
    registry.register(createTestCommand('b'))

    expect(registry.list()).toHaveLength(2)
  })

  it('should filter hidden commands', () => {
    const registry = new CommandRegistry()
    registry.register(createTestCommand('visible'))
    const hidden = createTestCommand('hidden')
    hidden.metadata.hidden = true
    registry.register(hidden)

    expect(registry.list()).toHaveLength(1)
    expect(registry.list({ includeHidden: true })).toHaveLength(2)
  })

  it('should group by category', () => {
    const registry = new CommandRegistry()
    registry.register(createTestCommand('create', 'project'))
    registry.register(createTestCommand('deploy', 'devops'))
    registry.register(createTestCommand('build', 'project'))

    const categories = registry.byCategory()
    expect(categories.get('project')).toHaveLength(2)
    expect(categories.get('devops')).toHaveLength(1)
  })

  it('should remove commands', () => {
    const registry = new CommandRegistry()
    registry.register(createTestCommand('test'))

    expect(registry.has('test')).toBe(true)
    registry.remove('test')
    expect(registry.has('test')).toBe(false)
  })
})
