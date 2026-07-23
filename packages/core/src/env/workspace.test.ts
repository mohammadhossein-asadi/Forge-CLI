import { describe, it, expect } from 'vitest'
import { WorkspaceDetector } from './workspace.js'

describe('WorkspaceDetector', () => {
  const detector = new WorkspaceDetector()

  it('should detect current workspace', async () => {
    const workspace = await detector.detect()
    expect(workspace.root).toBeDefined()
    expect(workspace.type).toBeDefined()
    expect(Array.isArray(workspace.projects)).toBe(true)
    expect(typeof workspace.hasGit).toBe('boolean')
    expect(typeof workspace.hasPackageJson).toBe('boolean')
  })

  it('should detect Forge CLI workspace', async () => {
    const workspace = await detector.detect('C:\\Users\\MohammadHossein\\Desktop\\projects\\Forge-CLI')
    expect(workspace.root).toBe('C:\\Users\\MohammadHossein\\Desktop\\projects\\Forge-CLI')
    expect(workspace.hasPackageJson).toBe(true)
    // Forge CLI is a pnpm workspace
    expect(workspace.type).toBe('monorepo')
    expect(workspace.workspaceTool).toBe('pnpm')
  })
})
