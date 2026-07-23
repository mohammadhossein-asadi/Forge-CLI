export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'cancelled'

export interface TaskDefinition {
  id: string
  name: string
  description?: string
  dependencies?: string[]
  execute: (context: TaskContext) => Promise<TaskResult>
  timeout?: number
  retry?: { attempts: number; delay: number }
}

export interface TaskContext {
  logger: import('../logging/logger.js').Logger
  bus: import('../events/event-bus.js').EventBus
  config: import('@forge/shared').ResolvedConfig
  cwd: string
  abortSignal: AbortSignal
}

export interface TaskResult {
  success: boolean
  message?: string
  data?: unknown
}

export interface TaskState {
  id: string
  name: string
  status: TaskStatus
  startTime?: number
  endTime?: number
  duration?: number
  error?: Error
  result?: TaskResult
  attempts: number
}

export interface TaskReport {
  tasks: TaskState[]
  totalDuration: number
  success: boolean
  completedCount: number
  failedCount: number
  skippedCount: number
}
