import type { ResolvedConfig } from '@forge/shared'
import { CLI_VERSION } from '@forge/shared'
import { Container } from './container/container.js'
import { Logger } from './logging/logger.js'
import { EventBus } from './events/event-bus.js'
import { HookRunner } from './hooks/hook-runner.js'
import { ConfigService } from './config/service.js'
import { PluginManager } from './plugin/manager.js'
import { PluginValidator } from './plugin/validator.js'
import { HealthChecker } from './health/checker.js'
import { ErrorHandler } from './error/handler.js'
import { CommandRegistry } from './command/registry.js'
import { CommandExecutor } from './command/executor.js'
import { EnvironmentDetector, type EnvironmentInfo } from './env/detector.js'
import { WorkspaceDetector, type WorkspaceInfo } from './env/workspace.js'
import { TaskRunner } from './task/task-runner.js'
import { defaultChecks } from './health/checks.js'

export type LifecycleStage =
  | 'pre-bootstrap'
  | 'bootstrap'
  | 'environment-detected'
  | 'config-loaded'
  | 'services-ready'
  | 'plugins-ready'
  | 'commands-ready'
  | 'interactive-ready'
  | 'running'
  | 'idle'
  | 'shutdown-requested'
  | 'shutdown'
  | 'disposed'

export interface KernelOptions {
  verbose?: boolean
  quiet?: boolean
  json?: boolean
  flags?: Record<string, unknown>
  cwd?: string
}

export class Kernel {
  private container: Container
  private logger: Logger
  private bus: EventBus
  private hookRunner: HookRunner
  private configService: ConfigService
  private pluginManager: PluginManager
  private pluginValidator: PluginValidator
  private healthChecker: HealthChecker
  private errorHandler: ErrorHandler
  private commandRegistry: CommandRegistry
  private commandExecutor!: CommandExecutor
  private envDetector: EnvironmentDetector
  private workspaceDetector: WorkspaceDetector
  private taskRunner!: TaskRunner
  private stage: LifecycleStage = 'pre-bootstrap'
  private config!: ResolvedConfig
  private environment!: EnvironmentInfo
  private workspace!: WorkspaceInfo

  constructor(options?: KernelOptions) {
    this.container = new Container()
    this.logger = new Logger({
      level: options?.quiet ? 'silent' : options?.verbose ? 'debug' : 'info',
      colors: !options?.json,
      json: options?.json,
    })
    this.bus = new EventBus()
    this.hookRunner = new HookRunner(this.bus)
    this.configService = new ConfigService({
      logger: this.logger,
      bus: this.bus,
      flags: options?.flags,
      cwd: options?.cwd,
    })
    this.pluginManager = new PluginManager({
      logger: this.logger,
      workspaceRoot: options?.cwd,
    })
    this.pluginValidator = new PluginValidator()
    this.healthChecker = new HealthChecker()
    this.errorHandler = new ErrorHandler({ verbose: options?.verbose })
    this.commandRegistry = new CommandRegistry()
    this.envDetector = new EnvironmentDetector()
    this.workspaceDetector = new WorkspaceDetector()

    this.registerCoreServices()
    this.registerDefaultHealthChecks()
  }

  private registerCoreServices(): void {
    this.container.registerInstance('Container', this.container)
    this.container.registerInstance('Logger', this.logger)
    this.container.registerInstance('EventBus', this.bus)
    this.container.registerInstance('HookRunner', this.hookRunner)
    this.container.registerInstance('ConfigService', this.configService)
    this.container.registerInstance('PluginManager', this.pluginManager)
    this.container.registerInstance('PluginValidator', this.pluginValidator)
    this.container.registerInstance('HealthChecker', this.healthChecker)
    this.container.registerInstance('CommandRegistry', this.commandRegistry)
    this.container.registerInstance('EnvironmentDetector', this.envDetector)
    this.container.registerInstance('WorkspaceDetector', this.workspaceDetector)
    this.container.registerInstance('Kernel', this)
  }

