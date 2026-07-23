import path from 'node:path'
import os from 'node:os'
import type { ForgeConfig } from '@forge/shared'
import type { ConfigLayer } from '../types.js'

export class GlobalConfigLayer implements ConfigLayer {
  name = 'global'
  priority = 10

  private configDir: string

  constructor() {
    const platform = os.platform()
    const home = os.homedir()

    if (platform === 'win32') {
      this.configDir = process.env.LOCALAPPDATA
        ? path.join(process.env.LOCALAPPDATA, 'forge')
        : path.join(home, 'AppData', 'Local', 'forge')
    } else if (platform === 'darwin') {
      this.configDir = path.join(home, 'Library', 'Application Support', 'forge')
    } else {
      this.configDir = process.env.XDG_CONFIG_HOME
        ? path.join(process.env.XDG_CONFIG_HOME, 'forge')
        : path.join(home, '.config', 'forge')
    }
  }

  async load(): Promise<Partial<ForgeConfig> | null> {
    const candidates = ['config.toml', 'config.json', 'config.yaml']
    for (const candidate of candidates) {
      const filePath = path.join(this.configDir, candidate)
      try {
        const { readFile } = await import('node:fs/promises')
        const content = await readFile(filePath, 'utf-8')
        if (candidate.endsWith('.json')) {
          return JSON.parse(content) as Partial<ForgeConfig>
        }
        // TOML and YAML parsing would be added here
        return JSON.parse(content) as Partial<ForgeConfig>
      } catch {
        continue
      }
    }
    return null
  }

  isPresent(): boolean {
    const { existsSync } = require('node:fs') as typeof import('node:fs')
    return existsSync(path.join(this.configDir, 'config.toml')) ||
      existsSync(path.join(this.configDir, 'config.json')) ||
      existsSync(path.join(this.configDir, 'config.yaml'))
  }

  getSource(): string {
    return this.configDir
  }
}
