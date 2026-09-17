import chalk from 'chalk'
import { describe, expect, it } from 'vitest'
import { createChalkColors } from './colors.js'
import { defaultTheme, getTheme, themes } from './theme.js'

describe('theme registry', () => {
  it('exposes the default dark theme', () => {
    expect(defaultTheme.name).toBe('dark')
    expect(defaultTheme.colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it('registers all nine built-in themes', () => {
    expect(Object.keys(themes).sort()).toEqual(
      [
        'catppuccin',
        'dark',
        'dracula',
        'gruvbox',
        'light',
        'minimal',
        'nord',
        'solarized',
        'tokyo-night',
      ].sort(),
    )
  })

  it('getTheme resolves by name and falls back to dark', () => {
    expect(getTheme('nord').name).toBe('nord')
    expect(getTheme('nope').name).toBe('dark')
    expect(getTheme().name).toBe('dark')
  })

  it('every theme defines the full semantic color palette', () => {
    const required = [
      'primary',
      'secondary',
      'success',
      'warning',
      'error',
      'info',
      'muted',
      'accent',
      'focus',
      'border',
      'background',
      'foreground',
    ] as const
    for (const [name, theme] of Object.entries(themes)) {
      for (const key of required) {
        expect(theme.colors[key], `${name}.${key}`).toMatch(/^#[0-9A-Fa-f]{6}$/)
      }
    }
  })
})

describe('createChalkColors', () => {
  it('wraps text in ANSI color codes when color is enabled', () => {
    chalk.level = 3
    const colors = createChalkColors(defaultTheme.colors)
    const painted = colors.error('boom')
    expect(painted).not.toBe('boom')
    expect(painted).toContain('\u001B[')
  })

  it('exposes text modifiers', () => {
    const colors = createChalkColors(defaultTheme.colors)
    expect(colors.bold('x')).toBe(chalk.bold('x'))
    expect(colors.dim('x')).toBe(chalk.dim('x'))
    expect(colors.underline('x')).toBe(chalk.underline('x'))
  })
})