  private registerDefaultHealthChecks(): void {
    for (const check of defaultChecks) {
      this.healthChecker.register(check.name, check)
    }
  }

  async bootstrap(): Promise<void> {
    this.setStage('bootstrap')
    this.logger.debug('Starting bootstrap pipeline')

    // 1. Emit init
    await this.bus.emit('cli:init', { timestamp: Date.now() })

    // 2. Detect environment
    this.setStage('environment-detected')
    this.environment = await this.envDetector.detect()
    this.container.registerInstance('Environment', this.environment)
    this.logger.debug('Environment detected', {
      platform: this.environment.platform,
      arch: this.environment.arch,
      node: this.environment.nodeVersion,
    })

    // 3. Detect workspace
    this.workspace = await this.workspaceDetector.detect()
    this.container.registerInstance('Workspace', this.workspace)
    this.logger.debug('Workspace detected', {
      type: this.workspace.type,
      root: this.workspace.root,
    })

    // 4. Load configuration
    this.setStage('config-loaded')
    this.config = await this.configService.resolve()
    this.container.registerInstance('Config', this.config)
    this.logger.debug('Configuration loaded', { layers: this.config._resolvedFrom })

    // 5. Services ready
    this.setStage('services-ready')
    this.taskRunner = new TaskRunner({
      logger: this.logger,
      bus: this.bus,
      config: this.config,
      cwd: this.workspace.root,
    })
    this.container.registerInstance('TaskRunner', this.taskRunner)

    // 6. Load plugins
    this.setStage('plugins-ready')
    const plugins = await this.pluginManager.loadAll()
    for (const { plugin } of plugins) {
      await this.bus.emit('plugin:loaded', {
        name: plugin.name,
        version: plugin.version,
      })
    }

    // 7. Commands ready
    this.setStage('commands-ready')

    // 8. Create command executor
    this.commandExecutor = new CommandExecutor({
      registry: this.commandRegistry,
      container: this.container,
      bus: this.bus,
      hookRunner: this.hookRunner,
      logger: this.logger,
      config: this.config,
    })
    this.container.registerInstance('CommandExecutor', this.commandExecutor)

    // 9. Ready
    this.setStage('interactive-ready')
    await this.bus.emit('cli:ready', { version: CLI_VERSION })

    this.setStage('running')
    this.logger.debug('Bootstrap complete')
  }

  async executeCommand(commandId: string, args: Record<string, unknown>): Promise<void> {
    await this.commandExecutor.execute(commandId, args)
  }

  async shutdown(reason = 'normal'): Promise<void> {
    if (this.stage === 'disposed') return

    this.setStage('shutdown-requested')
    await this.bus.emit('cli:shutdown', { reason })
    this.setStage('shutdown')

    this.configService.dispose()
    await this.pluginManager.unloadAll()
    await this.container.dispose()

    this.setStage('disposed')
  }

  // Getters
  getContainer(): Container {
    return this.container
  }

  getLogger(): Logger {
    return this.logger
  }

  getBus(): EventBus {
    return this.bus
  }

  getHookRunner(): HookRunner {
    return this.hookRunner
  }

  getConfig(): ResolvedConfig {
    return this.config
  }

  getConfigService(): ConfigService {
    return this.configService
  }

  getEnvironment(): EnvironmentInfo {
    return this.environment
  }

  getWorkspace(): WorkspaceInfo {
    return this.workspace
  }

  getCommandRegistry(): CommandRegistry {
    return this.commandRegistry
  }

  getHealthChecker(): HealthChecker {
    return this.healthChecker
  }

  getErrorHandler(): ErrorHandler {
    return this.errorHandler
  }

  getPluginManager(): PluginManager {
    return this.pluginManager
  }

  getTaskRunner(): TaskRunner {
    return this.taskRunner
  }

  getStage(): LifecycleStage {
    return this.stage
  }

  isRunning(): boolean {
    return this.stage === 'running' || this.stage === 'idle'
  }

  private setStage(stage: LifecycleStage): void {
    this.stage = stage
    this.logger.debug(`Lifecycle stage: ${stage}`)
  }
}
