import { Kernel } from '@forge/core'
import fs from 'node:fs/promises'
import path from 'node:path'

export async function runConfigGet(kernel: Kernel, key: string): Promise<void> {
  const config = kernel.getConfig()
  const parts = key.split('.')
  let value: unknown = config

  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[part]
    } else {
      value = undefined
      break
    }
  }

  if (value === undefined) {
    console.log(`Config key "${key}" is not set`)
    return
  }

  console.log(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value))
}

export async function runConfigSet(_kernel: Kernel, key: string, value: string): Promise<void> {
  const configDir = path.join(process.cwd(), '.forge')
  const configFile = path.join(configDir, 'config.json')

  try {
    await fs.mkdir(configDir, { recursive: true })
  } catch {}

  let config: Record<string, unknown> = {}
  try {
    const content = await fs.readFile(configFile, 'utf-8')
    config = JSON.parse(content) as Record<string, unknown>
  } catch {}

  // Set nested key
  const parts = key.split('.')
  let current = config
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {}
    }
    current = current[part] as Record<string, unknown>
  }

  // Try to parse as JSON, fallback to string
  try {
    current[parts[parts.length - 1]!] = JSON.parse(value)
  } catch {
    current[parts[parts.length - 1]!] = value
  }

  await fs.writeFile(configFile, JSON.stringify(config, null, 2) + '\n')
  console.log(`Set ${key} = ${value}`)
}

export async function runConfigList(kernel: Kernel): Promise<void> {
  const config = kernel.getConfig()
  const resolvedFrom = config._resolvedFrom

  console.log('')
  console.log('  Configuration')
  console.log('')

  const printSection = (title: string, obj: Record<string, unknown>, indent = 2) => {
    const pad = ' '.repeat(indent)
    console.log(`${pad}${title}:`)
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('_')) continue
      if (typeof value === 'object' && value !== null) {
        printSection(key, value as Record<string, unknown>, indent + 2)
      } else {
        console.log(`${pad}  ${key}: ${JSON.stringify(value)}`)
      }
    }
  }

  printSection('config', config as unknown as Record<string, unknown>)
  console.log('')
  console.log(`  Resolved from: ${resolvedFrom.join(' → ')}`)
  console.log('')
}
