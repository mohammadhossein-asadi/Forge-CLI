import fs from 'node:fs/promises'
import path from 'node:path'
import type { Logger } from '../logging/logger.js'

export interface PluginTemplateOptions {
  name: string
  description?: string
  author?: string
  license?: string
  outputDir: string
  logger: Logger
}

export interface PluginTemplateResult {
  success: boolean
  path: string
  files: string[]
}

export class PluginTemplate {
  private logger: Logger

  constructor(logger: Logger) {
    this.logger = logger
  }

  async scaffold(options: PluginTemplateOptions): Promise<PluginTemplateResult> {
    const { name, description, author, license, outputDir } = options
    const files: string[] = []

    this.logger.info(`Scaffolding plugin: ${name}`)

    try {
      // Create plugin directory
      const pluginDir = path.join(outputDir, name)
      await fs.mkdir(pluginDir, { recursive: true })

      // Create package.json
      const packageJson = {
        name,
        version: '0.1.0',
        description: description ?? `Forge CLI plugin: ${name}`,
        type: 'module',
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
          build: 'tsup',
          dev: 'tsup --watch',
          test: 'vitest run',
          typecheck: 'tsc --noEmit',
        },
        keywords: ['forge', 'forge-plugin'],
        author: author ?? 'unknown',
        license: license ?? 'MIT',
        dependencies: {
          '@forge/plugin-sdk': '^0.1.0',
        },
        devDependencies: {
          tsup: '^8.3.0',
          typescript: '^5.7.0',
          vitest: '^2.1.0',
        },
        forge: {
          version: '>=0.1.0',
          type: 'plugin',
          entry: 'dist/index.js',
          permissions: [],
        },
      }
      await this.writeFile(pluginDir, 'package.json', JSON.stringify(packageJson, null, 2) + '\n')
      files.push('package.json')

      // Create tsconfig.json
      const tsconfig = {
        extends: '../../tsconfig.base.json',
        compilerOptions: {
          outDir: './dist',
          rootDir: './src',
        },
        include: ['src'],
      }
      await this.writeFile(pluginDir, 'tsconfig.json', JSON.stringify(tsconfig, null, 2) + '\n')
      files.push('tsconfig.json')

      // Create tsup.config.ts
      const tsupConfig = `import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['@forge/plugin-sdk'],
})
`
      await this.writeFile(pluginDir, 'tsup.config.ts', tsupConfig)
      files.push('tsup.config.ts')

      // Create src/index.ts
      const pluginName = name.replace(/^@[^/]+\//, '').replace(/-plugin$/, '').replace(/forge-/, '')
      const indexTs = `import { definePlugin, defineCommand, createPluginLogger } from '@forge/plugin-sdk'

const logger = createPluginLogger('${pluginName}')

const plugin = definePlugin(
  {
    name: '${name}',
    version: '0.1.0',
    description: '${description ?? `Forge CLI plugin: ${name}`}',
    author: '${author ?? 'unknown'}',
    license: '${license ?? 'MIT'}',
    commands: [
      defineCommand({
        id: '${pluginName}:hello',
        name: 'hello',
        description: 'Say hello from ${name}',
        category: 'example',
        execute: (ctx) => {
          logger.info('Hello from ${name}!')
          return { success: true, message: 'Hello!' }
        },
      }),
    ],
  },
  async (ctx) => {
    logger.info('Plugin loaded!')
  },
)

export default plugin
`
      await this.writeFile(pluginDir, 'src/index.ts', indexTs)
      files.push('src/index.ts')

      // Create src/index.test.ts
      const testTs = `import { describe, it, expect } from 'vitest'
import plugin from './index.js'

describe('${name}', () => {
  it('should have correct metadata', () => {
    expect(plugin.name).toBe('${name}')
    expect(plugin.version).toBe('0.1.0')
  })

  it('should have commands', () => {
    expect(plugin.commands).toBeDefined()
    expect(plugin.commands!.length).toBeGreaterThan(0)
  })
})
`
      await this.writeFile(pluginDir, 'src/index.test.ts', testTs)
      files.push('src/index.test.ts')

      // Create .gitignore
      const gitignore = `node_modules/
dist/
*.tsbuildinfo
.env
`
      await this.writeFile(pluginDir, '.gitignore', gitignore)
      files.push('.gitignore')

      // Create README.md
      const readme = `# ${name}

> ${description ?? `Forge CLI plugin: ${name}`}

## Installation

\`\`\`bash
npm install ${name}
\`\`\`

## Usage

\`\`\`bash
forge ${pluginName} hello
\`\`\`

## Development

\`\`\`bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Test
npm test
\`\`\`

## License

${license ?? 'MIT'}
`
      await this.writeFile(pluginDir, 'README.md', readme)
      files.push('README.md')

      this.logger.info(`Plugin scaffolded at: ${pluginDir}`)

      return {
        success: true,
        path: pluginDir,
        files,
      }
    } catch (error) {
      this.logger.error(`Failed to scaffold plugin: ${error}`)
      return {
        success: false,
        path: outputDir,
        files,
      }
    }
  }

  private async writeFile(dir: string, file: string, content: string): Promise<void> {
    const filePath = path.join(dir, file)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, content, 'utf-8')
  }
}
