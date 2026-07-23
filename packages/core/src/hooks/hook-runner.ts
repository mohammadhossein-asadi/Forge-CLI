import type { EventBus } from '../events/event-bus.js'
import type { HookHandler, HookRegistration } from './types.js'

export class HookRunner {
  private hooks = new Map<string, HookRegistration[]>()
  private bus: EventBus

  constructor(bus: EventBus) {
    this.bus = bus
  }

  register(event: string, handler: HookHandler, priority = 0): void {
    const list = this.hooks.get(event) ?? []
    list.push({ event, handler, priority })
    list.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
    this.hooks.set(event, list)

    // Also register on the event bus
    this.bus.on(event as never, handler as never, { priority })
  }

  async run(event: string, data: unknown): Promise<void> {
    const hooks = this.hooks.get(event)
    if (!hooks) return

    for (const hook of hooks) {
      try {
        await hook.handler(data)
      } catch (error) {
        // Hook failures should not break the pipeline
        console.error(`Hook error for event "${event}":`, error)
      }
    }
  }

  remove(event: string, handler?: HookHandler): void {
    if (!handler) {
      this.hooks.delete(event)
      this.bus.removeAllListeners(event)
    } else {
      const list = this.hooks.get(event) ?? []
      this.hooks.set(
        event,
        list.filter((h) => h.handler !== handler),
      )
    }
  }

  list(): HookRegistration[] {
    return [...this.hooks.values()].flat()
  }
}
