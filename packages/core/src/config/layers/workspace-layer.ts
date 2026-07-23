import path from 'node:path'
import type { ForgeConfig } from '@forge/shared'
import type { ConfigLayer } from '../types.js'

export class WorkspaceConfigLayer implements ConfigLayer {
  name = 'workspace'
  priority = 30

  private workspaceRoot: string

  constructor(workspaceRoot?: string) {
    this.workspaceRoot = workspaceRoot ?? process.cwd()
  }

  async load(): Promise<Partial<ForgeConfig> | null> {
    const candidates = ['forge.toml', 'forge.config.toml', 'forge.json', '.forge/config.json']

    for (const candidate of candidates) {
      const filePath = path.join(this.workspaceRoot, candidate)
      try {
        const { readFile } = await import('node:fs/promises')
        const content = await readFile(filePath, 'utf-8')
        if (candidate.endsWith('.json')) {
          return JSON.parse(content) as Partial<ForgeConfig>
        }
        return JSON.parse(content) as Partial<ForgeConfig>
      } catch {
        continue
      }
    }

    return null
  }

  isPresent(): boolean {
    const candidates = ['forge.toml', 'forge.config.toml', 'forge.json', '.forge/config.json']
    try {
      const { existsSync } = require('node:fs') as typeof import('node:fs')
      return candidates.some((c) => existsSync(path.join(this.workspaceRoot, c)))
    } catch {
      return false
    }
  }

  getSource(): string {
    return this.workspaceRoot
  }
}
