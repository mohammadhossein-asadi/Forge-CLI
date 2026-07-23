import type { Logger } from '../logging/logger.js'
import type { EventBus } from '../events/event-bus.js'
import type { ResolvedConfig } from '@forge/shared'
import type { TaskDefinition, TaskContext, TaskState, TaskReport, TaskResult } from './types.js'

export interface TaskRunnerOptions {
  logger: Logger
  bus: EventBus
  config: ResolvedConfig
  cwd?: string
  maxConcurrent?: number
}

export class TaskRunner {
  private logger: Logger
  private bus: EventBus
  private config: ResolvedConfig
  private cwd: string
  private maxConcurrent: number

  constructor(options: TaskRunnerOptions) {
    this.logger = options.logger
    this.bus = options.bus
    this.config = options.config
    this.cwd = options.cwd ?? process.cwd()
    this.maxConcurrent = options.maxConcurrent ?? 4
  }

  async runAll(definitions: TaskDefinition[]): Promise<TaskReport> {
    const startTime = performance.now()
    const states = new Map<string, TaskState>()
    const results = new Map<string, TaskResult>()

    // Initialize states
    for (const def of definitions) {
      states.set(def.id, {
        id: def.id,
        name: def.name,
        status: 'pending',
        attempts: 0,
      })
    }

    const abortController = new AbortController()
    const context: TaskContext = {
      logger: this.logger,
      bus: this.bus,
      config: this.config,
      cwd: this.cwd,
      abortSignal: abortController.signal,
    }

    // Execute tasks respecting dependencies
    const completed = new Set<string>()
    const failed = new Set<string>()

    while (true) {
      // Mark tasks with failed dependencies as skipped
      for (const def of definitions) {
        const state = states.get(def.id)!
        if (state.status !== 'pending') continue
        const deps = def.dependencies ?? []
        if (deps.some((dep) => failed.has(dep))) {
          state.status = 'skipped'
          state.endTime = performance.now()
          state.duration = state.endTime - state.startTime!
          completed.add(def.id)
        }
      }

      // Find tasks whose dependencies are all completed
      const ready = definitions.filter((def) => {
        const state = states.get(def.id)!
        if (state.status !== 'pending') return false
        return (def.dependencies ?? []).every((dep) => completed.has(dep))
      })

      if (ready.length === 0) {
        // Check if any tasks are still running
        const running = [...states.values()].filter((s) => s.status === 'running')
        if (running.length === 0) break

        // Wait for a running task to finish
        await new Promise((r) => setTimeout(r, 100))
        continue
      }

      // Run ready tasks (respect concurrency limit)
      const toRun = ready.filter((def) => states.get(def.id)!.status === 'pending').slice(0, this.maxConcurrent)

      const promises = toRun.map(async (def) => {
        const state = states.get(def.id)!
        state.status = 'running'
        state.startTime = performance.now()
        state.attempts++

        this.logger.info(`Running: ${def.name}`)

        try {
          const result = await this.executeWithRetry(def, context)
          state.status = 'completed'
          state.result = result
          results.set(def.id, result)
          completed.add(def.id)
          this.logger.info(`Completed: ${def.name}`)
        } catch (error) {
          state.status = 'failed'
          state.error = error instanceof Error ? error : new Error(String(error))
          failed.add(def.id)
          this.logger.error(`Failed: ${def.name}: ${state.error.message}`)
        } finally {
          state.endTime = performance.now()
          state.duration = state.endTime - state.startTime!
        }
      })

      await Promise.all(promises)
    }

    const totalDuration = performance.now() - startTime
    const taskStates = [...states.values()]

    return {
      tasks: taskStates,
      totalDuration,
      success: failed.size === 0,
      completedCount: taskStates.filter((s) => s.status === 'completed').length,
      failedCount: taskStates.filter((s) => s.status === 'failed').length,
      skippedCount: taskStates.filter((s) => s.status === 'skipped').length,
    }
  }

  private async executeWithRetry(def: TaskDefinition, context: Context): Promise<TaskResult> {
    const maxAttempts = def.retry?.attempts ?? 1
    const delay = def.retry?.delay ?? 1000
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (def.timeout) {
          return await Promise.race([
            def.execute(context),
            new Promise<TaskResult>((_, reject) =>
              setTimeout(() => reject(new Error(`Task "${def.id}" timed out after ${def.timeout}ms`)), def.timeout),
            ),
          ])
        }
        return await def.execute(context)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (attempt < maxAttempts) {
          this.logger.debug(`Retry ${attempt}/${maxAttempts} for "${def.id}" in ${delay}ms`)
          await new Promise((r) => setTimeout(r, delay))
        }
      }
    }

    throw lastError
  }
}

type Context = import('./types.js').TaskContext
