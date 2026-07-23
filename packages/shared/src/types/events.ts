export interface EventMap {
  'cli:init': { timestamp: number }
  'cli:ready': { version: string }
  'cli:shutdown': { reason: string }

  'command:started': {
    commandId: string
    args: Record<string, unknown>
    timestamp: number
  }
  'command:finished': {
    commandId: string
    success: boolean
    duration: number
    error?: string
  }
  'command:error': {
    commandId: string
    error: Error
  }

  'config:loaded': { path: string; layers: string[] }
  'config:changed': {
    path: string
    key: string
    oldValue: unknown
    newValue: unknown
  }

  'plugin:loaded': { name: string; version: string }
  'plugin:error': { name: string; error: Error }

  'project:created': {
    path: string
    template: string
    packages: string[]
  }
  'project:configured': {
    path: string
    settings: Record<string, unknown>
  }

  'template:installed': { name: string; path: string }
  'deployment:started': { target: string; provider: string }
  'deployment:finished': {
    target: string
    provider: string
    success: boolean
  }
}

export type EventKey = keyof EventMap
export type EventHandler<T = unknown> = (data: T) => void | Promise<void>
export type EventSubscription = { unsubscribe: () => void }
