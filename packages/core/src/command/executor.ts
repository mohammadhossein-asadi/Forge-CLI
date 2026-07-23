import type { ResolvedConfig } from '@forge/shared'
import { ErrorCode } from '@forge/shared'
import { ForgeError } from '../error/forge-error.js'
import type { Logger } from '../logging/logger.js'
import type { EventBus } from '../events/event-bus.js'
import type { Container } from '../container/container.js'
import type { HookRunner } from '../hooks/hook-runner.js'
import type { CommandRegistry } from './registry.js'
import type { CommandContext, CommandResult } from './types.js'

export interface CommandExecutorOptions {
  registry: CommandRegistry
  container: Container
  bus: EventBus
  hookRunner: HookRunner
  logger: Logger
  config: ResolvedConfig
}

export class CommandExecutor {
  private registry: CommandRegistry
  private container: Container
  private bus: EventBus
  private hookRunner: HookRunner
  private logger: Logger
  private config: ResolvedConfig

  constructor(options: CommandExecutorOptions) {
    this.registry = options.registry
    this.container = options.container
    this.bus = options.bus
    this.hookRunner = options.hookRunner
    this.logger = options.logger
    this.config = options.config
  }

  async execute(commandId: string, rawArgs: Record<string, unknown>): Promise<CommandResult> {
    const startTime = performance.now()

    // 1. Resolve command
    const registration = this.registry.resolve(commandId)
    if (!registration) {
      throw new ForgeError({
        code: ErrorCode.COMMAND_NOT_FOUND,
        title: 'Command not found',
        message: `Command "${commandId}" does not exist.`,
        severity: 'error',
        category: 'command',
        recovery: [
          'Run "forge --help" to see available commands',
          'Check the command name for typos',
        ],
      })
    }

    // 2. Create command context
    const context: CommandContext = {
      config: this.config,
      logger: this.logger.child(commandId),
      bus: this.bus,
      container: this.container,
      cwd: process.cwd(),
    }

    // 3. Create command instance
    const command = new registration.commandClass(context)

    // 4. Fire prerun hooks
    await this.hookRunner.run('command:prerun', {
      commandId,
      args: rawArgs,
    })

    // 5. Emit started event
    await this.bus.emit('command:started', {
      commandId,
      args: rawArgs as Record<string, unknown>,
      timestamp: Date.now(),
    })

    try {
      // 6. Init if available
      if (command.init) {
        await command.init({ args: {}, flags: rawArgs })
      }

      // 7. Execute command
      const result = await command.run()

      // 8. Post-run if available
      if (command.postRun) {
        await command.postRun()
      }

      // 9. Fire postrun hooks
      await this.hookRunner.run('command:postrun', {
        commandId,
        success: true,
      })

      // 10. Emit finished event
      await this.bus.emit('command:finished', {
        commandId,
        success: true,
        duration: performance.now() - startTime,
      })

      return result
    } catch (error) {
      // Handle error
      if (command.handleError) {
        await command.handleError(error)
      }

      await this.hookRunner.run('command:error', {
        commandId,
        error,
      })

      await this.bus.emit('command:error', {
        commandId,
        error: error instanceof Error ? error : new Error(String(error)),
      })

      await this.bus.emit('command:finished', {
        commandId,
        success: false,
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      })

      throw error
    } finally {
      // 11. Cleanup (always runs)
      if (command.cleanup) {
        await command.cleanup()
      }
    }
  }
}
