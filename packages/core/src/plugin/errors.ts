import { ErrorCode } from '@forge/shared'
import { ForgeError } from '../error/forge-error.js'

export class PluginError extends ForgeError {
  constructor(options: {
    code: ErrorCode
    message: string
    pluginName?: string
    cause?: Error
    recovery?: string[]
  }) {
    super({
      code: options.code,
      title: `Plugin Error: ${options.pluginName ?? 'unknown'}`,
      message: options.message,
      severity: 'error',
      category: 'plugin',
      cause: options.cause,
      recovery: options.recovery ?? [
        'Check the plugin name and version',
        'Ensure the plugin is installed correctly',
        'Check plugin compatibility with Forge CLI',
      ],
    })
  }
}

export function createPluginNotFoundError(name: string): PluginError {
  return new PluginError({
    code: ErrorCode.PLUGIN_NOT_FOUND,
    message: `Plugin "${name}" not found.`,
    pluginName: name,
    recovery: [
      `Install the plugin with: forge plugin install ${name}`,
      'Check the plugin name for typos',
      'Search for available plugins: forge plugin search ' + name,
    ],
  })
}

export function createPluginLoadError(name: string, cause: Error): PluginError {
  return new PluginError({
    code: ErrorCode.PLUGIN_LOAD_FAILED,
    message: `Failed to load plugin "${name}": ${cause.message}`,
    pluginName: name,
    cause,
    recovery: [
      'Check if the plugin is properly installed',
      'Ensure the plugin entry point exists',
      'Check for missing dependencies',
      'Try reinstalling the plugin',
    ],
  })
}

export function createPluginIncompatibleError(name: string, required: string, actual: string): PluginError {
  return new PluginError({
    code: ErrorCode.PLUGIN_INCOMPATIBLE,
    message: `Plugin "${name}" requires Forge CLI ${required}, but found ${actual}`,
    pluginName: name,
    recovery: [
      'Update Forge CLI to the required version',
      'Find a compatible version of the plugin',
      'Check the plugin documentation for compatibility info',
    ],
  })
}

export function createPluginPermissionError(name: string, permission: string): PluginError {
  return new PluginError({
    code: ErrorCode.PLUGIN_PERMISSION_DENIED,
    message: `Plugin "${name}" requires permission "${permission}" which was not granted.`,
    pluginName: name,
    recovery: [
      `Grant the permission with: forge plugin permissions grant ${name} ${permission}`,
      'Check the plugin permissions before installation',
    ],
  })
}

export function createPluginDependencyError(name: string, dependency: string): PluginError {
  return new PluginError({
    code: ErrorCode.PLUGIN_DEPENDENCY_MISSING,
    message: `Plugin "${name}" depends on "${dependency}" which is not installed.`,
    pluginName: name,
    recovery: [
      `Install the dependency: forge plugin install ${dependency}`,
      'Check the plugin documentation for required dependencies',
    ],
  })
}
