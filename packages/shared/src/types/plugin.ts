// ─── Plugin ────────────────────────────────────────────────────

export interface ForgePlugin {
  name: string
  version: string
  description?: string
  author?: string
  license?: string
  homepage?: string
  keywords?: string[]

  // Plugin capabilities
  commands?: PluginCommand[]
  hooks?: PluginHook[]
  generators?: PluginGenerator[]
  configProviders?: PluginConfigProvider[]
  themes?: PluginTheme[]

  // Lifecycle
  setup?: (context: PluginContext) => Promise<void> | void
  teardown?: () => Promise<void> | void

  // Metadata
  metadata?: Record<string, unknown>
}

// ─── Commands ──────────────────────────────────────────────────

export interface PluginCommand {
  id: string
  name: string
  description: string
  aliases?: string[]
  examples?: string[]
  category?: string
  permissions?: string[]
  args?: PluginCommandArg[]
  flags?: PluginCommandFlag[]
  execute: (ctx: PluginCommandContext) => Promise<PluginCommandResult> | PluginCommandResult
}

export interface PluginCommandArg {
  name: string
  description?: string
  required?: boolean
  variadic?: boolean
  type?: 'string' | 'number' | 'boolean'
}

export interface PluginCommandFlag {
  name: string
  char?: string
  description?: string
  type: 'string' | 'boolean' | 'number' | 'enum'
  default?: unknown
  required?: boolean
  choices?: readonly (string | number)[]
}

export interface PluginCommandResult {
  success: boolean
  message?: string
  data?: unknown
  exitCode?: number
}

export interface PluginCommandContext {
  args: Record<string, unknown>
  flags: Record<string, unknown>
  config: Record<string, unknown>
  workspace: string
  logger: PluginLogger
  emit: (event: string, data: unknown) => Promise<void>
}

// ─── Hooks ─────────────────────────────────────────────────────

export interface PluginHook {
  event: string
  handler: (data: unknown) => Promise<void> | void
  priority?: number
}

// ─── Generators ────────────────────────────────────────────────

export interface PluginGenerator {
  id: string
  name: string
  description: string
  category?: string
  frameworks?: string[]
  args?: PluginCommandArg[]
  flags?: PluginCommandFlag[]
  execute: (ctx: PluginGeneratorContext) => Promise<PluginGeneratorResult>
}

export interface PluginGeneratorContext {
  args: Record<string, unknown>
  flags: Record<string, unknown>
  config: Record<string, unknown>
  workspace: string
  logger: PluginLogger
  fs: PluginFileSystem
  emit: (event: string, data: unknown) => Promise<void>
}

export interface PluginGeneratorResult {
  success: boolean
  files: string[]
  message?: string
}

// ─── Config ────────────────────────────────────────────────────

export interface PluginConfigProvider {
  key: string
  schema?: unknown
  defaults?: Record<string, unknown>
}

// ─── Theme ─────────────────────────────────────────────────────

export interface PluginTheme {
  name: string
  colors: Record<string, string>
}

// ─── Context ───────────────────────────────────────────────────

export interface PluginContext {
  plugin: ForgePlugin
  config: Record<string, unknown>
  workspace: string
  logger: PluginLogger
  fs?: PluginFileSystem
  emit: (event: string, data: unknown) => Promise<void>
  registerCommand?: (command: PluginCommand) => void
  registerHook?: (hook: PluginHook) => void
  registerGenerator?: (generator: PluginGenerator) => void
}

export interface PluginLogger {
  info: (message: string) => void
  warn: (message: string) => void
  error: (message: string) => void
  debug: (message: string) => void
}

export interface PluginFileSystem {
  read: (path: string) => Promise<string>
  write: (path: string, content: string) => Promise<void>
  exists: (path: string) => Promise<boolean>
  mkdir: (path: string) => Promise<void>
  readdir: (path: string) => Promise<string[]>
  glob: (pattern: string) => Promise<string[]>
}

// ─── Manifest ──────────────────────────────────────────────────

export interface PluginManifest {
  name: string
  version: string
  description?: string
  author?: string
  license?: string
  repository?: string
  keywords?: string[]
  forge: {
    version: string
    type: 'plugin'
    entry: string
    commands?: string
    hooks?: Record<string, string>
    generators?: Record<string, string>
    permissions?: string[]
  }
}
