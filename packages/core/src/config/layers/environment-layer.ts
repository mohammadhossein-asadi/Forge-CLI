import type { ForgeConfig } from '@forge/shared'
import type { ConfigLayer } from '../types.js'

export class EnvironmentLayer implements ConfigLayer {
  name = 'environment'
  priority = 50

  async load(): Promise<Partial<ForgeConfig> | null> {
    const prefix = 'FORGE_'
    const config: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(process.env)) {
      if (!key.startsWith(prefix)) continue

      const configKey = key.slice(prefix.length).toLowerCase()
      const parts = configKey.split('_')

      let current: Record<string, unknown> = config
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]!
        if (!(part in current)) {
          current[part] = {}
        }
        current = current[part] as Record<string, unknown>
      }

      const lastPart = parts[parts.length - 1]!
      // Try to parse as JSON, fallback to string
      try {
        current[lastPart] = JSON.parse(value!)
      } catch {
        current[lastPart] = value
      }
    }

    return Object.keys(config).length > 0 ? (config as Partial<ForgeConfig>) : null
  }

  isPresent(): boolean {
    return Object.keys(process.env).some((key) => key.startsWith('FORGE_'))
  }

  getSource(): string {
    return 'environment'
  }
}
