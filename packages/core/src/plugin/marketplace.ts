import type { Logger } from '../logging/logger.js'

export interface MarketplacePlugin {
  name: string
  version: string
  description: string
  author: string
  downloads: number
  rating: number
  verified: boolean
  official: boolean
  keywords: string[]
  repository?: string
  homepage?: string
}

export interface MarketplaceSearchOptions {
  query?: string
  category?: string
  sortBy?: 'downloads' | 'rating' | 'name' | 'updated'
  limit?: number
  offset?: number
}

export interface MarketplaceSearchResult {
  plugins: MarketplacePlugin[]
  total: number
  page: number
  pageSize: number
}

export class MarketplaceClient {
  private logger: Logger
  private registryUrl: string

  constructor(options?: { logger?: Logger; registryUrl?: string }) {
    this.logger = options?.logger ?? console as unknown as Logger
    this.registryUrl = options?.registryUrl ?? 'https://registry.npmjs.org'
  }

  async search(options: MarketplaceSearchOptions = {}): Promise<MarketplaceSearchResult> {
    const { query = '', limit = 20, offset = 0 } = options

    try {
      // Search npm for forge plugins
      const searchUrl = `${this.registryUrl}/-/v1/search?text=${encodeURIComponent(query + ' forge-plugin')}&size=${limit}&from=${offset}`
      const response = await fetch(searchUrl)

      if (!response.ok) {
        return { plugins: [], total: 0, page: 0, pageSize: limit }
      }

      const data = await response.json() as {
        objects: Array<{
          package: {
            name: string
            version: string
            description?: string
            author?: { name?: string }
            keywords?: string[]
            links?: { repository?: string; npm?: string }
          }
          score?: { final?: number }
        }>
        total: number
      }

      const plugins: MarketplacePlugin[] = data.objects.map((obj) => ({
        name: obj.package.name,
        version: obj.package.version,
        description: obj.package.description ?? '',
        author: obj.package.author?.name ?? 'unknown',
        downloads: 0,
        rating: obj.score?.final ?? 0,
        verified: obj.package.name.startsWith('@forge/'),
        official: obj.package.name.startsWith('@forge/plugin-'),
        keywords: obj.package.keywords ?? [],
        repository: obj.package.links?.repository,
        homepage: obj.package.links?.npm,
      }))

      return {
        plugins,
        total: data.total,
        page: Math.floor(offset / limit),
        pageSize: limit,
      }
    } catch (error) {
      this.logger.debug(`Marketplace search failed: ${error}`)
      return { plugins: [], total: 0, page: 0, pageSize: limit }
    }
  }

  async getPlugin(name: string): Promise<MarketplacePlugin | null> {
    try {
      const response = await fetch(`${this.registryUrl}/${encodeURIComponent(name)}/latest`)
      if (!response.ok) return null

      const data = await response.json() as {
        name: string
        version: string
        description?: string
        author?: { name?: string }
        keywords?: string[]
        repository?: { url?: string }
        homepage?: string
      }

      return {
        name: data.name,
        version: data.version,
        description: data.description ?? '',
        author: data.author?.name ?? 'unknown',
        downloads: 0,
        rating: 0,
        verified: data.name.startsWith('@forge/'),
        official: data.name.startsWith('@forge/plugin-'),
        keywords: data.keywords ?? [],
        repository: data.repository?.url,
        homepage: data.homepage,
      }
    } catch {
      return null
    }
  }

  async getVersions(name: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.registryUrl}/${encodeURIComponent(name)}`)
      if (!response.ok) return []

      const data = await response.json() as { versions?: Record<string, unknown> }
      return Object.keys(data.versions ?? {})
    } catch {
      return []
    }
  }

  async getLatestVersion(name: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.registryUrl}/${encodeURIComponent(name)}/latest`)
      if (!response.ok) return null

      const data = await response.json() as { version?: string }
      return data.version ?? null
    } catch {
      return null
    }
  }
}
