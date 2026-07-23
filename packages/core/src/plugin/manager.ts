import fs from 'node:fs/promises'
import path from 'node:path'
import type { ForgePlugin, PluginCommand, PluginHook, PluginGenerator } from '@forge/shared'
import type { Logger } from '../logging/logger.js'
import type { PluginLoadResult, PluginEntry, PluginDependencyGraph, PluginStatus } from './types.js'
import { PluginRuntime } from './runtime.js'
import { Container } from '../container/container.js'

export interface PluginManagerOptions {
  logger: Logger
  pluginDirs?: string[]
  workspaceRoot?: string
  enabledPlugins?: string[]
  disabledPlugins?: string[]
}

export class PluginManager {
  private logger: Logger
  private pluginDirs: string[]
  private workspaceRoot: string
  private loadedPlugins = new Map<string, PluginLoadResult>()
  private pluginEntries = new Map<string, PluginEntry>()
  private runtime: PluginRuntime
  private enabledPlugins: Set<string>
  private disabledPlugins: Set<string>
  private allCommands: PluginCommand[] = []
  private allHooks: PluginHook[] = []
  private allGenerators: PluginGenerator[] = []

  constructor(options: PluginManagerOptions) {
    this.logger = options.logger
    this.pluginDirs = options.pluginDirs ?? []
    this.workspaceRoot = options.workspaceRoot ?? process.cwd()
    this.enabledPlugins = new Set(options.enabledPlugins ?? [])
    this.disabledPlugins = new Set(options.disabledPlugins ?? [])
    this.runtime = new PluginRuntime({
      parentContainer: new Container(),
      logger: this.logger,
    })
  }

  // ─── Loading ─────────────────────────────────────────────────

  async loadAll(): Promise<PluginLoadResult[]> {
    const results: PluginLoadResult[] = []

    // 1. Load from configured directories
    for (const dir of this.pluginDirs) {
      const plugins = await this.loadFromDirectory(dir)
      results.push(...plugins)
    }

    // 2. Discover from node_modules
    const discovered = await this.discoverFromNodeModules()
    results.push(...discovered)

    // 3. Sort by dependency order
    const pluginNames = discovered.map((r) => r.plugin.name)
    const sorted = this.topologicalSort(pluginNames)

    // 4. Initialize plugins in dependency order
    for (const name of sorted) {
      const result = results.find((r) => r.plugin.name === name)
      if (!result) continue

      if (this.disabledPlugins.has(name)) {
        result.status = 'disabled'
        this.logger.debug(`Plugin "${name}" is disabled, skipping`)
        continue
      }

      try {
        // Create isolated scope
        this.runtime.createPluginScope(result.plugin)

        // Run setup
        if (result.plugin.setup) {
          const ctx: Parameters<NonNullable<ForgePlugin['setup']>>[0] = {
            plugin: result.plugin,
            config: {},
            workspace: this.workspaceRoot,
            logger: this.logger.child(result.plugin.name),
            emit: async () => {},
            registerCommand: (cmd) => this.allCommands.push(cmd),
            registerHook: (hook) => this.allHooks.push(hook),
            registerGenerator: (gen) => this.allGenerators.push(gen),
          }
          await result.plugin.setup(ctx)
        }

        // Collect commands, hooks, generators
        if (result.plugin.commands) {
          this.allCommands.push(...result.plugin.commands)
        }
        if (result.plugin.hooks) {
          this.allHooks.push(...result.plugin.hooks)
        }
        if (result.plugin.generators) {
          this.allGenerators.push(...result.plugin.generators)
        }

        result.status = 'loaded'
        this.loadedPlugins.set(name, result)

        // Create entry
        this.pluginEntries.set(name, {
          name: result.plugin.name,
          version: result.plugin.version,
          status: 'loaded',
          source: result.source,
          loadTime: result.loadTime,
          commands: result.plugin.commands ?? [],
          hooks: result.plugin.hooks ?? [],
          generators: result.plugin.generators ?? [],
          permissions: (result.plugin.metadata?.permissions as string[]) ?? [],
          dependencies: (result.plugin.metadata?.dependencies as string[]) ?? [],
        })

        this.logger.debug(`Loaded plugin: ${name}@${result.plugin.version}`)
      } catch (error) {
        result.status = 'error'
        this.loadedPlugins.set(name, result)
        this.logger.error(`Failed to initialize plugin "${name}": ${error}`)
      }
    }

    this.logger.debug(`Loaded ${results.length} plugins, ${this.allCommands.length} commands, ${this.allHooks.length} hooks, ${this.allGenerators.length} generators`)
    return results
  }

