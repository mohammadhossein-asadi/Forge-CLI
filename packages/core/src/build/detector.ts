import fs from 'node:fs/promises'
import path from 'node:path'

export interface BuildTool {
  name: string
  command: string
  args: string[]
  configFiles: string[]
  detected: boolean
}

export interface BuildDetectorOptions {
  cwd: string
}

export class BuildDetector {
  private cwd: string

  constructor(options: BuildDetectorOptions) {
    this.cwd = options.cwd
  }

  async detect(): Promise<BuildTool[]> {
    const tools: BuildTool[] = []

    // Check for various build tools
    const checks = [
      { name: 'vite', command: 'vite', args: ['build'], configFiles: ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'] },
      { name: 'next', command: 'next', args: ['build'], configFiles: ['next.config.js', 'next.config.mjs', 'next.config.ts'] },
      { name: 'nuxt', command: 'nuxt', args: ['build'], configFiles: ['nuxt.config.ts', 'nuxt.config.js'] },
      { name: 'webpack', command: 'webpack', args: ['--mode', 'production'], configFiles: ['webpack.config.js', 'webpack.config.ts'] },
      { name: 'rollup', command: 'rollup', args: ['-c'], configFiles: ['rollup.config.js', 'rollup.config.ts'] },
      { name: 'esbuild', command: 'esbuild', args: [], configFiles: ['esbuild.config.js'] },
      { name: 'tsup', command: 'tsup', args: [], configFiles: ['tsup.config.ts', 'tsup.config.js'] },
      { name: 'tsc', command: 'tsc', args: [], configFiles: ['tsconfig.json'] },
      { name: 'turbo', command: 'turbo', args: ['run', 'build'], configFiles: ['turbo.json'] },
      { name: 'nx', command: 'nx', args: ['build'], configFiles: ['nx.json'] },
      { name: 'vite', command: 'vite', args: ['build'], configFiles: ['astro.config.mjs', 'astro.config.ts'] },
    ]

    // Also check package.json scripts
    const pkgScripts = await this.getPackageScripts()

    for (const check of checks) {
      const hasConfig = await this.hasFile(check.configFiles)
      const hasScript = pkgScripts[check.name] !== undefined

      tools.push({
        name: check.name,
        command: hasScript ? `npm run ${check.name}` : check.command,
        args: hasScript ? [] : check.args,
        configFiles: check.configFiles,
        detected: hasConfig || hasScript,
      })
    }

    return tools.filter((t) => t.detected)
  }

  async detectPrimary(): Promise<BuildTool | null> {
    const tools = await this.detect()
    // Priority order
    const priority = ['turbo', 'nx', 'vite', 'next', 'nuxt', 'tsup', 'tsc', 'webpack', 'rollup', 'esbuild']

    for (const name of priority) {
      const tool = tools.find((t) => t.name === name)
      if (tool) return tool
    }

    return tools[0] ?? null
  }

  private async hasFile(files: string[]): Promise<boolean> {
    for (const file of files) {
      try {
        await fs.access(path.join(this.cwd, file))
        return true
      } catch {}
    }
    return false
  }

  private async getPackageScripts(): Promise<Record<string, string>> {
    try {
      const pkgPath = path.join(this.cwd, 'package.json')
      const content = await fs.readFile(pkgPath, 'utf-8')
      const pkg = JSON.parse(content) as { scripts?: Record<string, string> }
      return pkg.scripts ?? {}
    } catch {
      return {}
    }
  }
}
