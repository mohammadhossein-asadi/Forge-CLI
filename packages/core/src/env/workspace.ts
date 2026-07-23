import fs from 'node:fs/promises'
import path from 'node:path'

interface PackageJson {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  workspaces?: string[] | { packages?: string[] }
  pnpm?: { packages?: string[] }
  scripts?: Record<string, string>
}

export interface WorkspaceInfo {
  root: string
  type: 'single' | 'monorepo'
  workspaceTool?: string
  projects: ProjectInfo[]
  hasGit: boolean
  hasPackageJson: boolean
}

export interface ProjectInfo {
  name: string
  path: string
  framework?: string
  language?: string
  packageManager?: string
}

export class WorkspaceDetector {
  async detect(cwd?: string): Promise<WorkspaceInfo> {
    const root = cwd ?? process.cwd()
    const projects: ProjectInfo[] = []

    const hasGit = await this.fileExists(path.join(root, '.git'))
    const hasPackageJson = await this.fileExists(path.join(root, 'package.json'))

    // Detect workspace type
    const workspaceType = await this.detectWorkspaceType(root)
    const workspaceTool = await this.detectWorkspaceTool(root)

    // If monorepo, discover projects
    if (workspaceType === 'monorepo') {
      const discovered = await this.discoverProjects(root, workspaceTool)
      projects.push(...discovered)
    } else if (hasPackageJson) {
      const pkg = await this.readPackageJson(root)
      projects.push({
        name: pkg?.name ?? path.basename(root),
        path: root,
        framework: await this.detectFramework(root),
        language: await this.detectLanguage(root),
        packageManager: await this.detectPackageManager(root),
      })
    }

    return {
      root,
      type: workspaceType,
      workspaceTool,
      projects,
      hasGit,
      hasPackageJson,
    }
  }

  private async detectWorkspaceType(root: string): Promise<'single' | 'monorepo'> {
    // pnpm
    if (await this.fileExists(path.join(root, 'pnpm-workspace.yaml'))) return 'monorepo'
    // yarn
    if (await this.fileExists(path.join(root, 'lerna.json'))) return 'monorepo'
    // nx
    if (await this.fileExists(path.join(root, 'nx.json'))) return 'monorepo'
    // turborepo
    if (await this.fileExists(path.join(root, 'turbo.json'))) return 'monorepo'
    // bun
    const pkg = await this.readPackageJson(root)
    if (pkg?.workspaces) return 'monorepo'
    return 'single'
  }

  private async detectWorkspaceTool(root: string): Promise<string | undefined> {
    if (await this.fileExists(path.join(root, 'pnpm-workspace.yaml'))) return 'pnpm'
    if (await this.fileExists(path.join(root, 'lerna.json'))) return 'lerna'
    if (await this.fileExists(path.join(root, 'nx.json'))) return 'nx'
    if (await this.fileExists(path.join(root, 'turbo.json'))) return 'turborepo'
    const pkg = await this.readPackageJson(root)
    if (pkg?.workspaces) return 'yarn'
    return undefined
  }

  private async discoverProjects(root: string, tool?: string): Promise<ProjectInfo[]> {
    const projects: ProjectInfo[] = []

    if (tool === 'pnpm') {
      const pkg = await this.readPackageJson(root)
      if (!pkg) return projects
      const workspaces = Array.isArray(pkg.pnpm?.packages)
        ? pkg.pnpm!.packages!
        : Array.isArray(pkg.workspaces)
          ? pkg.workspaces
          : []
      for (const pattern of workspaces) {
        const dirs = await this.globDirs(pattern, root)
        for (const dir of dirs) {
          const pkgJson = await this.readPackageJson(path.join(root, dir))
          if (pkgJson?.name) {
            projects.push({
              name: pkgJson.name,
              path: path.join(root, dir),
            })
          }
        }
      }
    }

    return projects
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

  private async detectFramework(root: string): Promise<string | undefined> {
    const pkg = await this.readPackageJson(root)
    if (!pkg) return undefined
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }

    if (deps['next']) return 'next.js'
    if (deps['nuxt']) return 'nuxt'
    if (deps['@angular/core']) return 'angular'
    if (deps['svelte']) return 'svelte'
    if (deps['@sveltejs/kit']) return 'sveltekit'
    if (deps['solid-js']) return 'solid'
    if (deps['@qwik-city/build']) return 'qwik'
    if (deps['astro']) return 'astro'
    if (deps['remix'] || deps['@remix-run/node']) return 'remix'
    if (deps['react']) return 'react'
    if (deps['vue']) return 'vue'
    return undefined
  }

  private async detectLanguage(root: string): Promise<string | undefined> {
    if (await this.fileExists(path.join(root, 'tsconfig.json'))) return 'typescript'
    if (await this.fileExists(path.join(root, 'jsconfig.json'))) return 'javascript'
    if (await this.fileExists(path.join(root, 'Cargo.toml'))) return 'rust'
    if (await this.fileExists(path.join(root, 'go.mod'))) return 'go'
    if (await this.fileExists(path.join(root, 'pyproject.toml')) || await this.fileExists(path.join(root, 'setup.py'))) return 'python'
    return undefined
  }

  private async detectPackageManager(root: string): Promise<string | undefined> {
    if (await this.fileExists(path.join(root, 'pnpm-lock.yaml'))) return 'pnpm'
    if (await this.fileExists(path.join(root, 'yarn.lock'))) return 'yarn'
    if (await this.fileExists(path.join(root, 'bun.lockb'))) return 'bun'
    if (await this.fileExists(path.join(root, 'package-lock.json'))) return 'npm'
    return undefined
  }

  private async readPackageJson(root: string): Promise<PackageJson | null> {
    try {
      const content = await fs.readFile(path.join(root, 'package.json'), 'utf-8')
      return JSON.parse(content) as Record<string, unknown>
    } catch {
      return null
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }
}
