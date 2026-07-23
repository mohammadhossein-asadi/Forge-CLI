import type { ForgePlugin } from '@forge/shared'
import { Container } from '../container/container.js'
import type { Logger } from '../logging/logger.js'

export interface PluginRuntimeOptions {
  parentContainer: Container
  logger: Logger
}

export class PluginRuntime {
  private container: Container
  private logger: Logger
  private pluginContainers = new Map<string, Container>()

  constructor(options: PluginRuntimeOptions) {
    this.container = options.parentContainer
    this.logger = options.logger
  }

  createPluginScope(plugin: ForgePlugin): Container {
    const child = this.container.createChild()
    this.pluginContainers.set(plugin.name, child)
    this.logger.debug(`Created scope for plugin: ${plugin.name}`)
    return child
  }

  getPluginScope(pluginName: string): Container | undefined {
    return this.pluginContainers.get(pluginName)
  }

  async disposePlugin(pluginName: string): Promise<void> {
    const child = this.pluginContainers.get(pluginName)
    if (child) {
      await child.dispose()
      this.pluginContainers.delete(pluginName)
      this.logger.debug(`Disposed scope for plugin: ${pluginName}`)
    }
  }

  async disposeAll(): Promise<void> {
    for (const [name] of this.pluginContainers) {
      await this.disposePlugin(name)
    }
  }
}
