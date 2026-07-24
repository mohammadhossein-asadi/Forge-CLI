import fs from 'node:fs/promises'
import path from 'node:path'

export interface DevTool {
  name: string
  command: string
  args: string[]
  configFiles: string[]
  detected: boolean
  port?: number
}

export interface DevDetectorOptions {
  cwd: string
}

export class DevDetector {
  private cwd: string

  constructor(options: DevDetectorOptions) {
    this.cwd = options.cwd
  }

  async detect(): Promise<DevTool[]> {
    const tools: DevTool[] = []

    const checks = [
      { name: 'vite', command: 'vite', args: [], configFiles: ['vite.config.ts', 'vite.config.js', 'vite.config.mjs'], port: 5173 },
      { name: 'next', command: 'next', args: ['dev'], configFiles: ['next.config.js', 'next.config.mjs', 'next.config.ts'], port: 3000 },
      { name: 'nuxt', command: 'nuxt', args: ['dev'], configFiles: ['nuxt.config.ts', 'nuxt.config.js'], port: 3000 },
      { name: 'webpack', command: 'webpack', args: ['serve', '--mode', 'development'], configFiles: ['webpack.config.js', 'webpack.config.ts'], port: 8080 },
      { name: 'astro', command: 'astro', args: ['dev'], configFiles: ['astro.config.mjs', 'astro.config.ts'], port: 4321 },
      { name: 'remix', command: 'remix', args: ['dev'], configFiles: ['remix.config.js'], port: 3000 },
      { name: 'sveltekit', command: 'vite', args: ['dev'], configFiles: ['svelte.config.js'], port: 5173 },
      { name: 'storybook', command: 'storybook', args: ['dev', '-p', '6006'], configFiles: ['.storybook/main.js', '.storybook/main.ts'], port: 6006 },
      { name: 'turbo', command: 'turbo', args: ['run', 'dev'], configFiles: ['turbo.json'], port: undefined },
      { name: 'nx', command: 'nx', args: ['serve'], configFiles: ['nx.json'], port: undefined },
    ]

    const pkgScripts = await this.getPackageScripts()

    for (const check of checks) {
      const hasConfig = await this.hasFile(check.configFiles)
      const hasScript = pkgScripts[check.name] !== undefined || pkgScripts['dev'] !== undefined

      tools.push({
        name: check.name,
        command: hasScript ? `npm run ${check.name}` : check.command,
        args: hasScript ? [] : check.args,
        configFiles: check.configFiles,
        detected: hasConfig || hasScript,
        port: check.port,
      })
    }

    return tools.filter((t) => t.detected)
  }

  async detectPrimary(): Promise<DevTool | null> {
    const tools = await this.detect()
    const priority = ['turbo', 'nx', 'vite', 'next', 'nuxt', 'astro', 'remix', 'sveltekit', 'webpack', 'storybook']

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
