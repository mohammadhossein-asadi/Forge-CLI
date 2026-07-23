import fs from 'node:fs/promises'
import path from 'node:path'
import type { Logger } from '../logging/logger.js'

export interface PluginConfig {
  [pluginName: string]: Record<string, unknown>
}

export interface PluginConfigOptions {
  logger: Logger
  workspaceRoot: string
}

export class PluginConfigManager {
  private logger: Logger
  private configs = new Map<string, Record<string, unknown>>()
  private configPath: string

  constructor(options: PluginConfigOptions) {
    this.logger = options.logger
    this.configPath = path.join(options.workspaceRoot, 'forge.plugins.json')
  }

  async load(): Promise<void> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8')
      const data = JSON.parse(content) as PluginConfig
      for (const [name, config] of Object.entries(data)) {
        this.configs.set(name, config)
      }
      this.logger.debug(`Loaded plugin configs for ${this.configs.size} plugins`)
    } catch {
      // File doesn't exist or is invalid, start empty
    }
  }

  async save(): Promise<void> {
    const data: PluginConfig = {}
    for (const [name, config] of this.configs) {
      data[name] = config
    }

    try {
      await fs.writeFile(this.configPath, JSON.stringify(data, null, 2) + '\n', 'utf-8')
      this.logger.debug('Plugin configs saved')
    } catch (error) {
      this.logger.error(`Failed to save plugin configs: ${error}`)
    }
  }

  get(pluginName: string): Record<string, unknown> {
    return this.configs.get(pluginName) ?? {}
  }

  set(pluginName: string, config: Record<string, unknown>): void {
    this.configs.set(pluginName, config)
  }

  getValues(pluginName: string, key: string): unknown {
    const config = this.configs.get(pluginName)
    if (!config) return undefined

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

  setValues(pluginName: string, key: string, value: unknown): void {
    const config = this.configs.get(pluginName) ?? {}
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
    this.configs.set(pluginName, config)
  }

  delete(pluginName: string): void {
    this.configs.delete(pluginName)
  }

  has(pluginName: string): boolean {
    return this.configs.has(pluginName)
  }

  getAll(): Map<string, Record<string, unknown>> {
    return new Map(this.configs)
  }

  list(): Array<{ name: string; config: Record<string, unknown> }> {
    return [...this.configs.entries()].map(([name, config]) => ({ name, config }))
  }
}
