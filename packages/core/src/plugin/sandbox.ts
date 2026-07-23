import type { Logger } from '../logging/logger.js'

export interface SandboxOptions {
  logger: Logger
  maxMemory?: number
  maxCpuTime?: number
  allowedModules?: string[]
  blockedModules?: string[]
}

export interface SandboxResult {
  success: boolean
  result?: unknown
  error?: string
  duration: number
  memoryUsed?: number
}

export class PluginSandbox {
  private maxMemory: number
  private maxCpuTime: number
  private allowedModules: string[]
  private blockedModules: string[]

  constructor(options: SandboxOptions) {
    this.maxMemory = options.maxMemory ?? 128 * 1024 * 1024 // 128MB
    this.maxCpuTime = options.maxCpuTime ?? 30000 // 30s
    this.allowedModules = options.allowedModules ?? []
    this.blockedModules = options.blockedModules ?? ['child_process', 'worker_threads']
  }

  async execute<T>(fn: () => Promise<T> | T): Promise<SandboxResult> {
    const startTime = performance.now()
    const startMemory = process.memoryUsage().heapUsed

    try {
      // Check memory limits
      if (startMemory > this.maxMemory) {
        return {
          success: false,
          error: `Memory limit exceeded: ${(startMemory / 1024 / 1024).toFixed(1)}MB > ${(this.maxMemory / 1024 / 1024).toFixed(1)}MB`,
          duration: performance.now() - startTime,
        }
      }

      // Execute with timeout
      const result = await Promise.race([
        Promise.resolve(fn()),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Execution timed out after ${this.maxCpuTime}ms`)), this.maxCpuTime),
        ),
      ])

      const duration = performance.now() - startTime
      const memoryUsed = process.memoryUsage().heapUsed - startMemory

      return {
        success: true,
        result,
        duration,
        memoryUsed,
      }
    } catch (error) {
      const duration = performance.now() - startTime
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration,
      }
    }
  }

  isModuleAllowed(moduleName: string): boolean {
    if (this.blockedModules.includes(moduleName)) {
      return false
    }
    if (this.allowedModules.length > 0) {
      return this.allowedModules.includes(moduleName)
    }
    return true
  }
}
