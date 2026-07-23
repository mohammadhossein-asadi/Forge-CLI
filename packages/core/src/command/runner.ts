import { CLI_VERSION, CLI_NAME } from '@forge/shared'
import { Kernel } from '../kernel.js'
import { ForgeError } from '../error/forge-error.js'
import type { CommandRegistry } from './registry.js'
import { HelpFormatter } from './help.js'

export interface RunnerOptions {
  verbose?: boolean
  quiet?: boolean
  json?: boolean
  noColor?: boolean
}

export interface CommandAction {
  (kernel: Kernel, args: Record<string, unknown>, flags: Record<string, unknown>): Promise<void>
}

export class CLIRunner {
  private kernel?: Kernel
  private options: RunnerOptions
  private startTime: number

  constructor(options: RunnerOptions = {}) {
    this.options = options
    this.startTime = performance.now()
  }

  async run(commandFn: () => Promise<void>): Promise<void> {
    try {
      await commandFn()
    } catch (error) {
      this.handleError(error)
    } finally {
      if (this.kernel) {
        await this.kernel.shutdown().catch(() => {})
      }
    }
  }

  async withKernel<T>(fn: (kernel: Kernel) => Promise<T>): Promise<T> {
    this.kernel = new Kernel({
      verbose: this.options.verbose,
      quiet: this.options.quiet,
      json: this.options.json,
    })

    await this.kernel.bootstrap()

    try {
      return await fn(this.kernel)
    } finally {
      await this.kernel.shutdown().catch(() => {})
    }
  }

  showVersion(): void {
    console.log(CLI_VERSION)
  }

  showHelp(registry: CommandRegistry): void {
    const formatter = new HelpFormatter({
      programName: CLI_NAME,
      version: CLI_VERSION,
      description: 'Forge CLI — a next-generation AI-native developer platform',
    })

    const commands = registry.list()
    console.log(formatter.formatRootHelp(commands))
  }

  showCommandHelp(registry: CommandRegistry, commandId: string): void {
    const formatter = new HelpFormatter({
      programName: CLI_NAME,
      version: CLI_VERSION,
      description: 'Forge CLI — a next-generation AI-native developer platform',
    })

    const registration = registry.resolve(commandId)
    if (!registration) {
      console.error(`Unknown command: ${commandId}`)
      console.error(`Run "${CLI_NAME} --help" to see available commands.`)
      process.exit(1)
    }

    console.log(formatter.formatCommandHelp(registration))
  }

  private handleError(error: unknown): void {
    if (error instanceof ForgeError) {
      console.error(error.toFormattedString())
      if (this.options.verbose && error.cause) {
        console.error('\nCaused by:', error.cause.message)
        if (error.cause.stack) {
          console.error(error.cause.stack)
        }
      }
    } else if (error instanceof Error) {
      console.error(`Error: ${error.message}`)
      if (this.options.verbose && error.stack) {
        console.error(error.stack)
      }
    } else {
      console.error('An unexpected error occurred:', error)
    }

    process.exit(1)
  }

  getDuration(): number {
    return performance.now() - this.startTime
  }
}
