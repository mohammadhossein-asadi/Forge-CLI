import { Command } from 'commander'
import { CLI_NAME, CLI_VERSION, CLI_DESCRIPTION } from '@forge/shared'
import { Kernel } from '@forge/core'
import { runDoctor } from './commands/doctor/index.js'
import { runConfigGet, runConfigSet, runConfigList } from './commands/config/index.js'
import {
  runPluginList,
  runPluginInstall,
  runPluginRemove,
  runPluginSearch,
  runPluginInfo,
  runPluginCreate,
  runPluginUpdate,
  runPluginConfig,
} from './commands/plugin/index.js'
import { runCreate } from './commands/create/index.js'
import { runUpgrade } from './commands/upgrade/index.js'
import { runCompletion } from './commands/completion/index.js'
import { runInit } from './commands/init/index.js'
import { runBuild, runBuildDetect } from './commands/build/index.js'
import { runList, runListAvailable } from './commands/list/index.js'
import { runDev, runDevDetect } from './commands/dev/index.js'

export function createProgram(): Command {
  const program = new Command()

  program
    .name(CLI_NAME)
    .description(CLI_DESCRIPTION)
    .version(CLI_VERSION)
    .option('--verbose', 'Enable verbose output')
    .option('--quiet', 'Suppress all output')
    .option('--json', 'Output in JSON format')
    .option('--no-color', 'Disable colored output')

  // ─── create ──────────────────────────────────────────────────
  program
    .command('create')
    .description('Create a new project')
    .argument('[project-name]', 'Name of the project')
    .option('-t, --template <template>', 'Template to use (react, nextjs, vue, node, library, empty)')
    .option('-p, --package-manager <pm>', 'Package manager (npm, pnpm, yarn, bun)')
    .option('-f, --framework <framework>', 'Framework to use')
    .option('-l, --language <language>', 'Language (typescript, javascript)')
    .option('--no-git', 'Skip git initialization')
    .option('--no-install', 'Skip dependency installation')
    .action(async (projectName, options) => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runCreate(kernel, projectName, options)
      await kernel.shutdown()
    })

  // ─── init ────────────────────────────────────────────────────
  program
    .command('init')
    .description('Initialize Forge in an existing project')
    .action(async () => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runInit(kernel)
      await kernel.shutdown()
    })

  // ─── build ───────────────────────────────────────────────────
  program
    .command('build')
    .description('Build the current project')
    .option('-t, --tool <tool>', 'Build tool to use (vite, tsup, tsc, etc.)')
    .option('-m, --mode <mode>', 'Build mode (production, development)')
    .option('--args <args...>', 'Additional arguments to pass to the build tool')
    .action(async (options) => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runBuild(kernel, {
        tool: options.tool,
        mode: options.mode,
        args: options.args,
      })
      await kernel.shutdown()
    })

  program
    .command('build:detect')
    .description('Detect available build tools')
    .action(async () => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runBuildDetect(kernel)
      await kernel.shutdown()
    })

  // ─── dev ─────────────────────────────────────────────────────
  program
    .command('dev')
    .description('Start the development server')
    .option('-t, --tool <tool>', 'Dev tool to use (vite, next, etc.)')
    .option('-p, --port <port>', 'Port number', parseInt)
    .option('--args <args...>', 'Additional arguments to pass to the dev server')
    .action(async (options) => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runDev(kernel, {
        tool: options.tool,
        port: options.port,
        args: options.args,
      })
      await kernel.shutdown()
    })

  program
    .command('dev:detect')
    .description('Detect available dev tools')
    .action(async () => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runDevDetect(kernel)
      await kernel.shutdown()
    })

  // ─── list ────────────────────────────────────────────────────
  program
    .command('list [type]')
    .description('List items (projects, plugins, templates, config, tools, files)')
    .option('--filter <text>', 'Filter items by name/description')
    .option('--sort <field>', 'Sort by name, version, status, or type')
    .option('--limit <n>', 'Limit number of results', parseInt)
    .option('--json', 'Output as JSON')
    .action(async (type?: string, options?: { filter?: string; sort?: string; limit?: number; json?: boolean }) => {
      const globalOpts = program.opts()
      const kernel = new Kernel({ flags: globalOpts })
      await kernel.bootstrap()
      const opts = {
        ...options,
        json: options?.json ?? globalOpts.json,
      }
      if (type) {
        await runList(kernel, type, opts)
      } else {
        await runListAvailable(kernel)
      }
      await kernel.shutdown()
    })

  // ─── config ──────────────────────────────────────────────────
  const configCmd = program
    .command('config')
    .description('Manage Forge configuration')

  configCmd
    .command('get')
    .description('Get a configuration value')
    .argument('<key>', 'Configuration key (e.g., "defaults.language")')
    .action(async (key: string) => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runConfigGet(kernel, key)
      await kernel.shutdown()
    })

  configCmd
    .command('set')
    .description('Set a configuration value')
    .argument('<key>', 'Configuration key')
    .argument('<value>', 'Configuration value')
    .action(async (key: string, value: string) => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runConfigSet(kernel, key, value)
      await kernel.shutdown()
    })

  configCmd
    .command('list')
    .description('List all configuration values')
    .action(async () => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runConfigList(kernel)
      await kernel.shutdown()
    })

  // ─── plugin ──────────────────────────────────────────────────
  const pluginCmd = program
    .command('plugin')
    .description('Manage Forge plugins')

  pluginCmd
    .command('install')
    .alias('add')
    .description('Install a plugin')
    .argument('<name>', 'Plugin name')
    .action(async (name: string) => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runPluginInstall(kernel, name)
      await kernel.shutdown()
    })

  pluginCmd
    .command('list')
    .description('List installed plugins')
    .action(async () => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runPluginList(kernel)
      await kernel.shutdown()
    })

  pluginCmd
    .command('remove')
    .alias('uninstall')
    .description('Remove a plugin')
    .argument('<name>', 'Plugin name')
    .action(async (name: string) => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runPluginRemove(kernel, name)
      await kernel.shutdown()
    })

  pluginCmd
    .command('search')
    .description('Search for plugins in the marketplace')
    .argument('<query>', 'Search query')
    .action(async (query: string) => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runPluginSearch(kernel, query)
      await kernel.shutdown()
    })

  pluginCmd
    .command('info')
    .description('Show information about a plugin')
    .argument('<name>', 'Plugin name')
    .action(async (name: string) => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runPluginInfo(kernel, name)
      await kernel.shutdown()
    })

  pluginCmd
    .command('create')
    .description('Create a new plugin from template')
    .argument('<name>', 'Plugin name')
    .option('-d, --description <description>', 'Plugin description')
    .option('-a, --author <author>', 'Author name')
    .action(async (name: string, options) => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runPluginCreate(kernel, name, options)
      await kernel.shutdown()
    })

  pluginCmd
    .command('update')
    .description('Check for plugin updates')
    .argument('[name]', 'Plugin name to update (updates all if not specified)')
    .option('--all', 'Update all plugins')
    .action(async (name?: string, options?: { all?: boolean }) => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runPluginUpdate(kernel, { name, all: options?.all })
      await kernel.shutdown()
    })

  pluginCmd
    .command('config')
    .description('Manage plugin configuration')
    .argument('<plugin>', 'Plugin name')
    .argument('[key]', 'Configuration key')
    .argument('[value]', 'Configuration value')
    .action(async (plugin: string, key?: string, value?: string) => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runPluginConfig(kernel, plugin, key, value)
      await kernel.shutdown()
    })

  // ─── doctor ──────────────────────────────────────────────────
  program
    .command('doctor')
    .description('Run health checks')
    .action(async () => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runDoctor(kernel)
      await kernel.shutdown()
    })

  // ─── upgrade ─────────────────────────────────────────────────
  program
    .command('upgrade')
    .description('Upgrade Forge CLI to the latest version')
    .option('--channel <channel>', 'Release channel (stable, beta, nightly)', 'stable')
    .action(async (options) => {
      const kernel = new Kernel({ flags: program.opts() })
      await kernel.bootstrap()
      await runUpgrade(kernel, options)
      await kernel.shutdown()
    })

  // ─── completion ──────────────────────────────────────────────
  program
    .command('completion')
    .description('Generate shell completion scripts')
    .argument('[shell]', 'Shell type (bash, zsh, fish)', 'bash')
    .action(async (shell: string) => {
      await runCompletion(shell)
    })

  return program
}

export const program = createProgram()
