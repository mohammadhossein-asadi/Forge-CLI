import { select } from '@inquirer/prompts'

export interface DatabaseOption {
  id: string
  name: string
  description?: string
}

export const DATABASES: DatabaseOption[] = [
  { id: 'none', name: 'None', description: 'No database for now' },
  { id: 'sqlite', name: 'SQLite', description: 'Embedded file-based database' },
  { id: 'postgres', name: 'PostgreSQL', description: 'Production-grade relational database' },
  { id: 'mysql', name: 'MySQL', description: 'Widely used relational database' },
  { id: 'mongodb', name: 'MongoDB', description: 'Document-oriented NoSQL database' },
]

export async function promptDatabase(defaultDatabase = 'none'): Promise<string> {
  return select({
    message: 'Which database do you want to use?',
    default: defaultDatabase,
    choices: DATABASES.map((d) => ({
      value: d.id,
      name: d.name,
      description: d.description,
    })),
  })
}
