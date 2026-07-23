import { deepMerge } from '@forge/shared'
import type { ForgeConfig, ResolvedConfig } from '@forge/shared'
import { validateConfig } from './schema.js'
import type { ConfigLayer } from './types.js'
import { DefaultsLayer } from './layers/defaults-layer.js'
import { GlobalConfigLayer } from './layers/global-layer.js'
import { UserConfigLayer } from './layers/user-layer.js'
import { WorkspaceConfigLayer } from './layers/workspace-layer.js'
import { ProjectConfigLayer } from './layers/project-layer.js'
import { EnvironmentLayer } from './layers/environment-layer.js'
import { FlagsLayer } from './layers/flags-layer.js'

export class ConfigResolver {
  private layers: ConfigLayer[]

  constructor(options?: { flags?: Record<string, unknown> }) {
    this.layers = [
      new DefaultsLayer(),
      new GlobalConfigLayer(),
      new UserConfigLayer(),
      new WorkspaceConfigLayer(),
      new ProjectConfigLayer(),
      new EnvironmentLayer(),
      new FlagsLayer(options?.flags),
    ]
  }

  async resolve(): Promise<ResolvedConfig> {
    let merged: Partial<ForgeConfig> = {}
    const resolvedFrom: string[] = []

    for (const layer of this.layers) {
      const layerConfig = await layer.load()
      if (layerConfig) {
        merged = deepMerge(merged, layerConfig)
        resolvedFrom.push(layer.name)
      }
    }

    const validated = validateConfig(merged)

    return {
      ...validated,
      _resolvedFrom: resolvedFrom,
    }
  }

  getLayer(name: string): ConfigLayer | undefined {
    return this.layers.find((l) => l.name === name)
  }

  getLayers(): ConfigLayer[] {
    return [...this.layers]
  }

  addLayer(layer: ConfigLayer): void {
    this.layers.push(layer)
    this.layers.sort((a, b) => a.priority - b.priority)
  }
}