  async loadByName(name: string): Promise<ForgePlugin | null> {
    if (this.loadedPlugins.has(name)) {
      return this.loadedPlugins.get(name)!.plugin
    }

    try {
      const pluginPath = path.resolve(this.workspaceRoot, 'node_modules', name)
      const startTime = performance.now()
      const mod = await import(pluginPath)
      const plugin = mod.default ?? mod
      const loadTime = performance.now() - startTime

      if (this.isValidPlugin(plugin)) {
        const result: PluginLoadResult = {
          plugin: plugin as ForgePlugin,
          source: pluginPath,
          loadTime,
          status: 'loaded',
        }
        this.loadedPlugins.set(name, result)
        return plugin as ForgePlugin
      }
    } catch (error) {
      this.logger.debug(`Failed to load plugin "${name}": ${error}`)
    }

    return null
  }

  // ─── Accessors ───────────────────────────────────────────────

  getLoadedPlugins(): PluginLoadResult[] {
    return [...this.loadedPlugins.values()]
  }

  getPlugin(name: string): ForgePlugin | undefined {
    return this.loadedPlugins.get(name)?.plugin
  }

  getEntry(name: string): PluginEntry | undefined {
    return this.pluginEntries.get(name)
  }

  getAllEntries(): PluginEntry[] {
    return [...this.pluginEntries.values()]
  }

  getCommands(): PluginCommand[] {
    return [...this.allCommands]
  }

  getHooks(): PluginHook[] {
    return [...this.allHooks]
  }

  getGenerators(): PluginGenerator[] {
    return [...this.allGenerators]
  }

  getCommandsByCategory(category: string): PluginCommand[] {
    return this.allCommands.filter((cmd) => cmd.category === category)
  }

  getHooksByEvent(event: string): PluginHook[] {
    return this.allHooks.filter((hook) => hook.event === event)
  }

  // ─── Status Management ───────────────────────────────────────

  isEnabled(name: string): boolean {
    return !this.disabledPlugins.has(name)
  }

  enable(name: string): void {
    this.disabledPlugins.delete(name)
    this.enabledPlugins.add(name)
  }

  disable(name: string): void {
    this.enabledPlugins.delete(name)
    this.disabledPlugins.add(name)
  }

  setStatus(name: string, status: PluginStatus): void {
    const entry = this.pluginEntries.get(name)
    if (entry) {
      entry.status = status
    }
  }

  // ─── Unloading ───────────────────────────────────────────────

  async unload(name: string): Promise<void> {
    const result = this.loadedPlugins.get(name)
    if (result) {
      try {
        if (result.plugin.teardown) {
          await result.plugin.teardown()
        }
        await this.runtime.disposePlugin(name)
      } catch (error) {
        this.logger.error(`Error unloading plugin "${name}": ${error}`)
      }

      // Remove commands, hooks, generators
      this.allCommands = this.allCommands.filter((cmd) => !result.plugin.commands?.some((pc) => pc.id === cmd.id))
      this.allHooks = this.allHooks.filter((hook) => !result.plugin.hooks?.some((ph) => ph.event === hook.event && ph.handler === hook.handler))
      this.allGenerators = this.allGenerators.filter((gen) => !result.plugin.generators?.some((pg) => pg.id === gen.id))

      this.loadedPlugins.delete(name)
      this.pluginEntries.delete(name)
      this.logger.debug(`Unloaded plugin: ${name}`)
    }
  }

