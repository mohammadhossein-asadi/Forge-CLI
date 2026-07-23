import { z } from 'zod'

export const ForgeConfigSchema = z.object({
  version: z.string().default('1.0.0'),

  cli: z
    .object({
      theme: z.string().optional(),
      verbosity: z.enum(['silent', 'normal', 'verbose', 'debug', 'trace']).default('normal'),
      outputFormat: z.enum(['text', 'json', 'both']).default('text'),
      autoComplete: z.boolean().default(true),
      telemetry: z.boolean().default(false),
    })
    .default({}),

  defaults: z
    .object({
      packageManager: z.enum(['npm', 'yarn', 'pnpm', 'bun']).optional(),
      framework: z.string().optional(),
      language: z.enum(['typescript', 'javascript']).default('typescript'),
      testing: z.string().optional(),
      linting: z.string().optional(),
      styling: z.string().optional(),
    })
    .default({}),

  plugins: z.record(z.string(), z.record(z.unknown())).default({}),

  templates: z
    .object({
      registry: z.string().optional(),
      official: z.array(z.string()).default([]),
      community: z.array(z.string()).default([]),
    })
    .default({}),

  custom: z.record(z.unknown()).default({}),
})

export type ForgeConfig = z.infer<typeof ForgeConfigSchema>
export type ResolvedConfig = ForgeConfig & {
  _resolvedFrom: string[]
}
