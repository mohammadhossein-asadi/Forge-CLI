import { select } from '@inquirer/prompts'

export interface StylingOption {
  id: string
  name: string
  description?: string
}

export const STYLING: StylingOption[] = [
  { id: 'css', name: 'Plain CSS', description: 'Modern vanilla CSS, no tooling' },
  { id: 'tailwind', name: 'Tailwind CSS', description: 'Utility-first CSS framework' },
  { id: 'css-modules', name: 'CSS Modules', description: 'Scoped class names, zero runtime' },
  { id: 'none', name: 'None', description: 'Skip styling for now' },
]

export async function promptStyling(defaultStyling = 'css'): Promise<string> {
  return select({
    message: 'How do you want to style the project?',
    default: defaultStyling,
    choices: STYLING.map((s) => ({
      value: s.id,
      name: s.name,
      description: s.description,
    })),
  })
}