  async unloadAll(): Promise<void> {
    for (const [name] of this.loadedPlugins) {
      await this.unload(name)
    }
  }

  // ─── Dependency Resolution ───────────────────────────────────

  getDependencyGraph(): PluginDependencyGraph {
    const nodes: string[] = []
    const edges: Array<{ from: string; to: string }> = []

    for (const [name, entry] of this.pluginEntries) {
      nodes.push(name)
      for (const dep of entry.dependencies) {
        edges.push({ from: name, to: dep })
      }
    }

    const sorted = this.topologicalSort(nodes)

    return { nodes, edges, sorted }
  }

  private topologicalSort(names: string[]): string[] {
    const visited = new Set<string>()
    const result: string[] = []

    const visit = (name: string) => {
      if (visited.has(name)) return
      visited.add(name)

      const entry = this.pluginEntries.get(name)
      if (entry) {
        for (const dep of entry.dependencies) {
          visit(dep)
        }
      }
      result.push(name)
    }

    for (const name of names) {
      visit(name)
    }

    return result
  }

  // ─── Internal ────────────────────────────────────────────────

  private async loadFromDirectory(dir: string): Promise<PluginLoadResult[]> {
    const results: PluginLoadResult[] = []
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory() || entry.name.endsWith('.js') || entry.name.endsWith('.ts')) {
          const pluginPath = path.join(dir, entry.name)
          try {
            const startTime = performance.now()
            const mod = await import(pluginPath)
            const plugin = mod.default ?? mod
            const loadTime = performance.now() - startTime

            if (this.isValidPlugin(plugin)) {
              results.push({
                plugin: plugin as ForgePlugin,
                source: pluginPath,
                loadTime,
                status: 'loading',
              })
            }
          } catch (error) {
            this.logger.debug(`Failed to load from ${pluginPath}: ${error}`)
          }
        }
      }
    } catch (error) {
      this.logger.debug(`Failed to read directory ${dir}: ${error}`)
    }
    return results
  }

  private async discoverFromNodeModules(): Promise<PluginLoadResult[]> {
    const results: PluginLoadResult[] = []
    const nodeModulesDir = path.join(this.workspaceRoot, 'node_modules')

    try {
      const entries = await fs.readdir(nodeModulesDir, { withFileTypes: true })
      for (const entry of entries) {
        if (!entry.isDirectory()) continue
        if (entry.name.startsWith('.')) continue

        if (!entry.name.startsWith('@forge/plugin-') && !entry.name.startsWith('forge-plugin-')) continue

        const pluginPath = path.join(nodeModulesDir, entry.name)
        try {
          const manifestPath = path.join(pluginPath, 'package.json')
          const manifestContent = await fs.readFile(manifestPath, 'utf-8')
          const manifest = JSON.parse(manifestContent) as Record<string, unknown>

          if (manifest.forge) {
            const entryFile = (manifest.forge as Record<string, unknown>).entry as string
            if (entryFile) {
              const startTime = performance.now()
              const mod = await import(path.join(pluginPath, entryFile))
              const plugin = mod.default ?? mod
              const loadTime = performance.now() - startTime

              if (this.isValidPlugin(plugin)) {
                results.push({
                  plugin: plugin as ForgePlugin,
                  source: pluginPath,
                  loadTime,
                  status: 'loading',
                })
              }
            }
          }
        } catch (error) {
          this.logger.debug(`Failed to discover plugin ${entry.name}: ${error}`)
        }
      }
    } catch {
      // node_modules doesn't exist, that's fine
    }

    return results
  }

  private isValidPlugin(obj: unknown): boolean {
    if (typeof obj !== 'object' || obj === null) return false
    const plugin = obj as Record<string, unknown>
    return typeof plugin.name === 'string' && typeof plugin.version === 'string'
  }
}
