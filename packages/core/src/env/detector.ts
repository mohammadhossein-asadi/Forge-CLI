import { execSync } from 'node:child_process'
import os from 'node:os'

export interface EnvironmentInfo {
  platform: 'windows' | 'macos' | 'linux'
  arch: 'x64' | 'arm64' | 'arm'
  nodeVersion: string
  nodeMajor: number
  shell: string
  terminal: TerminalInfo
  tools: ToolInfo[]
}

export interface TerminalInfo {
  type: string
  supportsColor: boolean
  isInteractive: boolean
  columns: number
  rows: number
}

export interface ToolInfo {
  name: string
  available: boolean
  version?: string
  path?: string
}

export class EnvironmentDetector {
  async detect(): Promise<EnvironmentInfo> {
    const [nodeVersion, shell, tools] = await Promise.all([
      this.detectNodeVersion(),
      this.detectShell(),
      this.detectTools(),
    ])

    return {
      platform: this.detectPlatform(),
      arch: this.detectArch(),
      nodeVersion,
      nodeMajor: parseInt(nodeVersion.slice(1).split('.')[0]!, 10),
      shell,
      terminal: this.detectTerminal(),
      tools,
    }
  }

  detectPlatform(): EnvironmentInfo['platform'] {
    const p = os.platform()
    if (p === 'win32') return 'windows'
    if (p === 'darwin') return 'macos'
    return 'linux'
  }

  detectArch(): EnvironmentInfo['arch'] {
    const a = os.arch()
    if (a === 'arm64') return 'arm64'
    if (a === 'arm') return 'arm'
    return 'x64'
  }

  async detectNodeVersion(): Promise<string> {
    return process.version
  }

  async detectShell(): Promise<string> {
    const platform = this.detectPlatform()
    if (platform === 'windows') {
      return process.env.ComSpec ? process.env.ComSpec.split('\\').pop()! : 'cmd.exe'
    }
    return process.env.SHELL ?? '/bin/sh'
  }

  detectTerminal(): TerminalInfo {
    const isTty = process.stdout?.isTTY ?? false
    return {
      type: process.env.TERM_PROGRAM ?? process.env.TERM ?? 'unknown',
      supportsColor: this.supportsColor(),
      isInteractive: isTty && (process.stdin?.isTTY ?? false),
      columns: process.stdout?.columns ?? 80,
      rows: process.stdout?.rows ?? 24,
    }
  }

  supportsColor(): boolean {
    if (process.env.NO_COLOR) return false
    if (process.env.FORCE_COLOR) return true
    return process.stdout?.isTTY ?? false
  }

  async detectTools(): Promise<ToolInfo[]> {
    const toolNames = ['git', 'docker', 'node', 'npm', 'pnpm', 'yarn', 'bun']
    const results = await Promise.all(toolNames.map((name) => this.detectTool(name)))
    return results
  }

  async detectTool(name: string): Promise<ToolInfo> {
    try {
      const version = execSync(`${name} --version`, {
        encoding: 'utf-8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim()
      return { name, available: true, version }
    } catch {
      return { name, available: false }
    }
  }
}
