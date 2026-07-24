import fs from 'node:fs/promises'
import path from 'node:path'
import type { Logger } from '../logging/logger.js'
import type { CreateOptions, CreateResult, ProjectTemplate } from './types.js'
import { TEMPLATES, getTemplate } from './templates.js'

export interface CreatorOptions {
  logger: Logger
}

export class ProjectCreator {
  private logger: Logger

  constructor(options: CreatorOptions) {
    this.logger = options.logger
  }

  async create(options: CreateOptions): Promise<CreateResult> {
    const startTime = performance.now()
    const { name, template: templateId, outputDir } = options

    this.logger.info(`Creating project: ${name}`)

    try {
      // 1. Validate project name
      if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        return {
          success: false,
          path: outputDir,
          files: [],
          template: templateId ?? 'empty',
          duration: performance.now() - startTime,
          error: `Invalid project name: "${name}". Use only letters, numbers, hyphens, and underscores.`,
        }
      }

      // 2. Check if directory exists
      const projectPath = path.join(outputDir, name)
      try {
        await fs.access(projectPath)
        return {
          success: false,
          path: projectPath,
          files: [],
          template: templateId ?? 'empty',
          duration: performance.now() - startTime,
          error: `Directory "${name}" already exists.`,
        }
      } catch {}

      // 3. Get template
      const template = templateId ? getTemplate(templateId) : TEMPLATES.find((t) => t.id === 'empty')
      if (!template) {
        return {
          success: false,
          path: projectPath,
          files: [],
          template: templateId ?? 'empty',
          duration: performance.now() - startTime,
          error: `Template "${templateId}" not found.`,
        }
      }

      // 4. Create project directory
      await fs.mkdir(projectPath, { recursive: true })

      // 5. Generate files
      const files: string[] = []

      // package.json
      const packageJson = this.generatePackageJson(name, options, template)
      await this.writeFile(projectPath, 'package.json', JSON.stringify(packageJson, null, 2) + '\n')
      files.push('package.json')

      // .gitignore
      const gitignore = this.generateGitignore()
      await this.writeFile(projectPath, '.gitignore', gitignore)
      files.push('.gitignore')

      // .editorconfig
      const editorconfig = this.generateEditorconfig()
      await this.writeFile(projectPath, '.editorconfig', editorconfig)
      files.push('.editorconfig')

      // forge.config.json
      const forgeConfig = this.generateForgeConfig(name, options, template)
      await this.writeFile(projectPath, 'forge.config.json', JSON.stringify(forgeConfig, null, 2) + '\n')
      files.push('forge.config.json')

      // README.md
      const readme = this.generateReadme(name, options, template)
      await this.writeFile(projectPath, 'README.md', readme)
      files.push('README.md')

      // Template-specific files
      for (const file of template.files) {
        if (file.condition && !file.condition(options)) continue

        const content = typeof file.content === 'function' ? file.content() : file.content
        const vars = { name, template: options.template, framework: options.framework, language: options.language, packageManager: options.packageManager }
        const processed = this.processTemplate(content, vars)
        await this.writeFile(projectPath, file.path, processed)
        files.push(file.path)
      }

      const duration = performance.now() - startTime
      this.logger.info(`Project created in ${duration.toFixed(0)}ms`)

      return {
        success: true,
        path: projectPath,
        files,
        template: template.id,
        duration,
      }
    } catch (error) {
      const duration = performance.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.logger.error(`Failed to create project: ${errorMessage}`)

      return {
        success: false,
        path: path.join(outputDir, name),
        files: [],
        template: templateId ?? 'empty',
        duration,
        error: errorMessage,
      }
    }
  }

  getAvailableTemplates(): Array<{ id: string; name: string; description: string; category: string; tags: string[] }> {
    return TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      tags: t.tags,
    }))
  }

  private generatePackageJson(name: string, _options: CreateOptions, template: ProjectTemplate): Record<string, unknown> {
    return {
      name,
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: template.scripts ?? {
        dev: 'echo "No dev script configured"',
        build: 'echo "No build script configured"',
        test: 'echo "No test script configured"',
        lint: 'echo "No lint script configured"',
      },
      dependencies: template.dependencies ?? {},
      devDependencies: template.devDependencies ?? {},
    }
  }

  private generateGitignore(): string {
    return `# Dependencies
node_modules/
.pnpm-store/

# Build output
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Test
coverage/

# Misc
*.tgz
.cache/
`
  }

  private generateEditorconfig(): string {
    return `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
`
  }

  private generateForgeConfig(name: string, options: CreateOptions, template: ProjectTemplate): Record<string, unknown> {
    return {
      version: '1.0.0',
      project: {
        name,
        template: template.id,
        framework: options.framework ?? template.framework,
        language: options.language ?? template.language,
        packageManager: options.packageManager ?? 'npm',
      },
    }
  }

  private generateReadme(name: string, options: CreateOptions, template: ProjectTemplate): string {
    const pm = options.packageManager ?? 'npm'
    const scripts = template.scripts ?? {}

    let readme = `# ${name}\n\n`
    readme += `> ${template.description}\n\n`
    readme += `> Created with [Forge CLI](https://github.com/forge-cli/forge)\n\n`

    if (Object.keys(scripts).length > 0) {
      readme += `## Getting Started\n\n`
      readme += `\`\`\`bash\n`
      readme += `# Install dependencies\n`
      readme += `${pm} install\n\n`

      if (scripts.dev) {
        readme += `# Start development\n`
        readme += `${pm} run dev\n`
      }

      readme += `\`\`\`\n\n`
    }

    readme += `## Available Commands\n\n`
    for (const [cmd, desc] of Object.entries(scripts)) {
      if (desc && !desc.startsWith('echo')) {
        readme += `- \`${cmd}\` — ${desc}\n`
      }
    }

    readme += `\n## Learn More\n\n`
    readme += `- [Forge CLI Documentation](https://github.com/forge-cli/forge)\n`

    return readme
  }

  private processTemplate(content: string, vars: Record<string, unknown>): string {
    return content.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      return String(vars[key] ?? `{{${key}}}`)
    })
  }

  private async writeFile(dir: string, file: string, content: string): Promise<void> {
    const filePath = path.join(dir, file)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, content, 'utf-8')
  }
}
