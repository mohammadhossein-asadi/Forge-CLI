import type { Logger } from '../logging/logger.js'
import type { PluginEntry } from './types.js'
import { PluginInstaller } from './installer.js'

export interface PluginUpdate {
  name: string
  currentVersion: string
  latestVersion: string
  updateAvailable: boolean
}

export interface PluginUpdaterOptions {
  logger: Logger
  registryUrl?: string
  workspaceRoot?: string
  packageManager?: string
}

export interface UpdateResult {
  name: string
  previousVersion: string
  newVersion: string
  success: boolean
  duration: number
  error?: string
}

export class PluginUpdater {
  private logger: Logger
  private registryUrl: string
  private workspaceRoot: string
  private packageManager?: string
  private installer: PluginInstaller
  private updateCache = new Map<string, PluginUpdate>()
  private cacheExpiry = 5 * 60 * 1000 // 5 minutes
  private lastCheck = new Map<string, number>()

  constructor(options: PluginUpdaterOptions) {
    this.logger = options.logger
    this.registryUrl = options.registryUrl ?? 'https://registry.npmjs.org'
    this.workspaceRoot = options.workspaceRoot ?? process.cwd()
    this.packageManager = options.packageManager
    this.installer = new PluginInstaller()
  }

  // ─── Check for updates ───────────────────────────────────────

  async checkForUpdates(entries: PluginEntry[]): Promise<PluginUpdate[]> {
    const updates: PluginUpdate[] = []

    for (const entry of entries) {
      const update = await this.checkPlugin(entry)
      if (update.updateAvailable) {
        updates.push(update)
      }
    }

    return updates
  }

  async checkPlugin(entry: PluginEntry): Promise<PluginUpdate> {
    // Check cache
    const cached = this.updateCache.get(entry.name)
    const lastCheckTime = this.lastCheck.get(entry.name) ?? 0
    if (cached && Date.now() - lastCheckTime < this.cacheExpiry) {
      return cached
    }

    try {
      const response = await fetch(`${this.registryUrl}/${encodeURIComponent(entry.name)}/latest`)
      if (!response.ok) {
        return {
          name: entry.name,
          currentVersion: entry.version,
          latestVersion: entry.version,
          updateAvailable: false,
        }
      }

      const data = await response.json() as { version?: string }
      const latestVersion = data.version ?? entry.version
      const updateAvailable = this.isUpdateAvailable(entry.version, latestVersion)

      const update: PluginUpdate = {
        name: entry.name,
        currentVersion: entry.version,
        latestVersion,
        updateAvailable,
      }

      this.updateCache.set(entry.name, update)
      this.lastCheck.set(entry.name, Date.now())

      return update
    } catch (error) {
      this.logger.debug(`Failed to check update for ${entry.name}: ${error}`)
      return {
        name: entry.name,
        currentVersion: entry.version,
        latestVersion: entry.version,
        updateAvailable: false,
      }
    }
  }

  // ─── Update plugins ──────────────────────────────────────────

  async updatePlugin(name: string): Promise<UpdateResult> {
    const startTime = performance.now()

    this.logger.info(`Updating ${name}...`)

    try {
      // Get current version
      const currentVersion = await this.getInstalledVersion(name)

      // Install latest version
      const result = await this.installer.install({
        name,
        workspaceRoot: this.workspaceRoot,
        logger: this.logger,
        packageManager: this.packageManager,
      })

      if (!result.success) {
        return {
          name,
          previousVersion: currentVersion ?? 'unknown',
          newVersion: currentVersion ?? 'unknown',
          success: false,
          duration: performance.now() - startTime,
          error: result.error,
        }
      }

      // Clear cache for this plugin
      this.updateCache.delete(name)
      this.lastCheck.delete(name)

      const duration = performance.now() - startTime
      this.logger.info(`Updated ${name} to ${result.version} in ${duration.toFixed(0)}ms`)

      return {
        name,
        previousVersion: currentVersion ?? 'unknown',
        newVersion: result.version ?? currentVersion ?? 'unknown',
        success: true,
        duration,
      }
    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to update ${name}: ${errorMessage}`)

      return {
        name,
        previousVersion: 'unknown',
        newVersion: 'unknown',
        success: false,
        duration,
        error: errorMessage,
      }
    }
  }

  async updateAll(entries: PluginEntry[]): Promise<UpdateResult[]> {
    const results: UpdateResult[] = []

    // Check which ones have updates
    const updates = await this.checkForUpdates(entries)

    if (updates.length === 0) {
      this.logger.info('All plugins are up to date')
      return results
    }

    this.logger.info(`Found ${updates.length} plugin(s) with updates`)

    // Update each one
    for (const update of updates) {
      const result = await this.updatePlugin(update.name)
      results.push(result)
    }

    return results
  }

  // ─── Helpers ─────────────────────────────────────────────────

  private async getInstalledVersion(name: string): Promise<string | undefined> {
    try {
      const fs = await import('node:fs/promises')
      const path = await import('node:path')
      const pkgPath = path.join(this.workspaceRoot, 'node_modules', name, 'package.json')
      const content = await fs.readFile(pkgPath, 'utf-8')
      const pkg = JSON.parse(content) as { version?: string }
      return pkg.version
    } catch {
      return undefined
    }
  }

  private isUpdateAvailable(current: string, latest: string): boolean {
    const currentParts = current.split('.').map(Number)
    const latestParts = latest.split('.').map(Number)

    for (let i = 0; i < 3; i++) {
      const c = currentParts[i] ?? 0
      const l = latestParts[i] ?? 0
      if (l > c) return true
      if (l < c) return false
    }

    return false
  }

  clearCache(): void {
    this.updateCache.clear()
    this.lastCheck.clear()
  }
}
