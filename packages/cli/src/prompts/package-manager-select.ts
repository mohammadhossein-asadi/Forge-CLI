import { select } from '@inquirer/prompts'

export interface PackageManagerOption {
  id: string
  name: string
  description?: string
}

export const PACKAGE_MANAGERS: PackageManagerOption[] = [
  { id: 'npm', name: 'npm', description: 'The default Node.js package manager' },
  { id: 'pnpm', name: 'pnpm', description: 'Fast, disk-efficient, strict workspace support' },
  { id: 'yarn', name: 'Yarn', description: 'Classic and Berry releases' },
  { id: 'bun', name: 'Bun', description: 'All-in-one toolkit with a fast installer' },
]

export async function promptPackageManager(defaultPm = 'npm'): Promise<string> {
  return select({
    message: 'Which package manager do you want to use?',
    default: defaultPm,
    choices: PACKAGE_MANAGERS.map((pm) => ({
      value: pm.id,
      name: pm.name,
      description: pm.description,
    })),
  })
}
