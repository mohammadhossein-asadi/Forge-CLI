import { select } from '@inquirer/prompts'

export interface FrameworkOption {
  id: string
  name: string
  description?: string
}

export const FRAMEWORKS: FrameworkOption[] = [
  { id: 'react', name: 'React', description: 'SPA with Vite, TypeScript, and fast refresh' },
  { id: 'nextjs', name: 'Next.js', description: 'Full-stack React framework with App Router' },
  { id: 'vue', name: 'Vue', description: 'Vue 3 with Vite and TypeScript' },
  { id: 'node', name: 'Node.js CLI', description: 'Command-line app with TypeScript and tsup' },
  { id: 'library', name: 'Library', description: 'Reusable TypeScript library with tsup' },
  { id: 'empty', name: 'Empty', description: 'Minimal project with no framework' },
]

export async function promptFramework(defaultFramework?: string): Promise<string> {
  return select({
    message: 'Which framework do you want to use?',
    default: defaultFramework ?? 'react',
    choices: FRAMEWORKS.map((f) => ({
      value: f.id,
      name: f.name,
      description: f.description,
    })),
  })
}
