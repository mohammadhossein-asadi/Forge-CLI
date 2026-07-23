import fs from 'node:fs/promises'
import path from 'node:path'
import { ForgeConfigSchema } from '@forge/shared'
import type { ResolvedConfig } from '@forge/shared'
import { ConfigResolver } from './resolver.js'
import type { ConfigLayer } from './types.js'
import { EventBus } from '../events/event-bus.js'
import type { Logger } from '../logging/logger.js'

export interface ConfigServiceOptions {
  logger: Logger
  bus: EventBus
  flags?: Record<string, unknown>
  cwd?: string
}

export interface ConfigGetOptions {
  layer?: string
  raw?: boolean
}

export interface ConfigSetOptions {
  layer?: string
  create?: boolean
}

export class ConfigService {
  private resolver: ConfigResolver
  private logger: Logger
  private bus: EventBus
  private cwd: string
  private resolved?: ResolvedConfig
  private watchers: Set<(config: ResolvedConfig) => void> = new Set()
  private watcherInterval?: ReturnType<typeof setInterval>

  constructor(options: ConfigServiceOptions) {
    this.logger = options.logger
    this.bus = options.bus
    this.cwd = options.cwd ?? process.cwd()
    this.resolver = new ConfigResolver({ flags: options.flags })
  }

  // ─── Resolution ──────────────────────────────────────────────

  async resolve(): Promise<ResolvedConfig> {
    this.resolved = await this.resolver.resolve()
    this.logger.debug('Configuration resolved', {
      layers: this.resolved._resolvedFrom.join(', '),
    })
    return this.resolved
  }

  get(): ResolvedConfig {
    if (!this.resolved) {
      throw new Error('Configuration not resolved. Call resolve() first.')
    }
    return this.resolved
  }

  // ─── Get ─────────────────────────────────────────────────────

