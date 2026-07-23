import type {
  ForgePlugin,
  PluginCommand,
  PluginHook,
  PluginGenerator,
  PluginConfigProvider,
  PluginTheme,
  PluginContext,
  PluginLogger,
  PluginFileSystem,
  PluginCommandContext,
  PluginCommandResult,
  PluginGeneratorContext,
  PluginGeneratorResult,
} from './types.js'

// ─── Plugin Builder ────────────────────────────────────────────

export interface PluginBuilder {
  command(command: PluginCommand): PluginBuilder
  hook(hook: PluginHook): PluginBuilder
  generator(generator: PluginGenerator): PluginBuilder
  configProvider(provider: PluginConfigProvider): PluginBuilder
  theme(theme: PluginTheme): PluginBuilder
  setup(fn: (ctx: PluginContext) => Promise<void> | void): PluginBuilder
  teardown(fn: () => Promise<void> | void): PluginBuilder
  build(): ForgePlugin
}

export function createPlugin(manifest: Partial<ForgePlugin>): PluginBuilder {
  const commands: PluginCommand[] = []
  const hooks: PluginHook[] = []
  const generators: PluginGenerator[] = []
  const configProviders: PluginConfigProvider[] = []
  const themes: PluginTheme[] = []
  let setupFn: ((ctx: PluginContext) => Promise<void> | void) | undefined
  let teardownFn: (() => Promise<void> | void) | undefined

  const builder: PluginBuilder = {
    command(cmd) {
      commands.push(cmd)
      return builder
    },
    hook(hook) {
      hooks.push(hook)
      return builder
    },
    generator(gen) {
      generators.push(gen)
      return builder
    },
    configProvider(provider) {
      configProviders.push(provider)
      return builder
    },
    theme(thm) {
      themes.push(thm)
      return builder
    },
    setup(fn) {
      setupFn = fn
      return builder
    },
    teardown(fn) {
      teardownFn = fn
      return builder
    },
    build(): ForgePlugin {
      return {
        name: manifest.name ?? 'unnamed-plugin',
        version: manifest.version ?? '0.0.0',
        description: manifest.description,
        author: manifest.author,
        license: manifest.license,
        homepage: manifest.homepage,
        keywords: manifest.keywords,
        commands: commands.length > 0 ? commands : undefined,
        hooks: hooks.length > 0 ? hooks : undefined,
        generators: generators.length > 0 ? generators : undefined,
        configProviders: configProviders.length > 0 ? configProviders : undefined,
        themes: themes.length > 0 ? themes : undefined,
        setup: setupFn,
        teardown: teardownFn,
        metadata: manifest.metadata,
      }
    },
  }

  return builder
}

// ─── Simple Plugin Helper ──────────────────────────────────────

export function definePlugin(
  manifest: Partial<ForgePlugin>,
  setup?: (ctx: PluginContext) => Promise<void> | void,
): ForgePlugin {
  return {
    name: manifest.name ?? 'unnamed-plugin',
    version: manifest.version ?? '0.0.0',
    description: manifest.description,
    author: manifest.author,
    license: manifest.license,
    homepage: manifest.homepage,
    keywords: manifest.keywords,
    commands: manifest.commands,
    hooks: manifest.hooks,
    generators: manifest.generators,
    configProviders: manifest.configProviders,
    themes: manifest.themes,
    setup,
    teardown: manifest.teardown,
    metadata: manifest.metadata,
  }
}

// ─── Command Helper ────────────────────────────────────────────

export interface DefineCommandOptions {
  id: string
  name: string
  description: string
  aliases?: string[]
  examples?: string[]
  category?: string
  permissions?: string[]
  args?: PluginCommand['args']
  flags?: PluginCommand['flags']
  execute: (ctx: PluginCommandContext) => Promise<PluginCommandResult> | PluginCommandResult
}

export function defineCommand(options: DefineCommandOptions): PluginCommand {
  return {
    id: options.id,
    name: options.name,
    description: options.description,
    aliases: options.aliases,
    examples: options.examples,
    category: options.category,
    permissions: options.permissions,
    args: options.args,
    flags: options.flags,
    execute: options.execute,
  }
}

// ─── Hook Helper ───────────────────────────────────────────────

export interface DefineHookOptions {
  event: string
  priority?: number
  handler: (data: unknown) => Promise<void> | void
}

export function defineHook(options: DefineHookOptions): PluginHook {
  return {
    event: options.event,
    handler: options.handler,
    priority: options.priority,
  }
}

// ─── Generator Helper ──────────────────────────────────────────

export interface DefineGeneratorOptions {
  id: string
  name: string
  description: string
  category?: string
  frameworks?: string[]
  args?: PluginGenerator['args']
  flags?: PluginGenerator['flags']
  execute: (ctx: PluginGeneratorContext) => Promise<PluginGeneratorResult>
}

export function defineGenerator(options: DefineGeneratorOptions): PluginGenerator {
  return {
    id: options.id,
    name: options.name,
    description: options.description,
    category: options.category,
    frameworks: options.frameworks,
    args: options.args,
    flags: options.flags,
    execute: options.execute,
  }
}

// ─── Logger Helper ─────────────────────────────────────────────

export function createPluginLogger(prefix: string): PluginLogger {
  return {
    info: (message: string) => console.log(`[${prefix}] ${message}`),
    warn: (message: string) => console.warn(`[${prefix}] ⚠ ${message}`),
    error: (message: string) => console.error(`[${prefix}] ✘ ${message}`),
    debug: (message: string) => {
      if (process.env.DEBUG || process.env.FORGE_DEBUG) {
        console.log(`[${prefix}] [DEBUG] ${message}`)
      }
    },
  }
}

// ─── File System Helper ────────────────────────────────────────

export function createPluginFileSystem(workspace: string): PluginFileSystem {
  return {
    async read(filePath: string): Promise<string> {
      const fs = await import('node:fs/promises')
      const path = await import('node:path')
      return fs.readFile(path.resolve(workspace, filePath), 'utf-8')
    },
    async write(filePath: string, content: string): Promise<void> {
      const fs = await import('node:fs/promises')
      const path = await import('node:path')
      const fullPath = path.resolve(workspace, filePath)
      await fs.mkdir(path.dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, content, 'utf-8')
    },
    async exists(filePath: string): Promise<boolean> {
      const fs = await import('node:fs/promises')
      const path = await import('node:path')
      try {
        await fs.access(path.resolve(workspace, filePath))
        return true
      } catch {
        return false
      }
    },
    async mkdir(dirPath: string): Promise<void> {
      const fs = await import('node:fs/promises')
      const path = await import('node:path')
      await fs.mkdir(path.resolve(workspace, dirPath), { recursive: true })
    },
    async readdir(dirPath: string): Promise<string[]> {
      const fs = await import('node:fs/promises')
      const path = await import('node:path')
      return fs.readdir(path.resolve(workspace, dirPath))
    },
    async glob(pattern: string): Promise<string[]> {
      const { default: fg } = await import('fast-glob')
      return fg(pattern, { cwd: workspace, dot: true })
    },
  }
}
