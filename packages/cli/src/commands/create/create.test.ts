import { beforeEach, describe, expect, it } from 'vitest'
import { useConsoleCapture } from '../../testing/console.js'
import { createFakeKernel } from '../../testing/kernel.js'
import { runCreate } from './index.js'

describe('create command', () => {
  let out: () => string

  beforeEach(() => {
    out = useConsoleCapture().output
  })

  it('prints available templates grouped by category when no name is given', async () => {
    await runCreate(createFakeKernel(), undefined)

    const output = out()
    expect(output).toContain('Available templates:')
    for (const template of ['react', 'nextjs', 'vue', 'node', 'library', 'empty']) {
      expect(output).toContain(template)
    }
    expect(output).toContain('Usage: forge create <project-name> --template <template>')
  })
})
