export interface WizardAnswers {
  projectName: string
  framework: string
  packageManager: string
  styling: string
  testing: string
  database: string
}

export interface WizardOptions {
  defaultName?: string
  defaultFramework?: string
  defaultPackageManager?: string
  defaultStyling?: string
  defaultTesting?: string
  defaultDatabase?: string
}

export async function runCreateWizard(options: WizardOptions = {}): Promise<WizardAnswers> {
  const { promptProjectName } = await import('../project-name.js')
  const { promptFramework } = await import('../framework-select.js')
  const { promptPackageManager } = await import('../package-manager-select.js')
  const { promptStyling } = await import('../styling-select.js')
  const { promptTesting } = await import('../testing-select.js')
  const { promptDatabase } = await import('../database-select.js')

  const projectName = await promptProjectName(options.defaultName)
  const framework = await promptFramework(options.defaultFramework)
  const packageManager = await promptPackageManager(options.defaultPackageManager)
  const styling = await promptStyling(options.defaultStyling)
  const testing = await promptTesting(options.defaultTesting)
  const database = await promptDatabase(options.defaultDatabase)

  return { projectName, framework, packageManager, styling, testing, database }
}
