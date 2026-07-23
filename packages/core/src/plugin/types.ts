import type { ForgePlugin, PluginCommand, PluginHook, PluginGenerator } from '@forge/shared'

export type { ForgePlugin }

export type PluginStatus = 'loading' | 'loaded' | 'active' | 'error' | 'disabled' | 'unloaded'

export interface PluginLoadResult {
  plugin: ForgePlugin
  source: string
  loadTime: number
  status: PluginStatus
}

export interface PluginValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface PluginEntry {
  name: string
  version: string
  status: PluginStatus
  source: string
  loadTime: number
  commands: PluginCommand[]
  hooks: PluginHook[]
  generators: PluginGenerator[]
  permissions: string[]
  dependencies: string[]
  error?: string
}

export interface PluginDependencyGraph {
  nodes: string[]
  edges: Array<{ from: string; to: string }>
  sorted: string[]
}
