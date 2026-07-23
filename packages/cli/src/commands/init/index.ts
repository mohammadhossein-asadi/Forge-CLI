import { Kernel } from '@forge/core'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function runInit(kernel: Kernel): Promise<void> {
  const logger = kernel.getLogger()
  const cwd = process.cwd()

  console.log('')
  console.log('  Initializing Forge in current directory...')
  console.log('')

  // Check for existing package.json
  const packageJsonPath = path.join(cwd, 'package.json')
  let projectName = 'my-project'

  try {
    const content = await fs.readFile(packageJsonPath, 'utf-8')
    const pkg = JSON.parse(content) as { name?: string }
    if (pkg.name) {
      projectName = pkg.name
    }
  } catch {}

  // Create forge.config.json if it doesn't exist
  const configPath = path.join(cwd, 'forge.config.json')
  try {
    await fs.access(configPath)
    console.log('  forge.config.json already exists, skipping.')
  } catch {
    const config = {
      version: '1.0.0',
      project: {
        name: projectName,
        language: 'typescript',
      },
    }
    await fs.writeFile(configPath, JSON.stringify(config, null, 2) + '\n')
    console.log('  Created forge.config.json')
  }

  // Create .editorconfig if it doesn't exist
  const editorConfigPath = path.join(cwd, '.editorconfig')
  try {
    await fs.access(editorConfigPath)
    console.log('  .editorconfig already exists, skipping.')
  } catch {
    const editorconfig = `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
`
    await fs.writeFile(editorConfigPath, editorconfig)
    console.log('  Created .editorconfig')
  }

  console.log('')
  console.log('  Forge initialized successfully!')
  console.log('')
  console.log('  You can now use Forge commands:')
  console.log('    forge doctor    — Check your environment')
  console.log('    forge config    — Manage configuration')
  console.log('    forge create    — Create new components')
  console.log('')
}
