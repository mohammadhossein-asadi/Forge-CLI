// Core engine barrel export
export { Kernel, type KernelOptions, type LifecycleStage } from './kernel.js'
export { bootstrap, type BootstrapOptions } from './bootstrap.js'

// Container
export { Container } from './container/container.js'
export { createContainer, TOKENS } from './container/register.js'

// Command
export { CommandRegistry } from './command/registry.js'
export { CommandExecutor } from './command/executor.js'
export { CommandParser } from './command/parser.js'
export { HelpFormatter } from './command/help.js'
export { CLIRunner } from './command/runner.js'
export { BaseCommand } from './command/types.js'
export type { CommandRegistration } from './command/registry.js'
export type { CommandContext, CommandResult, ParsedArgs } from './command/types.js'
export type { RunnerOptions, CommandAction } from './command/runner.js'

// Config
export { ConfigResolver } from './config/resolver.js'
export { ConfigService } from './config/service.js'
export { ConfigMigration, DEFAULT_MIGRATIONS } from './config/migration.js'
export { ConfigWatcher } from './config/watcher.js'
export { validateConfig, safeValidateConfig } from './config/schema.js'
export type { ConfigLayer } from './config/types.js'
export type { ConfigServiceOptions, ConfigGetOptions, ConfigSetOptions } from './config/service.js'
export type { MigrationRule } from './config/migration.js'
export type { ConfigWatcherOptions, ConfigChange } from './config/watcher.js'

// Events
export { EventBus } from './events/event-bus.js'

// Hooks
export { HookRunner } from './hooks/hook-runner.js'
export type { HookHandler, HookRegistration } from './hooks/types.js'

// Plugin
export { PluginManager } from './plugin/manager.js'
export { PluginRuntime } from './plugin/runtime.js'
export { PluginValidator } from './plugin/validator.js'
export { PluginHookRunner } from './plugin/hooks.js'
export { PluginPermissionManager } from './plugin/permissions.js'
export { PluginSandbox } from './plugin/sandbox.js'
export { MarketplaceClient } from './plugin/marketplace.js'
export { PluginTemplate } from './plugin/template.js'
export { PluginConfigManager } from './plugin/config.js'
export { PluginUpdater } from './plugin/updater.js'
export { PluginInstaller } from './plugin/installer.js'
export {
  PluginError,
  createPluginNotFoundError,
  createPluginLoadError,
  createPluginIncompatibleError,
  createPluginPermissionError,
  createPluginDependencyError,
} from './plugin/errors.js'
export type {
  PluginLoadResult,
  PluginEntry,
  PluginDependencyGraph,
  PluginStatus,
  PluginValidationResult,
} from './plugin/types.js'
export type {
  SandboxOptions,
  SandboxResult,
} from './plugin/sandbox.js'
export type {
  MarketplacePlugin,
  MarketplaceSearchOptions,
  MarketplaceSearchResult,
} from './plugin/marketplace.js'
export type {
  PluginTemplateOptions,
  PluginTemplateResult,
} from './plugin/template.js'
export type {
  PluginConfig,
  PluginConfigOptions,
} from './plugin/config.js'
export type {
  PluginUpdate,
  PluginUpdaterOptions,
} from './plugin/updater.js'
export type {
  InstallOptions,
  InstallResult,
} from './plugin/installer.js'

// Logging
export { Logger } from './logging/logger.js'
export type { LogLevel, LoggerOptions } from './logging/logger.js'

// Error
export { ForgeError } from './error/forge-error.js'
export { ErrorHandler } from './error/handler.js'

// Build
export { BuildDetector } from './build/detector.js'
export { BuildRunner } from './build/runner.js'
export type { BuildTool, BuildDetectorOptions } from './build/detector.js'
export type { BuildOptions, BuildResult, BuildRunnerOptions } from './build/runner.js'

// List
export { Lister } from './list/lister.js'
export type { ListItem, ListOptions, ListResult } from './list/types.js'
export type { ListerOptions } from './list/lister.js'

// Filesystem
export { NodeFileSystem } from './fs/node.js'
export { MemoryFileSystem } from './fs/memory.js'
export { DryRunFileSystem, type DryRunEntry } from './fs/dry-run.js'
export type { FileSystemInterface } from './fs/abstract.js'

// Environment
export { EnvironmentDetector } from './env/detector.js'
export type { EnvironmentInfo, TerminalInfo, ToolInfo } from './env/detector.js'
export { WorkspaceDetector } from './env/workspace.js'
export type { WorkspaceInfo, ProjectInfo } from './env/workspace.js'

// Task Runner
export { TaskRunner } from './task/task-runner.js'
export type { TaskDefinition, TaskContext, TaskResult, TaskState, TaskReport, TaskStatus } from './task/types.js'

// Health
export { HealthChecker, type HealthCheckResult, type HealthReport, type HealthCheckFn } from './health/checker.js'
export { defaultChecks } from './health/checks.js'

// Update
export { UpdateManager, type UpdateInfo } from './update/manager.js'
export { type ReleaseChannel, CHANNEL_CONFIGS } from './update/channels.js'
