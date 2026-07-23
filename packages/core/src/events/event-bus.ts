import type { EventMap, EventSubscription } from '@forge/shared'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHandler = (data: any) => void | Promise<void>

interface ListenerEntry {
  handler: AnyHandler
  priority: number
  once: boolean
}

export class EventBus {
  private listeners = new Map<string, Set<ListenerEntry>>()

  on<K extends keyof EventMap>(
    event: K,
    handler: (data: EventMap[K]) => void | Promise<void>,
    options?: { priority?: number; once?: boolean },
  ): EventSubscription {
    return this.subscribe(event as string, handler as AnyHandler, options)
  }

  once<K extends keyof EventMap>(
    event: K,
    handler: (data: EventMap[K]) => void | Promise<void>,
    options?: { priority?: number },
  ): EventSubscription {
    return this.subscribe(event as string, handler as AnyHandler, { ...options, once: true })
  }

  async emit<K extends keyof EventMap>(event: K, data: EventMap[K]): Promise<void> {
    const handlers = this.listeners.get(event as string)
    if (!handlers || handlers.size === 0) return

    const sorted = [...handlers].sort((a, b) => a.priority - b.priority)

    for (const entry of sorted) {
      try {
        await entry.handler(data)
      } catch (_error) {
        // One handler failing shouldn't block others
      }
      if (entry.once) {
        handlers.delete(entry)
      }
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.size ?? 0
  }

  private subscribe(
    event: string,
    handler: AnyHandler,
    options?: { priority?: number; once?: boolean },
  ): EventSubscription {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const entry: ListenerEntry = {
      handler,
      priority: options?.priority ?? 0,
      once: options?.once ?? false,
    }

    this.listeners.get(event)!.add(entry)

    return {
      unsubscribe: () => {
        this.listeners.get(event)?.delete(entry)
      },
    }
  }
}
