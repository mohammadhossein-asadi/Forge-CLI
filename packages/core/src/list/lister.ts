import fs from 'node:fs/promises'
import path from 'node:path'
import type { Logger } from '../logging/logger.js'
import type { ListItem, ListOptions, ListResult } from './types.js'

export interface ListerOptions {
  logger: Logger
  workspaceRoot: string
}

export class Lister {
  private logger: Logger
  private workspaceRoot: string

  constructor(options: ListerOptions) {
    this.logger = options.logger
    this.workspaceRoot = options.workspaceRoot
  }

  async list(options: ListOptions): Promise<ListResult> {
    switch (options.type) {
      case 'projects':
        return this.listProjects(options)
      case 'plugins':
        return this.listPlugins(options)
      case 'templates':
        return this.listTemplates(options)
      case 'config':
        return this.listConfig(options)
      case 'tools':
        return this.listTools(options)
      case 'files':
        return this.listFiles(options)
      default:
        return { items: [], total: 0, type: options.type }
    }
  }

  // ─── Projects ────────────────────────────────────────────────

  private async listProjects(options: ListOptions): Promise<ListResult> {
    const items: ListItem[] = []

    // Check if workspace has projects
    const workspaceType = await this.detectWorkspaceType()

    if (workspaceType === 'monorepo') {
      // List packages in monorepo
      const packages = await this.discoverPackages()
      items.push(...packages)
    } else {
      // Single project
      const pkg = await this.readPackageJson(this.workspaceRoot)
      if (pkg) {
        items.push({
          name: String(pkg.name ?? path.basename(this.workspaceRoot)),
          description: pkg.description ? String(pkg.description) : undefined,
          version: pkg.version ? String(pkg.version) : undefined,
          type: 'project',
          path: this.workspaceRoot,
        })
      }
    }

    return this.filterAndSort(items, options)
  }

  private async detectWorkspaceType(): Promise<'single' | 'monorepo'> {
    const checks = [
      'pnpm-workspace.yaml',
      'lerna.json',
      'nx.json',
      'turbo.json',
    ]

    for (const file of checks) {
      try {
        await fs.access(path.join(this.workspaceRoot, file))
        return 'monorepo'
      } catch {}
    }

    // Check package.json for workspaces
    const pkg = await this.readPackageJson(this.workspaceRoot)
    if (pkg?.workspaces) return 'monorepo'

    return 'single'
  }

  private async discoverPackages(): Promise<ListItem[]> {
    const items: ListItem[] = []

    try {
      const pkg = await this.readPackageJson(this.workspaceRoot)
      const workspaces = (pkg?.pnpm as { packages?: string[] })?.packages ??
        (Array.isArray(pkg?.workspaces) ? pkg?.workspaces as string[] : []) ?? []

      for (const pattern of workspaces) {
        const dirs = await this.globDirs(pattern, this.workspaceRoot)
        for (const dir of dirs) {
          const pkgJson = await this.readPackageJson(path.join(this.workspaceRoot, dir))
          if (pkgJson) {
            items.push({
              name: pkgJson.name as string ?? dir,
              description: pkgJson.description as string | undefined,
              version: pkgJson.version as string | undefined,
              type: 'package',
              path: path.join(this.workspaceRoot, dir),
            })
          }
        }
      }
    } catch (error) {
      this.logger.debug(`Failed to discover packages: ${error}`)
    }

    return items
  }

  // ─── Plugins ─────────────────────────────────────────────────

