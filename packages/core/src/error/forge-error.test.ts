import { describe, it, expect } from 'vitest'
import { ForgeError } from './forge-error.js'
import { ErrorCode } from '@forge/shared'

describe('ForgeError', () => {
  it('should create error with all properties', () => {
    const error = new ForgeError({
      code: ErrorCode.COMMAND_NOT_FOUND,
      title: 'Not found',
      message: 'Command not found',
      description: 'The command does not exist',
      severity: 'error',
      category: 'command',
      recovery: ['Check the command name'],
      docsUrl: 'https://example.com',
      metadata: { command: 'test' },
    })

    expect(error.code).toBe(ErrorCode.COMMAND_NOT_FOUND)
    expect(error.message).toBe('Command not found')
    expect(error.description).toBe('The command does not exist')
    expect(error.severity).toBe('error')
    expect(error.category).toBe('command')
    expect(error.recovery).toEqual(['Check the command name'])
    expect(error.docsUrl).toBe('https://example.com')
    expect(error.metadata).toEqual({ command: 'test' })
  })

  it('should format as string', () => {
    const error = new ForgeError({
      code: ErrorCode.COMMAND_NOT_FOUND,
      title: 'Not found',
      message: 'Command not found',
      recovery: ['Check the command name'],
    })

    const str = error.toFormattedString()
    expect(str).toContain('FORGE_200')
    expect(str).toContain('Command not found')
    expect(str).toContain('Check the command name')
  })

  it('should serialize to JSON', () => {
    const error = new ForgeError({
      code: ErrorCode.INTERNAL,
      title: 'Internal',
      message: 'Something went wrong',
      severity: 'error',
      category: 'general',
    })

    const json = error.toJSON()
    expect(json.code).toBe(ErrorCode.INTERNAL)
    expect(json.message).toBe('Something went wrong')
    expect(json.severity).toBe('error')
  })

  it('should set default values', () => {
    const error = new ForgeError({
      code: ErrorCode.UNKNOWN,
      title: 'Unknown',
      message: 'Unknown error',
    })

    expect(error.severity).toBe('error')
    expect(error.category).toBe('general')
    expect(error.recovery).toEqual([])
  })

  it('should be an instance of Error', () => {
    const error = new ForgeError({
      code: ErrorCode.UNKNOWN,
      title: 'Test',
      message: 'Test error',
    })

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ForgeError)
    expect(error.name).toBe('ForgeError')
  })
})
