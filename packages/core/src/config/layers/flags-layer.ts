import type { ForgeConfig } from '@forge/shared'
import type { ConfigLayer } from '../types.js'

export class FlagsLayer implements ConfigLayer {
  name = 'flags'
  priority = 60

  private flags: Record<string, unknown>

  constructor(flags?: Record<string, unknown>) {
    this.flags = flags ?? {}
  }

  async load(): Promise<Partial<ForgeConfig> | null> {
    if (Object.keys(this.flags).length === 0) return null

    const config: Record<string, unknown> = {}

    if (this.flags.theme) config.cli = { theme: this.flags.theme }
    if (this.flags.verbose) config.cli = { ...config.cli as object, verbosity: 'verbose' }
    if (this.flags.quiet) config.cli = { ...config.cli as object, verbosity: 'silent' }
    if (this.flags.json) config.cli = { ...config.cli as object, outputFormat: 'json' }

    return Object.keys(config).length > 0 ? (config as Partial<ForgeConfig>) : null
  }

  isPresent(): boolean {
    return Object.keys(this.flags).length > 0
  }

  getSource(): string {
    return 'cli-flags'
  }

  setFlags(flags: Record<string, unknown>): void {
    this.flags = flags
  }
}
