import path from 'node:path'
import os from 'node:os'
import type { ForgeConfig } from '@forge/shared'
import type { ConfigLayer } from '../types.js'

export class UserConfigLayer implements ConfigLayer {
  name = 'user'
  priority = 20

  private configDir: string

  constructor() {
    const home = os.homedir()
    this.configDir = path.join(home, '.forge')
  }

  async load(): Promise<Partial<ForgeConfig> | null> {
    const candidates = ['config.toml', 'config.json', '.forge/config.toml', '.forge/config.json']
    const cwd = process.cwd()

    for (const candidate of candidates) {
      // Check home directory
      const homePath = path.join(this.configDir, candidate.replace('.forge/', ''))
      try {
        const { readFile } = await import('node:fs/promises')
        const content = await readFile(homePath, 'utf-8')
        if (candidate.endsWith('.json')) {
          return JSON.parse(content) as Partial<ForgeConfig>
        }
        return JSON.parse(content) as Partial<ForgeConfig>
      } catch {
        continue
      }
    }

    // Check for .forge directory in current working directory
    const localForgeDir = path.join(cwd, '.forge')
    try {
      const { access } = await import('node:fs/promises')
      await access(localForgeDir)
      return null // Will be handled by project layer
    } catch {
      return null
    }
  }

  isPresent(): boolean {
    try {
      const { existsSync } = require('node:fs') as typeof import('node:fs')
      return (
        existsSync(path.join(this.configDir, 'config.toml')) ||
        existsSync(path.join(this.configDir, 'config.json'))
      )
    } catch {
      return false
    }
  }

  getSource(): string {
    return this.configDir
  }
}
