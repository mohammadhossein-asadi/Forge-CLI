import type { ForgeConfig, ResolvedConfig } from '@forge/shared'

export interface ConfigLayer {
  name: string
  priority: number
  load(): Promise<Partial<ForgeConfig> | null>
  isPresent(): boolean
  getSource(): string
}

export type { ForgeConfig, ResolvedConfig }
