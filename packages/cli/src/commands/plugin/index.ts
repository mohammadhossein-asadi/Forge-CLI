import { Kernel, MarketplaceClient, PluginTemplate, PluginUpdater, PluginInstaller } from '@forge/core'
import { CLI_NAME } from '@forge/shared'

export async function runPluginList(kernel: Kernel): Promise<void> {
  const manager = kernel.getPluginManager()
  const entries = manager.getAllEntries()

  if (entries.length === 0) {
    console.log('')
    console.log('  No plugins installed.')
    console.log('')
    console.log('  Install a plugin with:')
    console.log(`    ${CLI_NAME} plugin install <name>`)
    console.log('')
    console.log('  Search for plugins:')
    console.log(`    ${CLI_NAME} plugin search <query>`)
    console.log('')
    return
  }

  console.log('')
  console.log('  Installed Plugins')
  console.log('')

  for (const entry of entries) {
    const statusIcon = entry.status === 'loaded' ? '✔' : entry.status === 'error' ? '✘' : '○'
    console.log(`    ${statusIcon} ${entry.name} v${entry.version}`)
    if (entry.commands.length > 0) {
      console.log(`      Commands: ${entry.commands.map((c) => c.name).join(', ')}`)
    }
    if (entry.hooks.length > 0) {
      console.log(`      Hooks: ${entry.hooks.map((h) => h.event).join(', ')}`)
    }
    if (entry.generators.length > 0) {
      console.log(`      Generators: ${entry.generators.map((g) => g.name).join(', ')}`)
    }
  }

  console.log('')
}

export async function runPluginInstall(kernel: Kernel, name: string, options?: { version?: string; dryRun?: boolean }): Promise<void> {
  const logger = kernel.getLogger()
  const workspace = kernel.getWorkspace()
  const installer = new PluginInstaller()
  const manager = kernel.getPluginManager()

  console.log('')
  console.log(`  Installing plugin: ${name}`)
  console.log('')

  // 1. Install via package manager
  const result = await installer.install({
    name,
    version: options?.version,
    workspaceRoot: workspace.root,
    logger,
    dryRun: options?.dryRun,
  })

  if (!result.success) {
    console.log('')
    console.log(`  ✘ Failed to install "${name}"`)
    if (result.error) {
      console.log(`    ${result.error}`)
    }
    console.log('')
    console.log('  Suggestions:')
    console.log(`    Check if the plugin exists: ${CLI_NAME} plugin search ${name}`)
    console.log(`    Check your internet connection`)
    console.log(`    Check your package manager is installed`)
    console.log('')
    return
  }

  // 2. Load the plugin
  const plugin = await manager.loadByName(name)
  if (plugin) {
    console.log(`  ✔ Plugin "${name}" installed successfully`)
    if (result.version) {
      console.log(`    Version: ${result.version}`)
    }
    console.log(`    Package Manager: ${result.packageManager}`)
    console.log(`    Duration: ${result.duration.toFixed(0)}ms`)
    if (plugin.commands && plugin.commands.length > 0) {
      console.log(`    Commands: ${plugin.commands.map((c) => c.name).join(', ')}`)
    }
    if (plugin.hooks && plugin.hooks.length > 0) {
      console.log(`    Hooks: ${plugin.hooks.map((h) => h.event).join(', ')}`)
    }
    console.log('')
  } else {
    console.log(`  ✔ Plugin "${name}" installed`)
    if (result.version) {
      console.log(`    Version: ${result.version}`)
    }
    console.log('')
    console.log('  Note: Plugin could not be loaded. It may not be a valid Forge plugin.')
    console.log('')
  }
}

