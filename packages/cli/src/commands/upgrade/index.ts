import { UpdateManager } from '@forge/core'
import type { Kernel, ReleaseChannel } from '@forge/core'

export async function runUpgrade(_kernel: Kernel, options: { channel?: string }): Promise<void> {
  const channel = (options.channel ?? 'stable') as ReleaseChannel

  console.log('')
  console.log(`  Checking for updates (${channel} channel)...`)
  console.log('')

  const manager = new UpdateManager(channel)
  const info = await manager.checkForUpdates()

  console.log(`  Current version: ${info.currentVersion}`)
  console.log(`  Latest version:  ${info.latestVersion}`)
  console.log('')

  if (info.updateAvailable) {
    console.log('  Update available!')
    console.log('')
    console.log('  To upgrade, run:')
    console.log('    npm install -g forge@latest')
    console.log('')
  } else {
    console.log('  You are running the latest version.')
    console.log('')
  }
}
