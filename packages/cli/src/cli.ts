#!/usr/bin/env node
import { CLI_VERSION } from '@forge/shared'
import { program } from './commander.js'

// Parse global flags before Commander
const args = process.argv.slice(2)
const showVersion = args.includes('--version') || args.includes('-V')

// Fast-path: version
if (showVersion) {
  console.log(CLI_VERSION)
  process.exit(0)
}

// Full CLI with Commander
program.parse()
