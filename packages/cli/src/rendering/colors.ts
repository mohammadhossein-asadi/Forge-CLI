import chalk from 'chalk'
import type { ThemeColors } from './theme.js'

export function createChalkColors(colors: ThemeColors) {
  return {
    primary: chalk.hex(colors.primary),
    secondary: chalk.hex(colors.secondary),
    success: chalk.hex(colors.success),
    warning: chalk.hex(colors.warning),
    error: chalk.hex(colors.error),
    info: chalk.hex(colors.info),
    muted: chalk.hex(colors.muted),
    accent: chalk.hex(colors.accent),
    focus: chalk.hex(colors.focus),
    border: chalk.hex(colors.border),
    bold: chalk.bold,
    dim: chalk.dim,
    italic: chalk.italic,
    underline: chalk.underline,
    strikethrough: chalk.strikethrough,
  }
}