  private async listPlugins(_options: ListOptions): Promise<ListResult> {
    const items: ListItem[] = []

    // Check node_modules for forge plugins
    const nodeModulesDir = path.join(this.workspaceRoot, 'node_modules')
    try {
      const entries = await fs.readdir(nodeModulesDir, { withFileTypes: true })
      for (const entry of entries) {
        if (!entry.isDirectory()) continue
        if (entry.name.startsWith('.')) continue

        if (entry.name.startsWith('@forge/plugin-') || entry.name.startsWith('forge-plugin-')) {
          const pluginPath = path.join(nodeModulesDir, entry.name)
          try {
            const manifestPath = path.join(pluginPath, 'package.json')
            const content = await fs.readFile(manifestPath, 'utf-8')
            const manifest = JSON.parse(content) as Record<string, unknown>

            if (manifest.forge) {
              items.push({
                name: manifest.name as string,
                description: manifest.description as string | undefined,
                version: manifest.version as string | undefined,
                type: 'plugin',
                path: pluginPath,
                metadata: {
                  forge: manifest.forge,
                  author: manifest.author,
                },
              })
            }
          } catch {}
        }
      }
    } catch {}

    return this.filterAndSort(items, _options)
  }

  // ─── Templates ───────────────────────────────────────────────

  private async listTemplates(_options: ListOptions): Promise<ListResult> {
    const items: ListItem[] = []

    // Built-in templates
    const builtInTemplates = [
      { name: 'react', description: 'React with TypeScript', type: 'framework' },
      { name: 'nextjs', description: 'Next.js with TypeScript', type: 'framework' },
      { name: 'vue', description: 'Vue 3 with TypeScript', type: 'framework' },
      { name: 'nuxt', description: 'Nuxt 3 with TypeScript', type: 'framework' },
      { name: 'express', description: 'Express.js API', type: 'backend' },
      { name: 'nestjs', description: 'NestJS API', type: 'backend' },
      { name: 'fastify', description: 'Fastify API', type: 'backend' },
      { name: 'hono', description: 'Hono API', type: 'backend' },
    ]

    for (const template of builtInTemplates) {
      items.push({
        name: template.name,
        description: template.description,
        type: template.type,
        status: 'official',
      })
    }

    return this.filterAndSort(items, _options)
  }

  // ─── Config ──────────────────────────────────────────────────

  private async listConfig(_options: ListOptions): Promise<ListResult> {
    const items: ListItem[] = []

    // Check for config files
    const configFiles = [
      { name: 'forge.config.json', type: 'forge' },
      { name: 'forge.config.toml', type: 'forge' },
      { name: 'forge.config.yaml', type: 'forge' },
      { name: '.forge/config.json', type: 'forge' },
      { name: 'package.json', type: 'package' },
      { name: 'tsconfig.json', type: 'typescript' },
      { name: '.eslintrc.json', type: 'linting' },
      { name: 'biome.json', type: 'linting' },
      { name: '.prettierrc', type: 'formatting' },
      { name: 'vitest.config.ts', type: 'testing' },
      { name: 'jest.config.js', type: 'testing' },
      { name: 'vite.config.ts', type: 'build' },
      { name: 'webpack.config.js', type: 'build' },
      { name: 'tailwind.config.js', type: 'styling' },
      { name: 'postcss.config.js', type: 'styling' },
      { name: 'docker-compose.yml', type: 'docker' },
      { name: 'Dockerfile', type: 'docker' },
      { name: '.github/workflows', type: 'ci' },
    ]

    for (const config of configFiles) {
      try {
        const stat = await fs.stat(path.join(this.workspaceRoot, config.name))
        items.push({
          name: config.name,
          type: config.type,
          status: stat.isFile() ? 'file' : 'directory',
          path: path.join(this.workspaceRoot, config.name),
        })
      } catch {}
    }

    return this.filterAndSort(items, _options)
  }

  // ─── Tools ───────────────────────────────────────────────────

