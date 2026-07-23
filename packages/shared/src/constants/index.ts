export const CLI_NAME = 'forge'
export const CLI_VERSION = '0.1.0'
export const CLI_DESCRIPTION = 'Forge CLI — a next-generation AI-native developer platform'

export const CONFIG_FILE_NAMES = [
  'forge.toml',
  'forge.config.toml',
  '.forge/config.toml',
  'forge.json',
  '.forge/config.json',
  'forge.yaml',
  '.forge/config.yaml',
] as const

export const CONFIG_DIR_NAME = '.forge'
export const GLOBAL_CONFIG_DIR = '.forge'
export const TEMPLATE_DIR_NAME = 'templates'
export const PLUGIN_DIR_NAME = 'plugins'

export const ENV_PREFIX = 'FORGE' as const

export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  MISUSE: 2,
  CANNOT_INVOKE: 126,
  NOT_FOUND: 127,
  INVALID_ARGUMENT: 128,
  SIGINT: 130,
} as const

export const LOG_LEVELS = {
  SILENT: -1,
  ERROR: 0,
  WARNING: 1,
  INFO: 2,
  VERBOSE: 3,
  DEBUG: 4,
  TRACE: 5,
} as const

export const HOOK_EVENTS = {
  CLI_INIT: 'cli:init',
  CLI_READY: 'cli:ready',
  CLI_SHUTDOWN: 'cli:shutdown',
  COMMAND_PRERUN: 'command:prerun',
  COMMAND_POSTRUN: 'command:postrun',
  COMMAND_ERROR: 'command:error',
  PROJECT_CREATED: 'project:created',
  PROJECT_CONFIGURED: 'project:configured',
} as const

export const DEFAULT_PERMISSIONS = [
  'filesystem.read',
  'filesystem.write',
  'network.read',
] as const
