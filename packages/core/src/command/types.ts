import type { CommandMetadata, CommandFlags, CommandArgs } from '@forge/shared'

export type { CommandMetadata, CommandFlags, CommandArgs }

export interface ParsedArgs {
  args: Record<string, unknown>
  flags: Record<string, unknown>
}

export interface CommandContext {
  config: import('@forge/shared').ResolvedConfig
  logger: import('../logging/logger.js').Logger
  bus: import('../events/event-bus.js').EventBus
  container: import('../container/container.js').Container
  cwd: string
}

export interface CommandResult {
  success: boolean
  message?: string
  data?: unknown
  exitCode?: number
}

export abstract class BaseCommand {
  static meta: CommandMetadata
  static flags: CommandFlags = {}
  static args: CommandArgs = {}

  constructor(protected context: CommandContext) {}

  async init?(_parsedArgs: ParsedArgs): Promise<void>
  abstract run(): Promise<CommandResult>
  async postRun?(): Promise<void>
  async cleanup?(): Promise<void>
  async handleError?(error: unknown): Promise<void>

  get config() {
    return this.context.config
  }
  get logger() {
    return this.context.logger
  }
  get bus() {
    return this.context.bus
  }
  get cwd() {
    return this.context.cwd
  }
}
