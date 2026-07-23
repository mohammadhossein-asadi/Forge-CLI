import { Kernel } from '@forge/core'
import fs from 'node:fs/promises'
import path from 'node:path'

export interface CreateOptions {
  template?: string
  packageManager?: string
  framework?: string
}

export async function runCreate(kernel: Kernel, projectName: string | undefined, options: CreateOptions): Promise<void> {
  const logger = kernel.getLogger()
  const name = projectName ?? 'my-app'

  console.log('')
  console.log(`  Creating project: ${name}`)
  console.log('')

  // Validate project name
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    logger.error(`Invalid project name: "${name}". Use only letters, numbers, hyphens, and underscores.`)
    return
  }

  const projectPath = path.join(process.cwd(), name)

  // Check if directory exists
  try {
    await fs.access(projectPath)
    logger.error(`Directory "${name}" already exists.`)
    return
  } catch {}

  // Create project directory
  await fs.mkdir(projectPath, { recursive: true })

  // Create package.json
  const packageJson = {
    name,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'echo "No dev script configured"',
      build: 'echo "No build script configured"',
      test: 'echo "No test script configured"',
      lint: 'echo "No lint script configured"',
    },
  }
  await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n')

  // Create .gitignore
  const gitignore = `node_modules/
dist/
.env
.env.local
*.log
`
  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore)

  // Create .editorconfig
  const editorconfig = `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
`
  await fs.writeFile(path.join(projectPath, '.editorconfig'), editorconfig)

  // Create README.md
  const readme = `# ${name}

> Created with [Forge CLI](https://github.com/forge-cli/forge)

## Getting Started

\`\`\`bash
# Install dependencies
${options.packageManager ?? 'npm'} install

# Start development
${options.packageManager ?? 'npm'} run dev
\`\`\`

## Available Commands

- \`dev\` — Start development server
- \`build\` — Build for production
- \`test\` — Run tests
- \`lint\` — Run linter

## Learn More

- [Forge CLI Documentation](https://github.com/forge-cli/forge)
`
  await fs.writeFile(path.join(projectPath, 'README.md'), readme)

  // Create forge.config.json
  const forgeConfig = {
    version: '1.0.0',
    project: {
      name,
      framework: options.framework ?? 'vanilla',
      language: 'typescript',
      packageManager: options.packageManager ?? 'npm',
    },
  }
  await fs.writeFile(path.join(projectPath, 'forge.config.json'), JSON.stringify(forgeConfig, null, 2) + '\n')

  console.log('')
  console.log('  Project created successfully!')
  console.log('')
  console.log('  Next steps:')
  console.log(`    cd ${name}`)
  console.log(`    ${options.packageManager ?? 'npm'} install`)
  console.log(`    ${options.packageManager ?? 'npm'} run dev`)
  console.log('')
}
