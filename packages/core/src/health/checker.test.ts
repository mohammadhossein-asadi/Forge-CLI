import { describe, it, expect } from 'vitest'
import { HealthChecker } from './checker.js'

describe('HealthChecker', () => {
  it('should run health checks', async () => {
    const checker = new HealthChecker()
    checker.register('test', () => ({
      name: 'test',
      status: 'ok',
      message: 'All good',
    }))

    const report = await checker.run()
    expect(report.status).toBe('healthy')
    expect(report.checks).toHaveLength(1)
    expect(report.checks[0]!.status).toBe('ok')
  })

  it('should detect warnings', async () => {
    const checker = new HealthChecker()
    checker.register('test', () => ({
      name: 'test',
      status: 'warning',
      message: 'Something is off',
    }))

    const report = await checker.run()
    expect(report.status).toBe('degraded')
  })

  it('should detect errors', async () => {
    const checker = new HealthChecker()
    checker.register('test', () => ({
      name: 'test',
      status: 'error',
      message: 'Something is broken',
    }))

    const report = await checker.run()
    expect(report.status).toBe('unhealthy')
  })

  it('should handle check failures gracefully', async () => {
    const checker = new HealthChecker()
    checker.register('test', () => {
      throw new Error('Check failed')
    })

    const report = await checker.run()
    expect(report.status).toBe('unhealthy')
    expect(report.checks[0]!.status).toBe('error')
  })

  it('should include duration', async () => {
    const checker = new HealthChecker()
    checker.register('test', () => ({
      name: 'test',
      status: 'ok',
      message: 'ok',
    }))

    const report = await checker.run()
    expect(report.duration).toBeGreaterThanOrEqual(0)
    expect(report.timestamp).toBeInstanceOf(Date)
  })

  it('should run multiple checks', async () => {
    const checker = new HealthChecker()
    checker.register('a', () => ({ name: 'a', status: 'ok', message: 'ok' }))
    checker.register('b', () => ({ name: 'b', status: 'warning', message: 'warn' }))
    checker.register('c', () => ({ name: 'c', status: 'ok', message: 'ok' }))

    const report = await checker.run()
    expect(report.checks).toHaveLength(3)
    expect(report.status).toBe('degraded')
  })
})
