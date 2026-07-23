import type { ForgeConfig } from '@forge/shared'
import type { ConfigLayer } from '../types.js'

export class DefaultsLayer implements ConfigLayer {
  name = 'defaults'
  priority = 0

  async load(): Promise<Partial<ForgeConfig> | null> {
    return {
      version: '1.0.0',
      cli: {
        verbosity: 'normal',
        outputFormat: 'text',
        autoComplete: true,
        telemetry: false,
      },
      defaults: {
        language: 'typescript',
      },
      plugins: {},
      templates: {
        official: [],
        community: [],
      },
      custom: {},
    }
  }

  isPresent(): boolean {
    return true
  }

  getSource(): string {
    return 'defaults'
  }
}