  getValues(key: string, _options?: ConfigGetOptions): unknown {
    const config = this.get()
    const parts = key.split('.')
    let value: unknown = config

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[part]
      } else {
        return undefined
      }
    }

    return value
  }

  getLayer(name: string): ConfigLayer | undefined {
    return this.resolver.getLayer(name)
  }

  getLayers(): ConfigLayer[] {
    return this.resolver.getLayers ? this.resolver.getLayers() : []
  }

  getResolvedLayers(): string[] {
    return this.get()._resolvedFrom
  }

  // ─── Set ─────────────────────────────────────────────────────

  async setValues(key: string, value: unknown, options?: ConfigSetOptions): Promise<void> {
    const configPath = await this.getConfigFilePath(options?.layer)
    if (!configPath) {
      this.logger.error('No configuration file found')
      return
    }

    let config: Record<string, unknown> = {}
    try {
      const content = await fs.readFile(configPath, 'utf-8')
      config = JSON.parse(content) as Record<string, unknown>
    } catch {}

    // Set nested key
    const parts = key.split('.')
    let current = config
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {}
      }
      current = current[part] as Record<string, unknown>
    }

    current[parts[parts.length - 1]!] = value

    // Write back
    await this.writeConfigFile(configPath, config)

    // Re-resolve
    this.resolved = await this.resolver.resolve()
    this.notifyWatchers()
  }

  async deleteValues(key: string, options?: ConfigSetOptions): Promise<void> {
    const configPath = await this.getConfigFilePath(options?.layer)
    if (!configPath) return

    let config: Record<string, unknown> = {}
    try {
      const content = await fs.readFile(configPath, 'utf-8')
      config = JSON.parse(content) as Record<string, unknown>
    } catch {
      return
    }

    const parts = key.split('.')
    let current = config
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!
      if (!(part in current) || typeof current[part] !== 'object') return
      current = current[part] as Record<string, unknown>
    }

    delete current[parts[parts.length - 1]!]

    await this.writeConfigFile(configPath, config)
    this.resolved = await this.resolver.resolve()
    this.notifyWatchers()
  }

  // ─── Watch ───────────────────────────────────────────────────

  watch(callback: (config: ResolvedConfig) => void): () => void {
    this.watchers.add(callback)

    if (!this.watcherInterval) {
      this.startWatching()
    }

    return () => {
      this.watchers.delete(callback)
      if (this.watchers.size === 0) {
        this.stopWatching()
      }
    }
  }

  private startWatching(): void {
    this.watcherInterval = setInterval(async () => {
      try {
        const newResolved = await this.resolver.resolve()
        const currentStr = JSON.stringify(this.resolved)
        const newStr = JSON.stringify(newResolved)

        if (currentStr !== newStr) {
          this.resolved = newResolved
          this.notifyWatchers()
          await this.bus.emit('config:changed', {
            path: this.cwd,
            key: '*',
            oldValue: null,
            newValue: null,
          })
        }
      } catch {
        // Ignore errors during watch
      }
    }, 5000)
  }

  private stopWatching(): void {
    if (this.watcherInterval) {
      clearInterval(this.watcherInterval)
      this.watcherInterval = undefined
    }
  }

  private notifyWatchers(): void {
    if (this.resolved) {
      for (const watcher of this.watchers) {
        try {
          watcher(this.resolved)
        } catch {}
      }
    }
  }

  // ─── File Operations ─────────────────────────────────────────

  private async getConfigFilePath(layer?: string): Promise<string | null> {
    if (layer === 'global') {
      const configDir = process.platform === 'win32'
        ? path.join(process.env.LOCALAPPDATA ?? path.join(process.env.HOME ?? '', 'AppData', 'Local'), 'forge')
        : process.platform === 'darwin'
          ? path.join(process.env.HOME ?? '', 'Library', 'Application Support', 'forge')
          : process.env.XDG_CONFIG_HOME
            ? path.join(process.env.XDG_CONFIG_HOME, 'forge')
            : path.join(process.env.HOME ?? '', '.config', 'forge')
      return path.join(configDir, 'config.json')
    }

    // Default: project config
    return path.join(this.cwd, 'forge.config.json')
  }

  private async writeConfigFile(filePath: string, config: Record<string, unknown>): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(config, null, 2) + '\n', 'utf-8')
  }

  // ─── Export/Import ───────────────────────────────────────────

  async exportConfig(format: 'json' | 'yaml' | 'toml' = 'json'): Promise<string> {
    const config = this.get()
    const exportable = { ...config }
    delete (exportable as Record<string, unknown>)._resolvedFrom

    if (format === 'json') {
      return JSON.stringify(exportable, null, 2)
    }

    // For YAML/TOML, return JSON as fallback (can be extended)
    return JSON.stringify(exportable, null, 2)
  }

  async importConfig(data: string, format: 'json' | 'yaml' | 'toml' = 'json'): Promise<void> {
    let parsed: unknown

    if (format === 'json') {
      parsed = JSON.parse(data)
    } else {
      // Fallback to JSON
      parsed = JSON.parse(data)
    }

    // Validate
    const result = ForgeConfigSchema.safeParse(parsed)
    if (!result.success) {
      throw new Error(`Invalid configuration: ${result.error.message}`)
    }

    // Write to project config
    const configPath = path.join(this.cwd, 'forge.config.json')
    await this.writeConfigFile(configPath, result.data as Record<string, unknown>)

    // Re-resolve
    this.resolved = await this.resolver.resolve()
    this.notifyWatchers()
  }

  // ─── Migration ───────────────────────────────────────────────

  async migrate(fromVersion: string, toVersion: string): Promise<boolean> {
    const config = this.get()

    if (config.version === toVersion) {
      this.logger.debug('Configuration already at target version')
      return false
    }

    this.logger.info(`Migrating configuration from v${config.version} to v${toVersion}`)

    // Apply migrations
    let migrated = { ...config } as Record<string, unknown>

    // Example: v1.0.0 -> v1.1.0
    if (fromVersion === '1.0.0' && toVersion === '1.1.0') {
      migrated = this.migrate100to110(migrated)
    }

    migrated.version = toVersion

    // Write back
    const configPath = path.join(this.cwd, 'forge.config.json')
    await this.writeConfigFile(configPath, migrated)

    this.resolved = await this.resolver.resolve()
    this.notifyWatchers()

    this.logger.info(`Configuration migrated to v${toVersion}`)
    return true
  }

  private migrate100to110(config: Record<string, unknown>): Record<string, unknown> {
    // Example migration: add new fields with defaults
    if (!config.cli || typeof config.cli !== 'object') {
      config.cli = {}
    }
    const cli = config.cli as Record<string, unknown>
    if (cli.telemetry === undefined) {
      cli.telemetry = false
    }
    return config
  }

  // ─── Validation ──────────────────────────────────────────────

  validate(data: unknown): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    const result = ForgeConfigSchema.safeParse(data)
    if (!result.success) {
      for (const issue of result.error.issues) {
        errors.push(`${issue.path.join('.')}: ${issue.message}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // ─── Cleanup ─────────────────────────────────────────────────

  dispose(): void {
    this.stopWatching()
    this.watchers.clear()
  }
}
