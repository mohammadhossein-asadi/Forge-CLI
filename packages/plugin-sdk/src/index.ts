// Schema
export { PluginManifestSchema } from './types.js'
export type {
  PluginManifest,
  ForgePlugin,
  PluginCommand,
  PluginCommandArg,
  PluginCommandFlag,
  PluginCommandResult,
  PluginCommandContext,
  PluginHook,
  PluginGenerator,
  PluginGeneratorContext,
  PluginGeneratorResult,
  PluginConfigProvider,
  PluginTheme,
  PluginContext,
  PluginLogger,
  PluginFileSystem,
  PluginPermission,
  HookEvent,
} from './types.js'
export { PLUGIN_PERMISSIONS } from './types.js'

// Helpers
export {
  createPlugin,
  definePlugin,
  defineCommand,
  defineHook,
  defineGenerator,
  createPluginLogger,
  createPluginFileSystem,
} from './helpers.js'
