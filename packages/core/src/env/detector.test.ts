import { describe, it, expect } from 'vitest'
import { EnvironmentDetector } from './detector.js'

describe('EnvironmentDetector', () => {
  const detector = new EnvironmentDetector()

  it('should detect platform', () => {
    const platform = detector.detectPlatform()
    expect(['windows', 'macos', 'linux']).toContain(platform)
  })

  it('should detect arch', () => {
    const arch = detector.detectArch()
    expect(['x64', 'arm64', 'arm']).toContain(arch)
  })

  it('should detect node version', async () => {
    const version = await detector.detectNodeVersion()
    expect(version).toMatch(/^v\d+\.\d+\.\d+$/)
  })

  it('should detect shell', async () => {
    const shell = await detector.detectShell()
    expect(typeof shell).toBe('string')
    expect(shell.length).toBeGreaterThan(0)
  })

  it('should detect terminal info', () => {
    const terminal = detector.detectTerminal()
    expect(typeof terminal.type).toBe('string')
    expect(typeof terminal.supportsColor).toBe('boolean')
    expect(typeof terminal.isInteractive).toBe('boolean')
    expect(typeof terminal.columns).toBe('number')
    expect(typeof terminal.rows).toBe('number')
  })

  it('should detect tools', async () => {
    const tools = await detector.detectTools()
    expect(tools.length).toBeGreaterThan(0)
    for (const tool of tools) {
      expect(typeof tool.name).toBe('string')
      expect(typeof tool.available).toBe('boolean')
    }
  })

  it('should detect git tool', async () => {
    const tool = await detector.detectTool('git')
    expect(tool.name).toBe('git')
    // git may or may not be installed in CI
    expect(typeof tool.available).toBe('boolean')
  })

  it('should return full environment info', async () => {
    const env = await detector.detect()
    expect(env.platform).toBeDefined()
    expect(env.arch).toBeDefined()
    expect(env.nodeVersion).toBeDefined()
    expect(env.nodeMajor).toBeGreaterThanOrEqual(18)
    expect(env.shell).toBeDefined()
    expect(env.terminal).toBeDefined()
    expect(env.tools.length).toBeGreaterThan(0)
  })
})
