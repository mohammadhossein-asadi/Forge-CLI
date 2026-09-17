import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { WorkspaceDetector } from './workspace.js'

describe('WorkspaceDetector', () => {
  const detector = new WorkspaceDetector()
  const tempDirs: string[] = []

  afterEach(async () => {
    for (const dir of tempDirs.splice(0)) {
      await fs.rm(dir, { recursive: true, force: true })
    }
  })

  async function createTempWorkspace(): Promise<string> {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'forge-ws-'))
    tempDirs.push(dir)
    return dir
  }

  async function writeJson(dir: string, file: string, data: unknown): Promise<void> {
    await fs.writeFile(path.join(dir, file), JSON.stringify(data), 'utf-8')
  }

  it('should detect current workspace', async () => {
    const workspace = await detector.detect()
    expect(workspace.root).toBeDefined()
    expect(workspace.type).toBeDefined()
    expect(Array.isArray(workspace.projects)).toBe(true)
    expect(typeof workspace.hasGit).toBe('boolean')
    expect(typeof workspace.hasPackageJson).toBe('boolean')
  })

  it('should detect a pnpm monorepo and its projects', async () => {
    const root = await createTempWorkspace()
    await writeJson(root, 'package.json', {
      name: 'fixture-monorepo',
      pnpm: { packages: ['packages/*'] },
    })
    await fs.writeFile(path.join(root, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"\n')
    await fs.mkdir(path.join(root, 'packages', 'shared'), { recursive: true })
    await fs.mkdir(path.join(root, 'packages', 'cli'), { recursive: true })
    await writeJson(path.join(root, 'packages', 'shared'), 'package.json', { name: '@fixture/shared' })
    await writeJson(path.join(root, 'packages', 'cli'), 'package.json', { name: '@fixture/cli' })

    const workspace = await detector.detect(root)

    expect(workspace.root).toBe(root)
    expect(workspace.hasPackageJson).toBe(true)
    expect(workspace.type).toBe('monorepo')
    expect(workspace.workspaceTool).toBe('pnpm')
    expect(workspace.projects.map((p) => p.name).sort()).toEqual(['@fixture/cli', '@fixture/shared'])
  })

  it('should detect a single project with framework and language', async () => {
    const root = await createTempWorkspace()
    await writeJson(root, 'package.json', {
      name: '@fixture/single',
      devDependencies: { react: '^18.3.0' },
    })
    await fs.writeFile(path.join(root, 'tsconfig.json'), '{}')

    const workspace = await detector.detect(root)

    expect(workspace.root).toBe(root)
    expect(workspace.type).toBe('single')
    expect(workspace.projects).toHaveLength(1)
    expect(workspace.projects[0]?.name).toBe('@fixture/single')
    expect(workspace.projects[0]?.framework).toBe('react')
    expect(workspace.projects[0]?.language).toBe('typescript')
  })
})
