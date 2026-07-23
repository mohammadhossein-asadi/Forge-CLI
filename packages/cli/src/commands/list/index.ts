import { Kernel, Lister } from '@forge/core'
import { CLI_NAME } from '@forge/shared'
import type { ListItem, ListResult } from '@forge/core'

export interface ListCommandOptions {
  filter?: string
  sort?: 'name' | 'version' | 'status' | 'type'
  limit?: number
  json?: boolean
}

export async function runList(kernel: Kernel, type: string, options: ListCommandOptions = {}): Promise<void> {
  const logger = kernel.getLogger()
  const workspace = kernel.getWorkspace()

  const lister = new Lister({ logger, workspaceRoot: workspace.root })

  const result = await lister.list({
    type,
    filter: options.filter,
    sort: options.sort,
    limit: options.limit,
  })

  if (options.json) {
    console.log(JSON.stringify(result, null, 2))
    return
  }

  if (result.items.length === 0) {
    console.log('')
    console.log(`  No ${type} found.`)
    console.log('')
    printSuggestions(type)
    return
  }

  console.log('')
  console.log(`  ${capitalize(type)} (${result.total} found)`)
  console.log('')

  for (const item of result.items) {
    const status = item.status ? ` [${item.status}]` : ''
    const version = item.version ? ` v${item.version}` : ''
    const typeStr = item.type ? ` (${item.type})` : ''

    console.log(`    ${item.name}${version}${typeStr}${status}`)
    if (item.description) {
      console.log(`      ${item.description}`)
    }
  }

  console.log('')
}

export async function runListAvailable(kernel: Kernel): Promise<void> {
  console.log('')
  console.log('  Available list types:')
  console.log('')
  console.log('    projects    List projects in workspace')
  console.log('    plugins     List installed plugins')
  console.log('    templates   List available templates')
  console.log('    config      List configuration files')
  console.log('    tools       List detected tools')
  console.log('    files       List files in workspace')
  console.log('')
  console.log(`  Usage: ${CLI_NAME} list <type> [options]`)
  console.log('')
  console.log('  Options:')
  console.log('    --filter <text>    Filter items by name/description')
  console.log('    --sort <field>     Sort by name, version, status, or type')
  console.log('    --limit <n>        Limit number of results')
  console.log('    --json             Output as JSON')
  console.log('')
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function printSuggestions(type: string): void {
  switch (type) {
    case 'projects':
      console.log('  Create a new project:')
      console.log(`    ${CLI_NAME} create <name>`)
      break
    case 'plugins':
      console.log('  Install a plugin:')
      console.log(`    ${CLI_NAME} plugin install <name>`)
      break
    case 'templates':
      console.log('  Use a template:')
      console.log(`    ${CLI_NAME} create --template <name>`)
      break
    case 'config':
      console.log('  Initialize configuration:')
      console.log(`    ${CLI_NAME} init`)
      break
    case 'tools':
      console.log('  No tools detected. Make sure you have a project set up.')
      break
    case 'files':
      console.log('  No files found in the current directory.')
      break
  }
  console.log('')
}