export async function runPluginRemove(kernel: Kernel, name: string): Promise<void> {
  const logger = kernel.getLogger()
  const workspace = kernel.getWorkspace()
  const installer = new PluginInstaller()
  const manager = kernel.getPluginManager()

  console.log('')
  console.log(`  Removing plugin: ${name}`)
  console.log('')

  // 1. Uninstall via package manager
  const result = await installer.uninstall({
    name,
    workspaceRoot: workspace.root,
    logger,
  })

  if (!result.success) {
    console.log('')
    console.log(`  ✘ Failed to remove "${name}"`)
    if (result.error) {
      console.log(`    ${result.error}`)
    }
    console.log('')
    return
  }

  // 2. Unload from plugin manager
  await manager.unload(name)

  console.log(`  ✔ Plugin "${name}" removed successfully`)
  console.log(`    Duration: ${result.duration.toFixed(0)}ms`)
  console.log('')
}

export async function runPluginSearch(kernel: Kernel, query: string): Promise<void> {
  const logger = kernel.getLogger()
  const marketplace = new MarketplaceClient({ logger })

  console.log('')
  console.log(`  Searching for plugins matching "${query}"...`)
  console.log('')

  const result = await marketplace.search({ query, limit: 10 })

  if (result.plugins.length === 0) {
    console.log('  No plugins found.')
    console.log('')
    return
  }

  console.log('  Found plugins:')
  console.log('')

  for (const plugin of result.plugins) {
    const badge = plugin.official ? ' [official]' : plugin.verified ? ' [verified]' : ''
    console.log(`    ${plugin.name}${badge}`)
    console.log(`      ${plugin.description}`)
    console.log(`      v${plugin.version} • ${plugin.author}`)
    if (plugin.keywords.length > 0) {
      console.log(`      Keywords: ${plugin.keywords.slice(0, 5).join(', ')}`)
    }
    console.log('')
  }

  console.log(`  Total: ${result.total} results`)
  console.log('')
  console.log(`  Install with: ${CLI_NAME} plugin install <name>`)
  console.log('')
}

export async function runPluginInfo(kernel: Kernel, name: string): Promise<void> {
  const marketplace = new MarketplaceClient({ logger: kernel.getLogger() })

  console.log('')
  console.log(`  Fetching info for "${name}"...`)
  console.log('')

  const plugin = await marketplace.getPlugin(name)
  if (!plugin) {
    console.log(`  Plugin "${name}" not found.`)
    console.log('')
    return
  }

  console.log(`  ${plugin.name}`)
  console.log(`    Version: ${plugin.version}`)
  console.log(`    Author: ${plugin.author}`)
  console.log(`    ${plugin.description}`)
  if (plugin.keywords.length > 0) {
    console.log(`    Keywords: ${plugin.keywords.join(', ')}`)
  }
  if (plugin.repository) {
    console.log(`    Repository: ${plugin.repository}`)
  }
  if (plugin.homepage) {
    console.log(`    Homepage: ${plugin.homepage}`)
  }
  console.log('')
  console.log(`  Install with: ${CLI_NAME} plugin install ${plugin.name}`)
  console.log('')
}

export async function runPluginCreate(kernel: Kernel, name: string, options: { description?: string; author?: string }): Promise<void> {
  const logger = kernel.getLogger()
  const template = new PluginTemplate(logger)
  const workspace = kernel.getWorkspace()

  const result = await template.scaffold({
    name,
    description: options.description,
    author: options.author,
    outputDir: workspace.root,
    logger,
  })

  if (result.success) {
    console.log('')
    console.log(`  ✔ Plugin "${name}" created successfully!`)
    console.log('')
    console.log('  Files created:')
    for (const file of result.files) {
      console.log(`    ${file}`)
    }
    console.log('')
    console.log('  Next steps:')
    console.log(`    cd ${name}`)
    console.log('    npm install')
    console.log('    npm run build')
    console.log('')
  } else {
    console.log('')
    console.log(`  ✘ Failed to create plugin "${name}"`)
    console.log('')
  }
}