  private async listTools(_options: ListOptions): Promise<ListResult> {
    const items: ListItem[] = []

    // Check for various tools
    const tools = [
      { name: 'node', configFiles: ['package.json'] },
      { name: 'git', configFiles: ['.git'] },
      { name: 'docker', configFiles: ['Dockerfile', 'docker-compose.yml'] },
      { name: 'pnpm', configFiles: ['pnpm-lock.yaml'] },
      { name: 'yarn', configFiles: ['yarn.lock'] },
      { name: 'npm', configFiles: ['package-lock.json'] },
      { name: 'bun', configFiles: ['bun.lockb'] },
      { name: 'typescript', configFiles: ['tsconfig.json'] },
      { name: 'eslint', configFiles: ['.eslintrc.json', '.eslintrc.js', 'eslint.config.js'] },
      { name: 'prettier', configFiles: ['.prettierrc', 'prettier.config.js'] },
      { name: 'biome', configFiles: ['biome.json'] },
      { name: 'vite', configFiles: ['vite.config.ts', 'vite.config.js'] },
      { name: 'turbo', configFiles: ['turbo.json'] },
      { name: 'nx', configFiles: ['nx.json'] },
      { name: 'vitest', configFiles: ['vitest.config.ts'] },
      { name: 'jest', configFiles: ['jest.config.js'] },
    ]

    for (const tool of tools) {
      const detected = await this.hasFiles(tool.configFiles)
      items.push({
        name: tool.name,
        type: 'tool',
        status: detected ? 'detected' : 'not found',
      })
    }

    return this.filterAndSort(items, _options)
  }

  // ─── Files ───────────────────────────────────────────────────

  private async listFiles(_options: ListOptions): Promise<ListResult> {
    const items: ListItem[] = []

    try {
      const entries = await fs.readdir(this.workspaceRoot, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue
        if (entry.name === 'node_modules') continue

        const filePath = path.join(this.workspaceRoot, entry.name)
        const stat = await fs.stat(filePath)

        items.push({
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
          path: filePath,
          metadata: {
            size: stat.size,
            modified: stat.mtime.toISOString(),
          },
        })
      }
    } catch (error) {
      this.logger.debug(`Failed to list files: ${error}`)
    }

    return this.filterAndSort(items, _options)
  }

  // ─── Helpers ─────────────────────────────────────────────────

  private filterAndSort(items: ListItem[], options: ListOptions): ListResult {
    let filtered = items

    // Apply filter
    if (options.filter) {
      const lowerFilter = options.filter.toLowerCase()
      filtered = items.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerFilter) ||
          item.description?.toLowerCase().includes(lowerFilter) ||
          item.type?.toLowerCase().includes(lowerFilter),
      )
    }

    // Apply sort
    if (options.sort) {
      filtered.sort((a, b) => {
        switch (options.sort) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'version':
            return (a.version ?? '').localeCompare(b.version ?? '')
          case 'status':
            return (a.status ?? '').localeCompare(b.status ?? '')
          case 'type':
            return (a.type ?? '').localeCompare(b.type ?? '')
          default:
            return 0
        }
      })
    }

    // Apply limit
    if (options.limit && options.limit > 0) {
      filtered = filtered.slice(0, options.limit)
    }

    return {
      items: filtered,
      total: items.length,
      type: options.type,
    }
  }

  private async hasFiles(files: string[]): Promise<boolean> {
    for (const file of files) {
      try {
        await fs.access(path.join(this.workspaceRoot, file))
        return true
      } catch {}
    }
    return false
  }

  private async readPackageJson(dir: string): Promise<Record<string, unknown> | null> {
    try {
      const content = await fs.readFile(path.join(dir, 'package.json'), 'utf-8')
      return JSON.parse(content) as Record<string, unknown>
    } catch {
      return null
    }
  }

  private async globDirs(pattern: string, root: string): Promise<string[]> {
    try {
      const resolved = pattern.replace('/*', '').replace('*', '')
      const fullPath = path.join(root, resolved)
      const entries = await fs.readdir(fullPath, { withFileTypes: true })
      return entries.filter((e) => e.isDirectory()).map((e) => path.join(resolved, e.name))
    } catch {
      return []
    }
  }
}
