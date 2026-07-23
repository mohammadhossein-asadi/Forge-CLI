import { ENV_PREFIX } from '../constants/index.js'

export function getEnvVar(name: string): string | undefined {
  const key = `${ENV_PREFIX}_${name.toUpperCase()}`
  return process.env[key]
}

export function getEnvVarWithDefault(name: string, defaultValue: string): string {
  return getEnvVar(name) ?? defaultValue
}

export function setEnvVar(name: string, value: string): void {
  const key = `${ENV_PREFIX}_${name.toUpperCase()}`
  process.env[key] = value
}

export function requireEnvVar(name: string): string {
  const value = getEnvVar(name)
  if (value === undefined) {
    throw new Error(`Required environment variable ${ENV_PREFIX}_${name.toUpperCase()} is not set`)
  }
  return value
}

export function isVerbose(): boolean {
  return getEnvVar('VERBOSE') === 'true' || process.argv.includes('--verbose')
}

export function isDebug(): boolean {
  return getEnvVar('DEBUG') === 'true' || process.argv.includes('--debug')
}

export function isCI(): boolean {
  return (
    process.env.CI === 'true' ||
    process.env.CONTINUOUS_INTEGRATION === 'true' ||
    process.env.BUILD_NUMBER === 'true'
  )
}

export function getNodeEnv(): string {
  return process.env.NODE_ENV ?? 'development'
}