export async function runPluginUpdate(kernel: Kernel, options?: { name?: string; all?: boolean }): Promise<void> {
  const logger = kernel.getLogger()
  const manager = kernel.getPluginManager()
  const workspace = kernel.getWorkspace()
  const updater = new PluginUpdater({ logger, workspaceRoot: workspace.root })

  const entries = manager.getAllEntries()

  if (entries.length === 0) {
    console.log('')
    console.log('  No plugins installed.')
    console.log('')
    console.log('  Install a plugin with:')
    console.log(`    ${CLI_NAME} plugin install <name>`)
    console.log('')
    return
  }

  // If specific plugin name provided, update just that one
  if (options?.name) {
    const entry = entries.find((e) => e.name === options.name)
    if (!entry) {
      console.log('')
      console.log(`  Plugin "${options.name}" is not installed.`)
      console.log('')
      return
    }

    console.log('')
    console.log(`  Checking for updates: ${entry.name}...`)
    console.log('')

    const update = await updater.checkPlugin(entry)

    if (!update.updateAvailable) {
      console.log(`  ${entry.name} is already up to date (v${entry.currentVersion})`)
      console.log('')
      return
    }

    console.log(`  Update available: ${entry.name} ${entry.currentVersion} → ${update.latestVersion}`)
    console.log('')

    // Perform the update
    console.log(`  Updating ${entry.name}...`)
    const result = await updater.updatePlugin(entry.name)

    if (result.success) {
      console.log('')
      console.log(`  ✔ ${entry.name} updated successfully`)
      console.log(`    ${result.previousVersion} → ${result.newVersion}`)
      console.log(`    Duration: ${result.duration.toFixed(0)}ms`)
      console.log('')
    } else {
      console.log('')
      console.log(`  ✘ Failed to update ${entry.name}`)
      if (result.error) {
        console.log(`    ${result.error}`)
      }
      console.log('')
    }
    return
  }

  // Check all plugins
  console.log('')
  console.log('  Checking for plugin updates...')
  console.log('')

  const updates = await updater.checkForUpdates(entries)

  if (updates.length === 0) {
    console.log('  All plugins are up to date.')
    console.log('')
    return
  }

  console.log('  Updates available:')
  console.log('')

  for (const update of updates) {
    console.log(`    ${update.name}: ${update.currentVersion} → ${update.latestVersion}`)
  }

  // If --all flag, update all
  if (options?.all) {
    console.log('')
    console.log('  Updating all plugins...')
    console.log('')

    const results = await updater.updateAll(entries)

    let successCount = 0
    let failCount = 0

    for (const result of results) {
      if (result.success) {
        console.log(`    ✔ ${result.name}: ${result.previousVersion} → ${result.newVersion}`)
        successCount++
      } else {
        console.log(`    ✘ ${result.name}: ${result.error ?? 'unknown error'}`)
        failCount++
      }
    }

    console.log('')
    console.log(`  Updated: ${successCount}, Failed: ${failCount}`)
    console.log('')
  } else {
    console.log('')
    console.log('  To update all plugins:')
    console.log(`    ${CLI_NAME} plugin update --all`)
    console.log('')
    console.log('  To update a specific plugin:')
    console.log(`    ${CLI_NAME} plugin update <name>`)
    console.log('')
    console.log('  Or install the latest version manually:')
    console.log(`    ${CLI_NAME} plugin install <name>`)
    console.log('')
  }
}

export async function runPluginConfig(kernel: Kernel, pluginName: string, key?: string, value?: string): Promise<void> {
  const logger = kernel.getLogger()
  const workspace = kernel.getWorkspace()

  // Plugin config manager would be initialized here
  // For now, show a placeholder
  console.log('')
  console.log(`  Plugin configuration for "${pluginName}"`)
  console.log('')

  if (key && value) {
    console.log(`  Setting ${key} = ${value}`)
    console.log('')
  } else if (key) {
    console.log(`  Getting ${key}`)
    console.log('')
  } else {
    console.log('  Usage:')
    console.log(`    ${CLI_NAME} plugin config <plugin>           — Show all config`)
    console.log(`    ${CLI_NAME} plugin config <plugin> <key>     — Get config value`)
    console.log(`    ${CLI_NAME} plugin config <plugin> <key> <value> — Set config value`)
    console.log('')
  }
}
