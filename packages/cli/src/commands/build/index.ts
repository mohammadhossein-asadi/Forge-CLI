import { Kernel, BuildDetector, BuildRunner } from '@forge/core'
import { CLI_NAME } from '@forge/shared'

export interface BuildCommandOptions {
  tool?: string
  mode?: string
  args?: string[]
}

export async function runBuild(kernel: Kernel, options: BuildCommandOptions = {}): Promise<void> {
  const logger = kernel.getLogger()
  const workspace = kernel.getWorkspace()
  const bus = kernel.getBus()

  console.log('')
  console.log('  Detecting build tools...')
  console.log('')

  // 1. Detect build tools
  const detector = new BuildDetector({ cwd: workspace.root })
  const tools = await detector.detect()

  if (tools.length === 0) {
    console.log('  No build tools detected.')
    console.log('')
    console.log('  Make sure you have a build tool configured:')
    console.log('    - Add a "build" script to package.json')
    console.log('    - Install vite, tsup, tsc, or another build tool')
    console.log('    - Create a build configuration file')
    console.log('')
    return
  }

  // 2. Select tool
  let tool = tools.find((t) => t.name === options.tool)
  if (!tool) {
    tool = await detector.detectPrimary()
  }

  if (!tool) {
    console.log('  Multiple build tools detected:')
    console.log('')
    for (const t of tools) {
      console.log(`    ${t.name} (${t.configFiles.join(', ')})`)
    }
    console.log('')
    console.log(`  Specify one with: ${CLI_NAME} build --tool <name>`)
    console.log('')
    return
  }

  console.log(`  Using: ${tool.name}`)
  console.log(`  Command: ${tool.command}`)
  if (options.mode) {
    console.log(`  Mode: ${options.mode}`)
  }
  console.log('')

  // 3. Run build
  const runner = new BuildRunner({ logger, bus })
  const result = await runner.run(tool, {
    mode: options.mode,
    args: options.args,
    cwd: workspace.root,
  })

  if (result.success) {
    console.log('')
    console.log(`  Build completed successfully`)
    console.log(`    Tool: ${result.tool}`)
    console.log(`    Duration: ${result.duration.toFixed(0)}ms`)
    if (result.output) {
      console.log('')
      console.log('  Output:')
      const lines = result.output.split('\n').slice(0, 20)
      for (const line of lines) {
        console.log(`    ${line}`)
      }
      if (result.output.split('\n').length > 20) {
        console.log('    ... (truncated)')
      }
    }
    console.log('')
  } else {
    console.log('')
    console.log(`  Build failed`)
    console.log(`    Tool: ${result.tool}`)
    console.log(`    Duration: ${result.duration.toFixed(0)}ms`)
    if (result.error) {
      console.log(`    Error: ${result.error}`)
    }
    console.log('')
  }
}

export async function runBuildDetect(kernel: Kernel): Promise<void> {
  const workspace = kernel.getWorkspace()

  console.log('')
  console.log('  Detecting build tools...')
  console.log('')

  const detector = new BuildDetector({ cwd: workspace.root })
  const tools = await detector.detect()

  if (tools.length === 0) {
    console.log('  No build tools detected.')
    console.log('')
    return
  }

  console.log('  Detected build tools:')
  console.log('')

  for (const tool of tools) {
    console.log(`    ${tool.name}`)
    console.log(`      Command: ${tool.command}`)
    console.log(`      Config: ${tool.configFiles.join(', ')}`)
  }

  const primary = await detector.detectPrimary()
  if (primary) {
    console.log('')
    console.log(`  Primary: ${primary.name}`)
  }

  console.log('')
}
