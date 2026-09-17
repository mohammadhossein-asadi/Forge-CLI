import { input } from '@inquirer/prompts'

const NAME_PATTERN = /^[a-z0-9][a-z0-9._-]*$/i

export async function promptProjectName(defaultName = 'my-project'): Promise<string> {
  return input({
    message: 'Project name:',
    default: defaultName,
    validate: (value) => {
      const name = value.trim()
      if (name.length === 0) {
        return 'Project name is required.'
      }
      if (!NAME_PATTERN.test(name)) {
        return 'Use letters, numbers, dots, dashes, or underscores (must start with a letter or number).'
      }
      return true
    },
  })
}
