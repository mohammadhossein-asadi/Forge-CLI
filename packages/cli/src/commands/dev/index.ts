import { Kernel, DevDetector, DevRunner } from '@forge/core'
import { CLI_NAME } from '@forge/shared'

export interface DevCommandOptions {
  tool?: string
  port?: number
  args?: string[]
}

export async function runDev(kernel: Kernel, options: DevCommandOptions = {}): Promise<void> {
  const logger = kernel.getLogger()
  const workspace = kernel.getWorkspace()
  const bus = kernel.getBus()

  console.log('')
  console.log('  Detecting dev tools...')
  console.log('')

  // 1. Detect dev tools
  const detector = new DevDetector({ cwd: workspace.root })
  const tools = await detector.detect()

  if (tools.length === 0) {
    console.log('  No dev tools detected.')
    console.log('')
    console.log('  Make sure you have a dev server configured:')
    console.log('    - Add a "dev" script to package.json')
    console.log('    - Install vite, next, or another dev server')
    console.log('    - Create a dev configuration file')
    console.log('')
    return
  }

  // 2. Select tool
  let tool = tools.find((t) => t.name === options.tool)
  if (!tool) {
    tool = await detector.detectPrimary()
  }

  if (!tool) {
    console.log('  Multiple dev tools detected:')
    console.log('')
    for (const t of tools) {
      console.log(`    ${t.name} (${t.configFiles.join(', ')})`)
    }
    console.log('')
    console.log(`  Specify one with: ${CLI_NAME} dev --tool <name>`)
    console.log('')
    return
  }

  const port = options.port ?? tool.port ?? 3000

  console.log(`  Using: ${tool.name}`)
  console.log(`  Command: ${tool.command}`)
  console.log(`  Port: ${port}`)
  console.log('')
  console.log('  Starting dev server...')
  console.log('')

  // 3. Run dev server
  const runner = new DevRunner({ logger, bus })

  // Handle graceful shutdown
  const shutdown = () => {
    console.log('\n  Shutting down dev server...')
    runner.stop()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  const result = await runner.run(tool, {
    port,
    args: options.args,
    cwd: workspace.root,
  })

  if (result.success) {
    // Dev server is running - keep process alive
    console.log('')
    console.log(`  Dev server running at http://localhost:${port}`)
    console.log('  Press Ctrl+C to stop')
    console.log('')
  } else {
    console.log('')
    console.log(`  Failed to start dev server`)
    if (result.error) {
      console.log(`    ${result.error}`)
    }
    console.log('')
  }
}

export async function runDevDetect(kernel: Kernel): Promise<void> {
  const workspace = kernel.getWorkspace()

  console.log('')
  console.log('  Detecting dev tools...')
  console.log('')

  const detector = new DevDetector({ cwd: workspace.root })
  const tools = await detector.detect()

  if (tools.length === 0) {
    console.log('  No dev tools detected.')
    console.log('')
    return
  }

  console.log('  Detected dev tools:')
  console.log('')

  for (const tool of tools) {
    console.log(`    ${tool.name}`)
    console.log(`      Command: ${tool.command}`)
    console.log(`      Config: ${tool.configFiles.join(', ')}`)
    if (tool.port) {
      console.log(`      Default port: ${tool.port}`)
    }
  }

  const primary = await detector.detectPrimary()
  if (primary) {
    console.log('')
    console.log(`  Primary: ${primary.name}`)
  }

  console.log('')
}
