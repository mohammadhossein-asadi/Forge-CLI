import { ForgeConfigSchema } from '@forge/shared'
import type { ForgeConfig } from '@forge/shared'

export { ForgeConfigSchema }
export type { ForgeConfig }

export function validateConfig(data: unknown): ForgeConfig {
  return ForgeConfigSchema.parse(data)
}

export function safeValidateConfig(data: unknown) {
  return ForgeConfigSchema.safeParse(data)
}
