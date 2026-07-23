import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Logger } from './logger.js'

describe('Logger', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>
  let stderrSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
  })

  afterEach(() => {
    stdoutSpy.mockRestore()
    stderrSpy.mockRestore()
  })

  it('should log info messages', () => {
    const logger = new Logger({ level: 'info', colors: false })
    logger.info('hello')
    expect(stdoutSpy).toHaveBeenCalled()
  })

  it('should not log debug when level is info', () => {
    const logger = new Logger({ level: 'info', colors: false })
    logger.debug('debug msg')
    expect(stdoutSpy).not.toHaveBeenCalled()
  })

  it('should log debug when level is debug', () => {
    const logger = new Logger({ level: 'debug', colors: false })
    logger.debug('debug msg')
    expect(stdoutSpy).toHaveBeenCalled()
  })

  it('should log errors to stderr', () => {
    const logger = new Logger({ level: 'debug', colors: false })
    logger.error('error msg')
    expect(stderrSpy).toHaveBeenCalled()
  })

  it('should create child loggers with prefix', () => {
    const logger = new Logger({ level: 'debug', colors: false })
    const child = logger.child('module')
    child.info('test')
    expect(stdoutSpy).toHaveBeenCalled()
  })

  it('should support log level changes', () => {
    const logger = new Logger({ level: 'error', colors: false })
    logger.info('should not log')
    expect(stdoutSpy).not.toHaveBeenCalled()

    logger.setLevel('info')
    logger.info('should log')
    expect(stdoutSpy).toHaveBeenCalled()
  })

  it('should include data in output', () => {
    const logger = new Logger({ level: 'debug', colors: false })
    logger.info('with data', { key: 'value' })
    expect(stdoutSpy).toHaveBeenCalled()
  })
})
