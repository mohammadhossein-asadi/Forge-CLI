export interface ListItem {
  name: string
  description?: string
  version?: string
  status?: string
  type?: string
  path?: string
  metadata?: Record<string, unknown>
}

export interface ListOptions {
  type: string
  filter?: string
  sort?: 'name' | 'version' | 'status' | 'type'
  limit?: number
  json?: boolean
}

export interface ListResult {
  items: ListItem[]
  total: number
  type: string
}
