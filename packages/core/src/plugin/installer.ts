import { execSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { Logger } from '../logging/logger.js'

export interface InstallOptions {
  name: string
  version?: string
  workspaceRoot: string
  logger: Logger
  packageManager?: string
  dryRun?: boolean
}

export interface InstallResult {
  success: boolean
  name: string
  version?: string
  packageManager: string
  duration: number
  error?: string
}

export class PluginInstaller {
  async install(options: InstallOptions): Promise<InstallResult> {
    const startTime = performance.now()
    const { name, version, workspaceRoot, logger, dryRun } = options
    const packageManager = options.packageManager ?? await this.detectPackageManager(workspaceRoot)

    logger.info(`Installing ${name}${version ? `@${version}` : ''} via ${packageManager}`)

    try {
      // 1. Check if already installed
      const alreadyInstalled = await this.isInstalled(name, workspaceRoot)
      if (alreadyInstalled && !version) {
        logger.info(`${name} is already installed`)
        return {
          success: true,
          name,
          packageManager,
          duration: performance.now() - startTime,
        }
      }

      // 2. Build install command
      const pkg = version ? `${name}@${version}` : name
      const installCmd = this.getInstallCommand(packageManager, pkg)

      if (dryRun) {
        logger.info(`[dry-run] Would run: ${installCmd}`)
        return {
          success: true,
          name,
          packageManager,
          duration: performance.now() - startTime,
        }
      }

      // 3. Run npm install
      logger.info(`Running: ${installCmd}`)
      execSync(installCmd, {
        cwd: workspaceRoot,
        stdio: 'pipe',
        timeout: 120000,
        env: { ...process.env, NODE_ENV: 'production' },
      })

      // 4. Validate installed plugin
      const pluginPath = path.join(workspaceRoot, 'node_modules', name)
      const validation = await this.validateInstalled(pluginPath, name, logger)

      if (!validation.valid) {
        logger.warn(`Plugin validation warnings: ${validation.warnings.join(', ')}`)
      }

      // 5. Get installed version
      const installedVersion = await this.getInstalledVersion(pluginPath)

      const duration = performance.now() - startTime
      logger.info(`Installed ${name}@${installedVersion} in ${duration.toFixed(0)}ms`)

      return {
        success: true,
        name,
        version: installedVersion,
        packageManager,
        duration,
      }
    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error(`Failed to install ${name}: ${errorMessage}`)

      return {
        success: false,
        name,
        packageManager,
        duration,
        error: errorMessage,
      }
    }
  }

  async uninstall(options: { name: string; workspaceRoot: string; logger: Logger; packageManager?: string }): Promise<InstallResult> {
    const startTime = performance.now()
    const { name, workspaceRoot, logger } = options
    const packageManager = options.packageManager ?? await this.detectPackageManager(workspaceRoot)

    logger.info(`Uninstalling ${name} via ${packageManager}`)

    try {
      const uninstallCmd = this.getUninstallCommand(packageManager, name)
      execSync(uninstallCmd, {
        cwd: workspaceRoot,
        stdio: 'pipe',
        timeout: 60000,
      })

      const duration = performance.now() - startTime
      logger.info(`Uninstalled ${name} in ${duration.toFixed(0)}ms`)

      return {
        success: true,
        name,
        packageManager,
        duration,
      }
    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error(`Failed to uninstall ${name}: ${errorMessage}`)

      return {
        success: false,
        name,
        packageManager,
        duration,
        error: errorMessage,
      }
    }
  }

  private async isInstalled(name: string, workspaceRoot: string): Promise<boolean> {
    try {
      const pkgPath = path.join(workspaceRoot, 'node_modules', name, 'package.json')
      await fs.access(pkgPath)
      return true
    } catch {
      return false
    }
  }

  private async detectPackageManager(workspaceRoot: string): Promise<string> {
    const checks = [
      { file: 'pnpm-lock.yaml', pm: 'pnpm' },
      { file: 'yarn.lock', pm: 'yarn' },
      { file: 'bun.lockb', pm: 'bun' },
      { file: 'package-lock.json', pm: 'npm' },
    ]

    for (const { file, pm } of checks) {
      try {
        await fs.access(path.join(workspaceRoot, file))
        return pm
      } catch {}
    }

    return 'npm'
  }

  private getInstallCommand(packageManager: string, pkg: string): string {
    switch (packageManager) {
      case 'pnpm':
        return `pnpm add ${pkg}`
      case 'yarn':
        return `yarn add ${pkg}`
      case 'bun':
        return `bun add ${pkg}`
      default:
        return `npm install ${pkg}`
    }
  }

  private getUninstallCommand(packageManager: string, name: string): string {
    switch (packageManager) {
      case 'pnpm':
        return `pnpm remove ${name}`
      case 'yarn':
        return `yarn remove ${name}`
      case 'bun':
        return `bun remove ${name}`
      default:
        return `npm uninstall ${name}`
    }
  }

  private async validateInstalled(pluginPath: string, name: string, _logger: Logger): Promise<{ valid: boolean; warnings: string[] }> {
    const warnings: string[] = []

    try {
      const pkgPath = path.join(pluginPath, 'package.json')
      const content = await fs.readFile(pkgPath, 'utf-8')
      const pkg = JSON.parse(content) as Record<string, unknown>

      // Check if it has forge metadata
      if (!pkg.forge) {
        warnings.push(`Package "${name}" does not have forge metadata in package.json`)
      }

      // Validate the entry point
      const forge = pkg.forge as Record<string, unknown> | undefined
      if (forge?.entry) {
        const entryPath = path.join(pluginPath, forge.entry as string)
        try {
          await fs.access(entryPath)
        } catch {
          warnings.push(`Entry point "${forge.entry}" not found`)
        }
      }
    } catch (error) {
      warnings.push(`Failed to validate: ${error instanceof Error ? error.message : String(error)}`)
    }

    return { valid: warnings.length === 0, warnings }
  }

  private async getInstalledVersion(pluginPath: string): Promise<string | undefined> {
    try {
      const pkgPath = path.join(pluginPath, 'package.json')
      const content = await fs.readFile(pkgPath, 'utf-8')
      const pkg = JSON.parse(content) as { version?: string }
      return pkg.version
    } catch {
      return undefined
    }
  }
}
