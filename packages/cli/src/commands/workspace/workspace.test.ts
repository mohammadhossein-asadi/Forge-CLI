import { beforeEach, describe, expect, it } from 'vitest'
import { useConsoleCapture } from '../../testing/console.js'
import { createFakeKernel } from '../../testing/kernel.js'
import { runWorkspace } from './index.js'

describe('workspace command', () => {
  let out: () => string

  beforeEach(() => {
    out = useConsoleCapture().output
  })

  it('prints workspace root and type', async () => {
    await runWorkspace(createFakeKernel({ workspace: { root: '/repo', type: 'single' } }))

    const output = out()
    expect(output).toContain('Workspace')
    expect(output).toContain('Root: /repo')
    expect(output).toContain('Type: single')
  })

  it('lists every project inside a monorepo workspace', async () => {
    await runWorkspace(
      createFakeKernel({
        workspace: {
          root: '/repo',
          type: 'monorepo',
          projects: [
            { name: '@fixture/cli', path: '/repo/packages/cli' },
            { name: '@fixture/core', path: '/repo/packages/core' },
          ],
        },
      }),
    )

    const output = out()
    expect(output).toContain('Projects (2):')
    expect(output).toContain('@fixture/cli')
    expect(output).toContain('/repo/packages/core')
  })

  it('suggests forge create when the workspace has no projects', async () => {
    await runWorkspace(createFakeKernel({ workspace: { root: '/repo', type: 'single' } }))

    expect(out()).toContain('Create one with: forge create <project-name>')
  })
})
