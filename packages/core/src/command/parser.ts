import type { CommandFlags, CommandArgs } from '@forge/shared'

export interface ParsedCommand {
  command: string
  subcommand?: string
  args: Record<string, unknown>
  flags: Record<string, unknown>
  raw: string[]
}

export interface ParseOptions {
  flags: CommandFlags
  args: CommandArgs
}

export class CommandParser {
  parse(argv: string[], options: ParseOptions): ParsedCommand {
    const args: Record<string, unknown> = {}
    const flags: Record<string, unknown> = {}
    const raw: string[] = []

    // Skip first two elements (node and script path)
    const tokens = argv.slice(2)

    let i = 0
    while (i < tokens.length) {
      const token = tokens[i]!

      if (token.startsWith('--')) {
        // Long flag
        const flagName = token.slice(2)
        const flagDef = options.flags[flagName]

        if (flagDef?.type === 'boolean') {
          flags[flagName] = true
        } else if (flagDef) {
          // Expect value on next token
          i++
          if (i < tokens.length) {
            const value = tokens[i]!
            flags[flagName] = this.coerceValue(value, flagDef.type)
          }
        } else {
          // Unknown flag — store as-is
          flags[flagName] = true
        }
      } else if (token.startsWith('-') && token.length === 2) {
        // Short flag
        const char = token[1]!
        const flagEntry = Object.entries(options.flags).find(([, def]) => def.char === char)

        if (flagEntry) {
          const [name, def] = flagEntry
          if (def.type === 'boolean') {
            flags[name] = true
          } else {
            i++
            if (i < tokens.length) {
              flags[name] = this.coerceValue(tokens[i]!, def.type)
            }
          }
        }
      } else {
        // Positional argument
        raw.push(token)
      }

      i++
    }

    // Map positional arguments to defined args
    const argDefs = Object.entries(options.args)
    for (let j = 0; j < argDefs.length && j < raw.length; j++) {
      const [name, def] = argDefs[j]!
      args[name] = def.variadic ? raw.slice(j) : raw[j]
    }

    return {
      command: raw[0] ?? '',
      subcommand: raw[1],
      args,
      flags,
      raw,
    }
  }

  private coerceValue(value: string, type: string): unknown {
    switch (type) {
      case 'number':
        return Number(value)
      case 'boolean':
        return value === 'true' || value === '1' || value === ''
      case 'enum':
        return value
      default:
        return value
    }
  }
}
