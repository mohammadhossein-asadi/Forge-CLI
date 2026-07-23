import { Kernel } from '@forge/core'

export async function runDoctor(kernel: Kernel): Promise<void> {
  const report = await kernel.getHealthChecker().run()
  const logger = kernel.getLogger()

  const statusIcon = report.status === 'healthy' ? '✔' : report.status === 'degraded' ? '⚠' : '✘'
  const statusColor = report.status === 'healthy' ? '#4ADE80' : report.status === 'degraded' ? '#FBBF24' : '#F87171'

  console.log('')
  console.log(`  Health Status: ${report.status}`)
  console.log('')

  for (const check of report.checks) {
    const icon = check.status === 'ok' ? '✔' : check.status === 'warning' ? '⚠' : '✘'
    const color = check.status === 'ok' ? '#4ADE80' : check.status === 'warning' ? '#FBBF24' : '#F87171'
    console.log(`  ${icon} ${check.name}: ${check.message}`)
  }

  console.log('')
  console.log(`  Duration: ${report.duration.toFixed(0)}ms`)
  console.log('')
}
