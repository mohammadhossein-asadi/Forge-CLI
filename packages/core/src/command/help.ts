import type { CommandRegistration } from './registry.js'
import type { CommandMetadata } from '@forge/shared'

export interface HelpOptions {
  programName: string
  version: string
  description: string
}

export class HelpFormatter {
  private programName: string
  private description: string

  constructor(options: HelpOptions) {
    this.programName = options.programName
    this.description = options.description
  }

  formatRootHelp(commands: CommandRegistration[]): string {
    const lines: string[] = []

    lines.push('')
    lines.push(`  ${this.description}`)
    lines.push('')
    lines.push('  Usage:')
    lines.push(`    ${this.programName} [options] [command]`)
    lines.push('')
    lines.push('  Options:')
    lines.push('    -V, --version      Output the version number')
    lines.push('    --verbose          Enable verbose output')
    lines.push('    --quiet            Suppress all output')
    lines.push('    --json             Output in JSON format')
    lines.push('    --no-color         Disable colored output')
    lines.push('    -h, --help         Display help for command')
    lines.push('')

    const categories = new Map<string, CommandRegistration[]>()
    for (const cmd of commands) {
      const cat = cmd.metadata.category ?? 'general'
      const list = categories.get(cat) ?? []
      list.push(cmd)
      categories.set(cat, list)
    }

    lines.push('  Commands:')
    for (const [category, cmds] of categories) {
      if (category !== 'general') {
        lines.push(`    ${category}`)
      }
      for (const cmd of cmds) {
        const alias = cmd.metadata.aliases?.[0] ? `|${cmd.metadata.aliases[0]}` : ''
        const args = this.formatArgs(cmd.metadata)
        const maxNameLen = 20
        const nameStr = `    ${cmd.id}${alias}${args}`.padEnd(maxNameLen + 8)
        lines.push(`${nameStr}${cmd.metadata.description}`)
      }
    }

    lines.push('')
    lines.push(`  Run "${this.programName} [command] --help" for more information on a command.`)
    lines.push('')

    return lines.join('\n')
  }

  formatCommandHelp(registration: CommandRegistration): string {
    const { metadata, flags, args } = registration
    const lines: string[] = []

    lines.push('')
    lines.push(`  ${metadata.description}`)
    lines.push('')
    lines.push('  Usage:')
    const usageArgs = this.formatUsageArgs(metadata, args)
    lines.push(`    ${this.programName} ${metadata.id}${usageArgs}`)
    lines.push('')

    if (metadata.aliases && metadata.aliases.length > 0) {
      lines.push('  Aliases:')
      lines.push(`    ${metadata.aliases.join(', ')}`)
      lines.push('')
    }

    if (Object.keys(flags).length > 0) {
      lines.push('  Options:')
      for (const [name, flag] of Object.entries(flags)) {
        const char = flag.char ? `-${flag.char}, ` : '    '
        const value = flag.type !== 'boolean' ? ` <${flag.type}>` : ''
        const defaultVal = flag.default !== undefined ? ` (default: ${JSON.stringify(flag.default)})` : ''
        lines.push(`    ${char}--${name}${value}${flag.required ? ' (required)' : ''}${defaultVal}`)
        if (flag.description) {
          lines.push(`        ${flag.description}`)
        }
      }
      lines.push('')
    }

    if (metadata.examples && metadata.examples.length > 0) {
      lines.push('  Examples:')
      for (const example of metadata.examples) {
        lines.push(`    ${example}`)
      }
      lines.push('')
    }

    return lines.join('\n')
  }

  private formatArgs(_metadata: CommandMetadata): string {
    // Simple arg formatting for root help
    return ''
  }

  private formatUsageArgs(_metadata: CommandMetadata, args: Record<string, { type: string; required?: boolean; variadic?: boolean }>): string {
    const parts: string[] = []
    for (const [name, arg] of Object.entries(args)) {
      if (arg.required) {
        parts.push(arg.variadic ? `<${name}...>` : `<${name}>`)
      } else {
        parts.push(arg.variadic ? `[${name}...]` : `[${name}]`)
      }
    }
    return parts.length > 0 ? ' ' + parts.join(' ') : ''
  }
}
