import { spawn, type ChildProcess } from 'node:child_process'
import type { Logger } from '../logging/logger.js'
import type { EventBus } from '../events/event-bus.js'
import type { DevTool } from './detector.js'

export interface DevOptions {
  tool?: string
  port?: number
  args?: string[]
  env?: Record<string, string>
  cwd?: string
}

export interface DevResult {
  success: boolean
  tool: string
  port?: number
  duration: number
  error?: string
  process?: ChildProcess
}

export interface DevRunnerOptions {
  logger: Logger
  bus: EventBus
}

export class DevRunner {
  private logger: Logger
  private bus: EventBus
  private process: ChildProcess | null = null

  constructor(options: DevRunnerOptions) {
    this.logger = options.logger
    this.bus = options.bus
  }

  async run(tool: DevTool, options: DevOptions = {}): Promise<DevResult> {
    const startTime = performance.now()
    const cwd = options.cwd ?? process.cwd()
    const port = options.port ?? tool.port

    this.logger.info(`Starting dev server with ${tool.name}...`)

    // Build the command
    const cmd = this.buildCommand(tool, options, port)
    this.logger.debug(`Running: ${cmd}`)

    // Emit dev started event
    await this.bus.emit('command:started', {
      commandId: 'dev',
      args: { tool: tool.name, cmd, port },
      timestamp: Date.now(),
    })

    try {
      // Split command into parts
      const parts = cmd.split(' ')
      const command = parts[0]!
      const args = parts.slice(1)

      // Spawn the process
      this.process = spawn(command, args, {
        cwd,
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'development',
          PORT: String(port ?? 3000),
          ...options.env,
        },
        shell: true,
      })

      this.process.on('error', (error) => {
        this.logger.error(`Dev server error: ${error.message}`)
      })

      this.process.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          this.logger.warn(`Dev server exited with code ${code}`)
        }
        this.process = null
      })

      // Wait a bit to check if the process started successfully
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (this.process && !this.process.killed) {
        const duration = performance.now() - startTime
        this.logger.info(`Dev server started on port ${port ?? 'default'}`)

        // Emit dev ready event
        await this.bus.emit('command:finished', {
          commandId: 'dev',
          success: true,
          duration,
        })

        return {
          success: true,
          tool: tool.name,
          port,
          duration,
          process: this.process,
        }
      } else {
        throw new Error('Dev server failed to start')
      }
    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      this.logger.error(`Failed to start dev server: ${errorMessage}`)

      await this.bus.emit('command:finished', {
        commandId: 'dev',
        success: false,
        duration,
        error: errorMessage,
      })

      return {
        success: false,
        tool: tool.name,
        duration,
        error: errorMessage,
      }
    }
  }

  stop(): void {
    if (this.process && !this.process.killed) {
      this.logger.info('Stopping dev server...')
      this.process.kill('SIGTERM')

      // Force kill after 5 seconds
      setTimeout(() => {
        if (this.process && !this.process.killed) {
          this.process.kill('SIGKILL')
        }
      }, 5000)
    }
  }

  isRunning(): boolean {
    return this.process !== null && !this.process.killed
  }

  private buildCommand(tool: DevTool, options: DevOptions, port?: number): string {
    const parts: string[] = [tool.command]
    parts.push(...tool.args)

    // Add port if supported
    if (port && !tool.args.includes('--port') && !tool.args.includes('-p')) {
      if (['vite', 'next', 'nuxt', 'astro'].includes(tool.name)) {
        parts.push('--port', String(port))
      }
    }

    // Add custom args
    if (options.args) {
      parts.push(...options.args)
    }

    return parts.join(' ')
  }
}
