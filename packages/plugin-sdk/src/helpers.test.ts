import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  PluginManifestSchema,
  createPlugin,
  createPluginFileSystem,
  createPluginLogger,
  defineCommand,
  defineGenerator,
  defineHook,
  definePlugin,
} from './index.js'

describe('createPlugin builder', () => {
  it('builds a plugin with defaults for a bare manifest', () => {
    const plugin = createPlugin({ name: 'acme', version: '1.2.3' }).build()
    expect(plugin.name).toBe('acme')
    expect(plugin.version).toBe('1.2.3')
    expect(plugin.commands).toBeUndefined()
    expect(plugin.hooks).toBeUndefined()
  })

  it('chains command, hook, generator, theme, and lifecycle registrations', async () => {
    const setup = vi.fn()
    const teardown = vi.fn()
    const command = defineCommand({
      id: 'x',
      name: 'x',
      description: 'X',
      execute: () => ({ success: true }),
    })
    const hook = defineHook({ event: 'command:prerun', handler: () => {} })
    const generator = defineGenerator({
      id: 'g',
      name: 'g',
      description: 'G',
      execute: async () => ({ success: true, files: [] }),
    })

    const plugin = createPlugin({ name: 'acme' })
    plugin
      .command(command)
      .hook(hook)
      .generator(generator)
      .theme({ name: 'acme-dark', colors: {} })
      .setup(setup)
      .teardown(teardown)
    const built = plugin.build()

    expect(built.commands).toEqual([command])
    expect(built.hooks).toEqual([hook])
    expect(built.generators).toEqual([generator])
    expect(built.themes).toEqual([{ name: 'acme-dark', colors: {} }])
    expect(built.setup).toBe(setup)
    expect(built.teardown).toBe(teardown)

    await built.setup?.({
      plugin: built,
      config: {},
      workspace: '.',
      logger: createPluginLogger('t'),
      fs: createPluginFileSystem('.'),
      emit: async () => {},
      registerCommand: () => {},
      registerHook: () => {},
      registerGenerator: () => {},
    })
    expect(setup).toHaveBeenCalledOnce()
  })

  it('falls back to unnamed-plugin with a 0.0.0 version', () => {
    const plugin = createPlugin({}).build()
    expect(plugin.name).toBe('unnamed-plugin')
    expect(plugin.version).toBe('0.0.0')
  })
})

describe('definePlugin', () => {
  it('returns a ForgePlugin carrying commands and hooks', () => {
    const command = defineCommand({
      id: 'hi',
      name: 'hi',
      description: 'Hi',
      execute: () => ({ success: true }),
    })
    const plugin = definePlugin({ name: 'p', version: '0.0.1', commands: [command] })
    expect(plugin.commands).toEqual([command])
    expect(plugin.name).toBe('p')
  })
})

describe('defineCommand', () => {
  it('preserves args, flags, and the executor', async () => {
    const command = defineCommand({
      id: 'greet',
      name: 'greet',
      description: 'Greet someone',
      args: [{ name: 'who', required: false, type: 'string' }],
      flags: [{ name: 'loud', type: 'boolean' }],
      execute: (ctx) => ({ success: true, message: `hi ${String(ctx.args.who)}` }),
    })
    expect(command.id).toBe('greet')
    expect(command.args?.[0]?.name).toBe('who')
    const result = await command.execute({ args: { who: 'you' }, flags: {} } as never)
    expect(result.message).toBe('hi you')
  })
})

describe('defineHook', () => {
  it('keeps event, handler, and priority', async () => {
    const handler = vi.fn()
    const hook = defineHook({ event: 'project:created', priority: 5, handler })
    expect(hook.event).toBe('project:created')
    expect(hook.priority).toBe(5)
    await hook.handler({ name: 'x' })
    expect(handler).toHaveBeenCalledWith({ name: 'x' })
  })
})

describe('defineGenerator', () => {
  it('preserves generator metadata', () => {
    const generator = defineGenerator({
      id: 'component',
      name: 'component',
      description: 'Generate a component',
      frameworks: ['react'],
      execute: async () => ({ success: true, files: ['src/a.tsx'] }),
    })
    expect(generator.frameworks).toEqual(['react'])
    expect(generator.id).toBe('component')
  })
})

describe('createPluginLogger', () => {
  it('prefixes every message with the plugin name', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const logger = createPluginLogger('acme')

    logger.info('starting')
    logger.warn('careful')
    logger.error('broken')

    expect(logSpy).toHaveBeenCalledWith('[acme] starting')
    expect(warnSpy).toHaveBeenCalledWith('[acme] ⚠ careful')
    expect(errorSpy).toHaveBeenCalledWith('[acme] ✘ broken')

    logSpy.mockRestore()
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('stays silent for debug unless DEBUG is enabled', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const logger = createPluginLogger('acme')

    logger.debug('hidden')
    expect(logSpy).not.toHaveBeenCalled()

    process.env.DEBUG = '1'
    logger.debug('visible')
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[DEBUG] visible'))
    // biome-ignore lint/performance/noDelete: undefined assignment is not enough to remove the env var
    delete process.env.DEBUG

    logSpy.mockRestore()
  })
})

describe('createPluginFileSystem', () => {
  const tempDirs: string[] = []

  afterEach(async () => {
    for (const dir of tempDirs.splice(0)) {
      await fs.rm(dir, { recursive: true, force: true })
    }
  })

  async function workspace(): Promise<string> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-sdk-fs-'))
    tempDirs.push(dir)
    return dir
  }

  it('writes and reads files relative to the workspace', async () => {
    const root = await workspace()
    const pfs = createPluginFileSystem(root)
    await pfs.write('out/generated.txt', 'content')
    expect(await pfs.read('out/generated.txt')).toBe('content')
    expect(await pfs.exists('out/generated.txt')).toBe(true)
    expect(await pfs.exists('out/missing.txt')).toBe(false)
  })

  it('mkdir creates nested directories and readdir lists them', async () => {
    const root = await workspace()
    const pfs = createPluginFileSystem(root)
    await pfs.mkdir('a/b/c')
    await pfs.write('a/b/c/file.txt', 'x')
    expect(await pfs.readdir('a/b')).toContain('c')
  })

  it('glob finds files with patterns', async () => {
    const root = await workspace()
    const pfs = createPluginFileSystem(root)
    await pfs.mkdir('src')
    await pfs.write('src/a.ts', 'x')
    await pfs.write('src/b.ts', 'x')
    expect((await pfs.glob('src/*.ts')).sort()).toEqual(['src/a.ts', 'src/b.ts'])
  })
})

describe('PluginManifestSchema', () => {
  const validManifest = {
    name: '@acme/plugin',
    version: '1.0.0',
    forge: { version: '>=0.1.0', type: 'plugin', entry: 'index.js' },
  }

  it('accepts a minimal valid manifest', () => {
    const parsed = PluginManifestSchema.parse(validManifest)
    expect(parsed.keywords).toEqual([])
    expect(parsed.forge.permissions).toEqual([])
  })

  it('rejects manifests without a name or forge block', () => {
    expect(PluginManifestSchema.safeParse({ version: '1.0.0' }).success).toBe(false)
    expect(PluginManifestSchema.safeParse({ name: 'x' }).success).toBe(false)
  })

  it('rejects invalid semver versions and wrong forge types', () => {
    expect(PluginManifestSchema.safeParse({ ...validManifest, version: 'abc' }).success).toBe(false)
    expect(
      PluginManifestSchema.safeParse({
        ...validManifest,
        forge: { ...validManifest.forge, type: 'theme' },
      }).success,
    ).toBe(false)
  })
})
