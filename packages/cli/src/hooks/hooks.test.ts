import { describe, expect, it } from 'vitest'
import { useApp } from './use-app.js'
import { useCommand } from './use-command.js'
import { useTheme } from './use-theme.js'

describe('useApp', () => {
  it('returns sensible CLI defaults', () => {
    const context = useApp()
    expect(context.cliName).toBe('forge')
    expect(context.cliVersion).toBe('0.1.0')
    expect(context).toMatchObject({ verbose: false, quiet: false, json: false, noColor: false })
  })

  it('lets callers override any flag', () => {
    const context = useApp({ verbose: true, json: true, cliVersion: '9.9.9' })
    expect(context.verbose).toBe(true)
    expect(context.json).toBe(true)
    expect(context.cliVersion).toBe('9.9.9')
    expect(context.quiet).toBe(false)
  })
})

describe('useCommand', () => {
  it('defaults to a non-running state', () => {
    expect(useCommand({ id: 'build' })).toEqual({ id: 'build', running: false })
  })

  it('exposes the running state', () => {
    expect(useCommand({ id: 'dev', running: true })).toEqual({ id: 'dev', running: true })
  })
})

describe('useTheme', () => {
  it('falls back to the default dark theme', () => {
    const theme = useTheme()
    expect(theme.name).toBe('dark')
    expect(theme.colors.success).toBe('#4ADE80')
  })

  it('resolves a named theme', () => {
    expect(useTheme({ themeName: 'nord' }).name).toBe('nord')
    expect(useTheme({ themeName: 'dracula' }).colors.primary).toBe('#BD93F9')
  })

  it('falls back to the default theme for unknown names', () => {
    expect(useTheme({ themeName: 'does-not-exist' }).name).toBe('dark')
  })

  it('covers all nine built-in themes', () => {
    for (const name of [
      'dark',
      'light',
      'nord',
      'tokyo-night',
      'catppuccin',
      'dracula',
      'gruvbox',
      'solarized',
      'minimal',
    ]) {
      expect(useTheme({ themeName: name }).name).toBe(name)
    }
  })
})
