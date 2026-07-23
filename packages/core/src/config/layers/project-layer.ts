import path from 'node:path'
import type { ForgeConfig } from '@forge/shared'
import type { ConfigLayer } from '../types.js'

export class ProjectConfigLayer implements ConfigLayer {
  name = 'project'
  priority = 40

  private projectRoot: string

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot ?? process.cwd()
  }

  async load(): Promise<Partial<ForgeConfig> | null> {
    const candidates = [
      'forge.toml',
      'forge.config.toml',
      'forge.json',
      '.forge/config.toml',
      '.forge/config.json',
    ]

    for (const candidate of candidates) {
      const filePath = path.join(this.projectRoot, candidate)
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
    const candidates = [
      'forge.toml',
      'forge.config.toml',
      'forge.json',
      '.forge/config.toml',
      '.forge/config.json',
    ]
    try {
      const { existsSync } = require('node:fs') as typeof import('node:fs')
      return candidates.some((c) => existsSync(path.join(this.projectRoot, c)))
    } catch {
      return false
    }
  }

  getSource(): string {
    return this.projectRoot
  }
}
