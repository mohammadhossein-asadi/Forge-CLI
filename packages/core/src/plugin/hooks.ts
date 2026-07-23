import type { PluginHook } from '@forge/shared'

export type HookHandler = (data: unknown) => void | Promise<void>

export interface HookRegistration {
  event: string
  handler: HookHandler
  priority: number
  pluginName?: string
}

export class PluginHookRunner {
  private hooks = new Map<string, HookRegistration[]>()

  register(hooks: PluginHook[], pluginName?: string): void {
    for (const hook of hooks) {
      const list = this.hooks.get(hook.event) ?? []
      list.push({
        event: hook.event,
        handler: hook.handler as HookHandler,
        priority: hook.priority ?? 0,
        pluginName,
      })
      list.sort((a, b) => a.priority - b.priority)
      this.hooks.set(hook.event, list)
    }
  }

  async run(event: string, data: unknown): Promise<void> {
    const hooks = this.hooks.get(event)
    if (!hooks) return

    for (const hook of hooks) {
      try {
        await hook.handler(data)
      } catch (error) {
        // Hook failures should not break the pipeline
        const source = hook.pluginName ? ` (plugin: ${hook.pluginName})` : ''
        console.error(`Hook error for event "${event}"${source}:`, error)
      }
    }
  }

  remove(event: string, handler?: HookHandler): void {
    if (!handler) {
      this.hooks.delete(event)
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

  getByEvent(event: string): HookRegistration[] {
    return this.hooks.get(event) ?? []
  }

  getByPlugin(pluginName: string): HookRegistration[] {
    return this.list().filter((h) => h.pluginName === pluginName)
  }
}
