import { execSync } from 'node:child_process'
import type { Logger } from '../logging/logger.js'
import type { EventBus } from '../events/event-bus.js'
import type { BuildTool } from './detector.js'

export interface BuildOptions {
  tool?: string
  mode?: string
  args?: string[]
  env?: Record<string, string>
  cwd?: string
}

export interface BuildResult {
  success: boolean
  tool: string
  duration: number
  output?: string
  error?: string
}

export interface BuildRunnerOptions {
  logger: Logger
  bus: EventBus
}

export class BuildRunner {
  private logger: Logger
  private bus: EventBus

  constructor(options: BuildRunnerOptions) {
    this.logger = options.logger
    this.bus = options.bus
  }

  async run(tool: BuildTool, options: BuildOptions = {}): Promise<BuildResult> {
    const startTime = performance.now()
    const cwd = options.cwd ?? process.cwd()

    this.logger.info(`Building with ${tool.name}...`)

    // Build the command
    const cmd = this.buildCommand(tool, options)
    this.logger.debug(`Running: ${cmd}`)

    // Emit build started event
    await this.bus.emit('command:started', {
      commandId: 'build',
      args: { tool: tool.name, cmd },
      timestamp: Date.now(),
    })

    try {
      const output = execSync(cmd, {
        cwd,
        encoding: 'utf-8',
        timeout: 300000, // 5 minutes
        stdio: 'pipe',
        env: {
          ...process.env,
          NODE_ENV: options.mode ?? 'production',
          ...options.env,
        },
      })

      const duration = performance.now() - startTime

      this.logger.info(`Build completed in ${duration.toFixed(0)}ms`)

      // Emit build finished event
      await this.bus.emit('command:finished', {
        commandId: 'build',
        success: true,
        duration,
      })

      return {
        success: true,
        tool: tool.name,
        duration,
        output: output.trim(),
      }
    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      const stderr = (error as { stderr?: string }).stderr ?? ''

      this.logger.error(`Build failed: ${errorMessage}`)

      // Emit build error event
      await this.bus.emit('command:finished', {
        commandId: 'build',
        success: false,
        duration,
        error: errorMessage,
      })

      return {
        success: false,
        tool: tool.name,
        duration,
        error: errorMessage,
        output: stderr.trim() || errorMessage,
      }
    }
  }

  private buildCommand(tool: BuildTool, options: BuildOptions): string {
    const parts: string[] = [tool.command]

    // Add tool-specific args
    parts.push(...tool.args)

    // Add mode if supported
    if (options.mode && !tool.args.includes(options.mode)) {
      // Some tools use --mode, some use NODE_ENV
      if (['vite', 'nuxt'].includes(tool.name)) {
        parts.push('--mode', options.mode)
      }
    }

    // Add custom args
    if (options.args) {
      parts.push(...options.args)
    }

    return parts.join(' ')
  }
}
