import { select } from '@inquirer/prompts'

export interface TestingOption {
  id: string
  name: string
  description?: string
}

export const TESTING: TestingOption[] = [
  { id: 'vitest', name: 'Vitest', description: 'Vite-native test runner with great TS support' },
  { id: 'jest', name: 'Jest', description: 'The classic JavaScript test framework' },
  { id: 'none', name: 'None', description: 'Skip testing setup for now' },
]

export async function promptTesting(defaultTesting = 'vitest'): Promise<string> {
  return select({
    message: 'Which testing framework do you want?',
    default: defaultTesting,
    choices: TESTING.map((t) => ({
      value: t.id,
      name: t.name,
      description: t.description,
    })),
  })
}
