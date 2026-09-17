import type { Kernel } from '@forge/core'

export async function runDoctor(kernel: Kernel): Promise<void> {
  const report = await kernel.getHealthChecker().run()

  console.log('')
  console.log(`  Health Status: ${report.status}`)
  console.log('')

  for (const check of report.checks) {
    const icon = check.status === 'ok' ? '✔' : check.status === 'warning' ? '⚠' : '✘'
    console.log(`  ${icon} ${check.name}: ${check.message}`)
  }

  console.log('')
  console.log(`  Duration: ${report.duration.toFixed(0)}ms`)
  console.log('')
}
