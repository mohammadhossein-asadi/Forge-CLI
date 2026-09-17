import { describe, expect, it } from 'vitest'
import { withCapturedConsole } from '../../testing/console.js'
import { runCompletion } from './index.js'

describe('completion command', () => {
  it('prints a bash completion script mentioning forge', async () => {
    const { capture } = await withCapturedConsole(() => runCompletion('bash'))
    const out = capture.output()
    expect(out).toContain('bash completion')
    expect(out).toContain('_forgocomplete')
    expect(out).toContain('complete -F _forgocomplete forge')
  })

  it('prints a zsh completion script', async () => {
    const { capture } = await withCapturedConsole(() => runCompletion('zsh'))
    expect(capture.output()).toContain('compdef _forgocomplete forge')
  })

  it('prints a fish completion script', async () => {
    const { capture } = await withCapturedConsole(() => runCompletion('fish'))
    const out = capture.output()
    expect(out).toContain('complete -c forge')
    expect(out).toContain('__fish_use_subcommand')
  })

  it('rejects unsupported shells with a hint', async () => {
    const { capture } = await withCapturedConsole(() => runCompletion('powershell'))
    const out = capture.output()
    expect(out).toContain('Unsupported shell: powershell')
    expect(out).toContain('bash, zsh, fish')
  })
})
