import { Container } from './container.js'
import { Logger } from '../logging/logger.js'
import { EventBus } from '../events/event-bus.js'
import { HookRunner } from '../hooks/hook-runner.js'
import { ConfigResolver } from '../config/resolver.js'

export const TOKENS = {
  Container: 'Container',
  Logger: 'Logger',
  EventBus: 'EventBus',
  HookRunner: 'HookRunner',
  ConfigResolver: 'ConfigResolver',
} as const

export function createContainer(): Container {
  const container = new Container()

  // Register core services
  container.registerSingleton(TOKENS.Logger, () => new Logger({ level: 'info' }))
  container.registerSingleton(TOKENS.EventBus, () => new EventBus())
  container.registerSingleton(
    TOKENS.HookRunner,
    (c) => new HookRunner(c.resolve(TOKENS.EventBus)),
  )
  container.registerSingleton(TOKENS.ConfigResolver, () => new ConfigResolver())

  return container
}
