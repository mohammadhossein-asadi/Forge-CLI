import type { CommandMetadata, CommandFlags, CommandArgs } from '@forge/shared'
import type { BaseCommand } from './types.js'

export interface CommandRegistration {
  id: string
  commandClass: new (context: import('./types.js').CommandContext) => BaseCommand
  metadata: CommandMetadata
  flags: CommandFlags
  args: CommandArgs
}

export class CommandRegistry {
  private commands = new Map<string, CommandRegistration>()
  private aliases = new Map<string, string>()

  register(registration: CommandRegistration): void {
    this.commands.set(registration.id, registration)

    if (registration.metadata.aliases) {
      for (const alias of registration.metadata.aliases) {
        this.aliases.set(alias, registration.id)
      }
    }
  }

  get(id: string): CommandRegistration | undefined {
    return this.commands.get(id)
  }

  resolve(input: string): CommandRegistration | undefined {
    return this.commands.get(input) ?? this.commands.get(this.aliases.get(input) ?? '')
  }

  has(id: string): boolean {
    return this.commands.has(id) || this.aliases.has(id)
  }

  list(options?: { includeHidden?: boolean; category?: string }): CommandRegistration[] {
    const commands = [...this.commands.values()]
    let filtered = options?.includeHidden === true ? commands : commands.filter((c) => !c.metadata.hidden)
    if (options?.category) {
      filtered = filtered.filter((c) => c.metadata.category === options.category)
    }
    return filtered
  }

  byCategory(): Map<string, CommandRegistration[]> {
    const categories = new Map<string, CommandRegistration[]>()
    for (const command of this.list()) {
      const category = command.metadata.category ?? 'general'
      const list = categories.get(category) ?? []
      list.push(command)
      categories.set(category, list)
    }
    return categories
  }

  remove(id: string): boolean {
    const registration = this.commands.get(id)
    if (registration?.metadata.aliases) {
      for (const alias of registration.metadata.aliases) {
        this.aliases.delete(alias)
      }
    }
    return this.commands.delete(id)
  }
}
