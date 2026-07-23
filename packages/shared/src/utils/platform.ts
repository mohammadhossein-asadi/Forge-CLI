import os from 'node:os'

export type Platform = 'windows' | 'macos' | 'linux'
export type Arch = 'x64' | 'arm64' | 'arm'

export function getPlatform(): Platform {
  const platform = os.platform()
  switch (platform) {
    case 'win32':
      return 'windows'
    case 'darwin':
      return 'macos'
    case 'linux':
      return 'linux'
    default:
      return 'linux'
  }
}

export function getArch(): Arch {
  const arch = os.arch()
  switch (arch) {
    case 'x64':
      return 'x64'
    case 'arm64':
      return 'arm64'
    case 'arm':
      return 'arm'
    default:
      return 'x64'
  }
}

export function getHomeDirectory(): string {
  return os.homedir()
}

export function getConfigDirectory(): string {
  const platform = getPlatform()
  const home = getHomeDirectory()

  switch (platform) {
    case 'windows':
      return process.env.LOCALAPPDATA
        ? `${process.env.LOCALAPPDATA}/forge`
        : `${home}/AppData/Local/forge`
    case 'macos':
      return `${home}/Library/Application Support/forge`
    case 'linux':
      return process.env.XDG_CONFIG_HOME
        ? `${process.env.XDG_CONFIG_HOME}/forge`
        : `${home}/.config/forge`
  }
}

export function getCacheDirectory(): string {
  const platform = getPlatform()
  const home = getHomeDirectory()

  switch (platform) {
    case 'windows':
      return process.env.LOCALAPPDATA
        ? `${process.env.LOCALAPPDATA}/forge/cache`
        : `${home}/AppData/Local/forge/cache`
    case 'macos':
      return `${home}/Library/Caches/forge`
    case 'linux':
      return process.env.XDG_CACHE_HOME
        ? `${process.env.XDG_CACHE_HOME}/forge`
        : `${home}/.cache/forge`
  }
}

export function getDataDirectory(): string {
  const platform = getPlatform()
  const home = getHomeDirectory()

  switch (platform) {
    case 'windows':
      return process.env.LOCALAPPDATA
        ? `${process.env.LOCALAPPDATA}/forge/data`
        : `${home}/AppData/Local/forge/data`
    case 'macos':
      return `${home}/Library/Application Support/forge`
    case 'linux':
      return process.env.XDG_DATA_HOME
        ? `${process.env.XDG_DATA_HOME}/forge`
        : `${home}/.local/share/forge`
  }
}

export function getTerminalColumns(): number {
  return process.stdout.columns ?? 80
}

export function getTerminalRows(): number {
  return process.stdout.rows ?? 24
}

export function supportsColor(): boolean {
  if (process.env.NO_COLOR) return false
  if (process.env.FORCE_COLOR) return true
  return process.stdout?.isTTY ?? false
}

export function isInteractive(): boolean {
  return (process.stdout?.isTTY ?? false) && (process.stdin?.isTTY ?? false)
}
