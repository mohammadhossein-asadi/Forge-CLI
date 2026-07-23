export { ConfigResolver } from './resolver.js'
export { ConfigService } from './service.js'
export { ConfigMigration, DEFAULT_MIGRATIONS } from './migration.js'
export { ConfigWatcher } from './watcher.js'
export { validateConfig, safeValidateConfig } from './schema.js'
export type { ConfigLayer, ForgeConfig, ResolvedConfig } from './types.js'
export type {
  ConfigServiceOptions,
  ConfigGetOptions,
  ConfigSetOptions,
} from './service.js'
export type {
  MigrationRule,
} from './migration.js'
export type {
  ConfigWatcherOptions,
  ConfigChange,
} from './watcher.js'
