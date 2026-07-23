import type { ForgePlugin } from '@forge/shared'
import type { Logger } from '../logging/logger.js'
import type { PluginLoadResult } from './types.js'

export interface PluginLoaderOptions {
  logger: Logger
  pluginDirs?: string[]
}

export class PluginLoader {
  private logger: Logger
  private pluginDirs: string[]

  constructor(options: PluginLoaderOptions) {
    this.logger = options.logger
    this.pluginDirs = options.pluginDirs ?? []
  }

  async loadPlugins(): Promise<PluginLoadResult[]> {
    const results: PluginLoadResult[] = []

    // Load built-in plugins (none yet)
    // Load plugins from configured directories
    for (const dir of this.pluginDirs) {
      const plugins = await this.loadFromDirectory(dir)
      results.push(...plugins)
    }

    // Discover plugins from node_modules
    const discovered = await this.discoverPlugins()
    results.push(...discovered)

    this.logger.debug(`Loaded ${results.length} plugins`)
    return results
  }

  private async loadFromDirectory(_dir: string): Promise<PluginLoadResult[]> {
    // Plugin loading from directories will be implemented when the plugin system is built
    return []
  }

  private async discoverPlugins(): Promise<PluginLoadResult[]> {
    // Plugin discovery from node_modules will be implemented when the plugin system is built
    return []
  }

  async loadPluginByName(_name: string): Promise<ForgePlugin | null> {
    // Will be implemented when plugin system is built
    return null
  }
}
