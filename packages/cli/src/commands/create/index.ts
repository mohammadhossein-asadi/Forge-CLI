import { ProjectCreator } from '@forge/core'
import type { Kernel } from '@forge/core'
import { CLI_NAME } from '@forge/shared'
import { runCreateWizard } from '../../prompts/steps/index.js'

export interface CreateCommandOptions {
  template?: string
  packageManager?: string
  framework?: string
  language?: string
  git?: boolean
  install?: boolean
}

export async function runCreate(
  kernel: Kernel,
  projectName: string | undefined,
  options: CreateCommandOptions = {},
): Promise<void> {
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

  let template = options.template
  let packageManager = options.packageManager

  // Interactive wizard fills in anything the user did not pass as a flag
  if (!template || !packageManager) {
    const answers = await runCreateWizard({
      defaultName: projectName,
      defaultFramework: options.framework,
      defaultPackageManager: options.packageManager,
    })
    template = template ?? mapFrameworkToTemplate(answers.framework)
    packageManager = packageManager ?? answers.packageManager
  }

  console.log('')
  console.log(`  Creating project: ${projectName}`)
  if (template) {
    console.log(`  Template: ${template}`)
  }
  if (options.framework) {
    console.log(`  Framework: ${options.framework}`)
  }
  console.log('')

  // Create the project
  const result = await creator.create({
    name: projectName,
    template,
    framework: options.framework,
    language: options.language,
    packageManager,
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
    console.log(`    ${packageManager ?? 'npm'} install`)
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

function mapFrameworkToTemplate(framework: string): string {
  switch (framework) {
    case 'nextjs':
      return 'nextjs'
    case 'vue':
      return 'vue'
    case 'node':
      return 'node'
    case 'library':
      return 'library'
    case 'empty':
      return 'empty'
    default:
      return 'react'
  }
}
