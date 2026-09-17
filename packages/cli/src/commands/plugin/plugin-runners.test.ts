import { beforeEach, describe, expect, it } from 'vitest'
import { useConsoleCapture } from '../../testing/console.js'
import { createFakeKernel } from '../../testing/kernel.js'
import { runPluginConfig, runPluginList } from './index.js'

describe('plugin command runners', () => {
  let out: () => string

  beforeEach(() => {
    out = useConsoleCapture().output
  })

  it('runPluginList shows install hints when no plugins are installed', async () => {
    await runPluginList(createFakeKernel())

    const output = out()
    expect(output).toContain('No plugins installed.')
    expect(output).toContain('forge plugin install <name>')
  })

  it('runPluginList renders installed plugins with commands, hooks, and generators', async () => {
    const kernel = createFakeKernel()
    Object.defineProperty(kernel, 'getPluginManager', {
      value: () => ({
        getAllEntries: () => [
          {
            name: '@forge/plugin-hello',
            version: '2.1.3',
            status: 'loaded',
            source: 'node_modules',
            loadTime: 7,
            commands: [{ name: 'greet' }, { name: 'shout' }],
            hooks: [{ event: 'command:prerun' }],
            generators: [{ name: 'component' }],
            permissions: ['filesystem.read'],
            dependencies: [],
          },
        ],
      }),
      configurable: true,
    })

    await runPluginList(kernel)

    const output = out()
    expect(output).toContain('✔ @forge/plugin-hello v2.1.3')
    expect(output).toContain('Commands: greet, shout')
    expect(output).toContain('Hooks: command:prerun')
    expect(output).toContain('Generators: component')
  })

  it('runPluginConfig prints usage when called without key or value', async () => {
    await runPluginConfig(createFakeKernel(), '@forge/plugin-hello')

    const output = out()
    expect(output).toContain('Plugin configuration for "@forge/plugin-hello"')
    expect(output).toContain('forge plugin config <plugin>')
  })

  it('runPluginConfig echoes set and get operations', async () => {
    const kernel = createFakeKernel()

    await runPluginConfig(kernel, '@forge/plugin-hello', 'greeting', 'hello')
    expect(out()).toContain('Setting greeting = hello')

    await runPluginConfig(kernel, '@forge/plugin-hello', 'greeting')
    expect(out()).toContain('Getting greeting')
  })
})
