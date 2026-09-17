import { beforeEach, describe, expect, it } from 'vitest'
import { useConsoleCapture } from '../../testing/console.js'
import { createFakeKernel } from '../../testing/kernel.js'
import { runDoctor } from './index.js'

describe('doctor command', () => {
  let out: () => string

  beforeEach(() => {
    out = useConsoleCapture().output
  })

  it('prints the overall health status and every check', async () => {
    const kernel = createFakeKernel()
    const health = kernel.getHealthChecker()
    Object.defineProperty(kernel, 'getHealthChecker', {
      value: () => ({
        run: async () => ({
          status: 'degraded',
          duration: 42,
          checks: [
            { name: 'node-version', status: 'ok', message: 'Node.js v22.0.0' },
            { name: 'docker', status: 'warning', message: 'Docker is not installed' },
          ],
        }),
        register: () => {},
      }),
      configurable: true,
    })
    void health

    await runDoctor(kernel)

    const output = out()
    expect(output).toContain('Health Status: degraded')
    expect(output).toContain('node-version: Node.js v22.0.0')
    expect(output).toContain('docker: Docker is not installed')
    expect(output).toContain('Duration: 42ms')
  })

  it('marks unhealthy checks with a cross', async () => {
    const kernel = createFakeKernel()
    Object.defineProperty(kernel, 'getHealthChecker', {
      value: () => ({
        run: async () => ({
          status: 'unhealthy',
          duration: 5,
          checks: [{ name: 'disk-space', status: 'error', message: 'Disk full' }],
        }),
        register: () => {},
      }),
      configurable: true,
    })

    await runDoctor(kernel)

    expect(out()).toContain('disk-space: Disk full')
  })
})
