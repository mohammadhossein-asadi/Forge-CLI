export type HookHandler = (data: unknown) => void | Promise<void>

export interface HookRegistration {
  event: string
  handler: HookHandler
  priority?: number
}

export interface HookContext {
  event: string
  data: unknown
}
