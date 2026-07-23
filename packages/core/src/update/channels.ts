export type ReleaseChannel = 'stable' | 'beta' | 'nightly'

export interface ChannelConfig {
  channel: ReleaseChannel
  registryUrl: string
  checkInterval: number // milliseconds
}

export const CHANNEL_CONFIGS: Record<ReleaseChannel, ChannelConfig> = {
  stable: {
    channel: 'stable',
    registryUrl: 'https://registry.npmjs.org/forge',
    checkInterval: 24 * 60 * 60 * 1000, // 24 hours
  },
  beta: {
    channel: 'beta',
    registryUrl: 'https://registry.npmjs.org/forge',
    checkInterval: 12 * 60 * 60 * 1000, // 12 hours
  },
  nightly: {
    channel: 'nightly',
    registryUrl: 'https://registry.npmjs.org/forge',
    checkInterval: 6 * 60 * 60 * 1000, // 6 hours
  },
}
