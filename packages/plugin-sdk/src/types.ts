import { z } from 'zod'

// ─── Manifest Schema ───────────────────────────────────────────

export const PluginManifestSchema = z.object({
  name: z.string().min(1, 'Plugin name is required'),
  version: z.string().regex(/^\d+\.\d+\.\d+(-[\w.]+)?$/, 'Invalid semver version'),
  description: z.string().optional(),
  author: z.string().optional(),
  license: z.string().optional(),
  repository: z.string().optional(),
  homepage: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  forge: z.object({
    version: z.string().describe('Compatible Forge CLI version range'),
    type: z.literal('plugin'),
    entry: z.string().describe('Path to plugin entry point'),
    commands: z.string().optional().describe('Path to commands directory'),
    hooks: z.record(z.string()).optional().describe('Hook event handlers'),
    generators: z.record(z.string()).optional().describe('Code generators'),
    permissions: z.array(z.string()).default([]).describe('Required permissions'),
    dependencies: z.array(z.string()).default([]).describe('Plugin dependencies'),
  }),
  dependencies: z.record(z.string()).optional(),
  peerDependencies: z.record(z.string()).optional(),
  config: z.record(z.unknown()).optional().describe('Plugin configuration schema'),
})

export type PluginManifest = z.infer<typeof PluginManifestSchema>

// ─── Plugin Definition ─────────────────────────────────────────

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
  setup?: (ctx: PluginContext) => Promise<void> | void
  teardown?: () => Promise<void> | void

  // Metadata
  metadata?: Record<string, unknown>
}

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

export type HookEvent =
  | 'cli:init'
  | 'cli:ready'
  | 'cli:shutdown'
  | 'command:prerun'
  | 'command:postrun'
  | 'command:error'
  | 'project:created'
  | 'project:configured'
  | 'plugin:loaded'
  | 'plugin:unloaded'
  | string // extensible

export interface PluginHook {
  event: HookEvent
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

// ─── Config Provider ───────────────────────────────────────────

export interface PluginConfigProvider {
  key: string
  schema?: z.ZodType
  defaults?: Record<string, unknown>
}

// ─── Theme ─────────────────────────────────────────────────────

export interface PluginTheme {
  name: string
  colors: Record<string, string>
}

// ─── Context Interfaces ────────────────────────────────────────

export interface PluginContext {
  plugin: ForgePlugin
  config: Record<string, unknown>
  workspace: string
  logger: PluginLogger
  fs: PluginFileSystem
  emit: (event: string, data: unknown) => Promise<void>
  registerCommand: (command: PluginCommand) => void
  registerHook: (hook: PluginHook) => void
  registerGenerator: (generator: PluginGenerator) => void
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

// ─── Permissions ───────────────────────────────────────────────

export const PLUGIN_PERMISSIONS = [
  'filesystem.read',
  'filesystem.write',
  'network.read',
  'network.write',
  'terminal.exec',
  'git.read',
  'git.write',
  'docker.exec',
  'environment.read',
  'secrets.read',
  'config.read',
  'config.write',
  'workspace.read',
  'workspace.write',
] as const

export type PluginPermission = (typeof PLUGIN_PERMISSIONS)[number]
