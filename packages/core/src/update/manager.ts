import { CLI_VERSION } from '@forge/shared'
import type { ReleaseChannel } from './channels.js'
import { CHANNEL_CONFIGS } from './channels.js'

export interface UpdateInfo {
  currentVersion: string
  latestVersion: string
  updateAvailable: boolean
  channel: ReleaseChannel
}

export class UpdateManager {
  private channel: ReleaseChannel
  private lastCheck: Date | null = null

  constructor(channel: ReleaseChannel = 'stable') {
    this.channel = channel
  }

  async checkForUpdates(): Promise<UpdateInfo> {
    const config = CHANNEL_CONFIGS[this.channel]

    try {
      const response = await fetch(config.registryUrl)
      const data = await response.json() as { 'dist-tags'?: Record<string, string> }
      const latestVersion = data['dist-tags']?.[this.channel] ?? data['dist-tags']?.latest ?? CLI_VERSION

      this.lastCheck = new Date()

      return {
        currentVersion: CLI_VERSION,
        latestVersion,
        updateAvailable: this.isUpdateAvailable(CLI_VERSION, latestVersion),
        channel: this.channel,
      }
    } catch {
      return {
        currentVersion: CLI_VERSION,
        latestVersion: CLI_VERSION,
        updateAvailable: false,
        channel: this.channel,
      }
    }
  }

  shouldCheck(): boolean {
    if (!this.lastCheck) return true
    const config = CHANNEL_CONFIGS[this.channel]
    return Date.now() - this.lastCheck.getTime() > config.checkInterval
  }

  private isUpdateAvailable(current: string, latest: string): boolean {
    const currentParts = current.split('.').map(Number)
    const latestParts = latest.split('.').map(Number)

    for (let i = 0; i < 3; i++) {
      const c = currentParts[i] ?? 0
      const l = latestParts[i] ?? 0
      if (l > c) return true
      if (l < c) return false
    }

    return false
  }
}
