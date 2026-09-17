import { describe, expect, it } from 'vitest'
import {
  CLI_DESCRIPTION,
  CLI_NAME,
  CLI_VERSION,
  CONFIG_FILE_NAMES,
  EXIT_CODES,
  HOOK_EVENTS,
} from './index.js'

describe('shared constants', () => {
  it('identifies the CLI', () => {
    expect(CLI_NAME).toBe('forge')
    expect(CLI_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
    expect(CLI_DESCRIPTION.length).toBeGreaterThan(0)
  })

  it('lists every supported config file name', () => {
    expect(CONFIG_FILE_NAMES).toContain('forge.toml')
    expect(CONFIG_FILE_NAMES).toContain('forge.json')
    expect(CONFIG_FILE_NAMES).toContain('.forge/config.json')
  })

  it('keeps exit codes POSIX-compatible', () => {
    expect(EXIT_CODES.SUCCESS).toBe(0)
    expect(EXIT_CODES.GENERAL_ERROR).toBe(1)
    expect(EXIT_CODES.SIGINT).toBe(130)
  })

  it('defines the lifecycle hook events used by the event bus', () => {
    expect(HOOK_EVENTS.COMMAND_PRERUN).toBe('command:prerun')
    expect(HOOK_EVENTS.COMMAND_POSTRUN).toBe('command:postrun')
    expect(HOOK_EVENTS.PROJECT_CREATED).toBe('project:created')
  })
})
