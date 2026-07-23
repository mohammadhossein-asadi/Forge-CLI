import fs from 'node:fs/promises'
import path from 'node:path'
import type { Logger } from '../logging/logger.js'

export interface ConfigWatcherOptions {
  logger: Logger
  cwd: string
  interval?: number
  configFiles?: string[]
}

export interface ConfigChange {
  file: string
  timestamp: Date
  previousHash: string
  currentHash: string
}

export class ConfigWatcher {
  private logger: Logger
  private cwd: string
  private interval: number
  private configFiles: string[]
  private fileHashes = new Map<string, string>()
  private watchers: Set<(change: ConfigChange) => void> = new Set()
  private watchInterval?: ReturnType<typeof setInterval>
  private running = false

  constructor(options: ConfigWatcherOptions) {
    this.logger = options.logger
    this.cwd = options.cwd
    this.interval = options.interval ?? 3000
    this.configFiles = options.configFiles ?? [
      'forge.config.json',
      'forge.config.toml',
      'forge.config.yaml',
      '.forge/config.json',
      'package.json',
    ]
  }

  start(): void {
    if (this.running) return
    this.running = true

    this.watchInterval = setInterval(async () => {
      await this.check()
    }, this.interval)

    this.logger.debug(`Config watcher started (interval: ${this.interval}ms)`)
  }

  stop(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval)
      this.watchInterval = undefined
    }
    this.running = false
    this.logger.debug('Config watcher stopped')
  }

  onChange(callback: (change: ConfigChange) => void): () => void {
    this.watchers.add(callback)
    return () => {
      this.watchers.delete(callback)
    }
  }

  private async check(): Promise<void> {
    for (const configFile of this.configFiles) {
      const filePath = path.resolve(this.cwd, configFile)
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        const hash = this.simpleHash(content)
        const previous = this.fileHashes.get(filePath)

        if (previous && previous !== hash) {
          const change: ConfigChange = {
            file: configFile,
            timestamp: new Date(),
            previousHash: previous,
            currentHash: hash,
          }

          this.fileHashes.set(filePath, hash)
          this.notifyWatchers(change)
        } else {
          this.fileHashes.set(filePath, hash)
        }
      } catch {
        // File doesn't exist or can't be read, skip
      }
    }
  }

  private notifyWatchers(change: ConfigChange): void {
    for (const watcher of this.watchers) {
      try {
        watcher(change)
      } catch (error) {
        this.logger.error(`Config watcher callback error: ${error}`)
      }
    }
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  isWatching(): boolean {
    return this.running
  }

  getTrackedFiles(): string[] {
    return [...this.configFiles]
  }
}
