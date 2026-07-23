import { describe, it, expect, vi } from 'vitest'
import { TaskRunner } from './task-runner.js'
import { Logger } from '../logging/logger.js'
import { EventBus } from '../events/event-bus.js'
import type { TaskDefinition } from './types.js'

function createRunner() {
  return new TaskRunner({
    logger: new Logger({ level: 'silent' }),
    bus: new EventBus(),
    config: {
      version: '1.0.0',
      cli: { verbosity: 'normal', outputFormat: 'text', autoComplete: true, telemetry: false },
      defaults: { language: 'typescript' },
      plugins: {},
      templates: { official: [], community: [] },
      custom: {},
      _resolvedFrom: ['defaults'],
    },
  })
}

function createTask(id: string, deps?: string[]): TaskDefinition {
  return {
    id,
    name: `Task ${id}`,
    dependencies: deps,
    execute: async () => ({ success: true, message: `Done ${id}` }),
  }
}

describe('TaskRunner', () => {
  it('should run a single task', async () => {
    const runner = createRunner()
    const report = await runner.runAll([createTask('a')])

    expect(report.success).toBe(true)
    expect(report.completedCount).toBe(1)
    expect(report.failedCount).toBe(0)
    expect(report.tasks[0]!.status).toBe('completed')
  })

  it('should run multiple independent tasks', async () => {
    const runner = createRunner()
    const report = await runner.runAll([createTask('a'), createTask('b'), createTask('c')])

    expect(report.success).toBe(true)
    expect(report.completedCount).toBe(3)
  })

  it('should respect dependencies', async () => {
    const runner = createRunner()
    const order: string[] = []

    const tasks: TaskDefinition[] = [
      {
        id: 'a',
        name: 'Task A',
        execute: async () => {
          order.push('a')
          return { success: true }
        },
      },
      {
        id: 'b',
        name: 'Task B',
        dependencies: ['a'],
        execute: async () => {
          order.push('b')
          return { success: true }
        },
      },
      {
        id: 'c',
        name: 'Task C',
        dependencies: ['b'],
        execute: async () => {
          order.push('c')
          return { success: true }
        },
      },
    ]

    const report = await runner.runAll(tasks)

    expect(report.success).toBe(true)
    expect(order).toEqual(['a', 'b', 'c'])
  })

  it('should handle task failures', async () => {
    const runner = createRunner()
    const tasks: TaskDefinition[] = [
      {
        id: 'a',
        name: 'Task A',
        execute: async () => {
          throw new Error('Task A failed')
        },
      },
    ]

    const report = await runner.runAll(tasks)

    expect(report.success).toBe(false)
    expect(report.failedCount).toBe(1)
    expect(report.tasks[0]!.status).toBe('failed')
  })

  it('should skip dependent tasks when dependency fails', async () => {
    const runner = createRunner()
    const tasks: TaskDefinition[] = [
      {
        id: 'a',
        name: 'Task A',
        execute: async () => {
          throw new Error('Failed')
        },
      },
      {
        id: 'b',
        name: 'Task B',
        dependencies: ['a'],
        execute: async () => ({ success: true }),
      },
    ]

    const report = await runner.runAll(tasks)

    expect(report.success).toBe(false)
    expect(report.tasks[0]!.status).toBe('failed')
    expect(report.tasks[1]!.status).toBe('skipped')
  })

  it('should retry failed tasks', async () => {
    const runner = createRunner()
    let attempts = 0

    const tasks: TaskDefinition[] = [
      {
        id: 'a',
        name: 'Task A',
        retry: { attempts: 3, delay: 10 },
        execute: async () => {
          attempts++
          if (attempts < 3) throw new Error('Not yet')
          return { success: true }
        },
      },
    ]

    const report = await runner.runAll(tasks)

    expect(report.success).toBe(true)
    expect(attempts).toBe(3)
  })

  it('should report total duration', async () => {
    const runner = createRunner()
    const report = await runner.runAll([createTask('a')])

    expect(report.totalDuration).toBeGreaterThanOrEqual(0)
  })
})
