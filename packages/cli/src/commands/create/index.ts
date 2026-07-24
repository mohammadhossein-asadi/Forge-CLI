import { Kernel, ProjectCreator, searchTemplates } from '@forge/core'
import { CLI_NAME } from '@forge/shared'

export interface CreateCommandOptions {
  template?: string
  packageManager?: string
  framework?: string
  language?: string
  git?: boolean
  install?: boolean
}

export async function runCreate(kernel: Kernel, projectName: string | undefined, options: CreateCommandOptions = {}): Promise<void> {
  const logger = kernel.getLogger()
  const workspace = kernel.getWorkspace()

  const creator = new ProjectCreator({ logger })

  // If no name provided, show available templates
  if (!projectName) {
    console.log('')
    console.log('  Available templates:')
    console.log('')

    const templates = creator.getAvailableTemplates()
    const categories = new Map<string, typeof templates>()

    for (const template of templates) {
      const list = categories.get(template.category) ?? []
      list.push(template)
      categories.set(template.category, list)
    }

    for (const [category, items] of categories) {
      console.log(`    ${category}`)
      for (const item of items) {
        console.log(`      ${item.id.padEnd(15)} ${item.description}`)
      }
    }

    console.log('')
    console.log(`  Usage: ${CLI_NAME} create <project-name> --template <template>`)
    console.log('')
    return
  }

  console.log('')
  console.log(`  Creating project: ${projectName}`)
  if (options.template) {
    console.log(`  Template: ${options.template}`)
  }
  if (options.framework) {
    console.log(`  Framework: ${options.framework}`)
  }
  console.log('')

  // Create the project
  const result = await creator.create({
    name: projectName,
    template: options.template,
    framework: options.framework,
    language: options.language,
    packageManager: options.packageManager,
    outputDir: workspace.root,
    git: options.git ?? true,
    install: options.install ?? false,
  })

  if (result.success) {
    console.log('')
    console.log(`  Project "${projectName}" created successfully!`)
    console.log('')
    console.log(`  Template: ${result.template}`)
    console.log(`  Location: ${result.path}`)
    console.log(`  Files: ${result.files.length}`)
    console.log(`  Duration: ${result.duration.toFixed(0)}ms`)
    console.log('')
    console.log('  Files created:')
    for (const file of result.files) {
      console.log(`    ${file}`)
    }
    console.log('')
    console.log('  Next steps:')
    console.log(`    cd ${projectName}`)
    console.log(`    ${options.packageManager ?? 'npm'} install`)
    console.log(`    ${options.packageManager ?? 'npm'} run dev`)
    console.log('')
  } else {
    console.log('')
    console.log(`  Failed to create project "${projectName}"`)
    if (result.error) {
      console.log(`    ${result.error}`)
    }
    console.log('')
  }
}
