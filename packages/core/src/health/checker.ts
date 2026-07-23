export interface HealthCheckResult {
  name: string
  status: 'ok' | 'warning' | 'error'
  message: string
  details?: Record<string, unknown>
}

export interface HealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: HealthCheckResult[]
  timestamp: Date
  duration: number
}

export type HealthCheckFn = () => Promise<HealthCheckResult> | HealthCheckResult

export class HealthChecker {
  private checks: Array<{ name: string; check: HealthCheckFn }> = []

  register(name: string, check: HealthCheckFn): void {
    this.checks.push({ name, check })
  }

  async run(): Promise<HealthReport> {
    const startTime = performance.now()
    const results: HealthCheckResult[] = []

    for (const { name, check } of this.checks) {
      try {
        const result = await check()
        results.push(result)
      } catch (error) {
        results.push({
          name,
          status: 'error',
          message: error instanceof Error ? error.message : String(error),
        })
      }
    }

    const hasError = results.some((r) => r.status === 'error')
    const hasWarning = results.some((r) => r.status === 'warning')

    return {
      status: hasError ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy',
      checks: results,
      timestamp: new Date(),
      duration: performance.now() - startTime,
    }
  }
}
