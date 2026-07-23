import os from 'node:os'
import { execSync } from 'node:child_process'
import type { HealthCheckFn } from './checker.js'

export const nodeVersionCheck: HealthCheckFn = () => {
  const version = process.version
  const major = parseInt(version.slice(1), 10)

  if (major >= 18) {
    return { name: 'node-version', status: 'ok', message: `Node.js ${version}` }
  }
  if (major >= 16) {
    return { name: 'node-version', status: 'warning', message: `Node.js ${version} — recommended >= 18` }
  }
  return { name: 'node-version', status: 'error', message: `Node.js ${version} — minimum required is 18` }
}

export const envCheck: HealthCheckFn = () => {
  const nodeEnv = process.env.NODE_ENV
  return {
    name: 'environment',
    status: 'ok',
    message: `NODE_ENV=${nodeEnv ?? 'not set'}`,
    details: { nodeEnv },
  }
}

export const gitCheck: HealthCheckFn = () => {
  try {
    const version = execSync('git --version', { encoding: 'utf-8', timeout: 5000, stdio: 'pipe' }).trim()
    return { name: 'git', status: 'ok', message: version }
  } catch {
    return { name: 'git', status: 'warning', message: 'Git is not installed' }
  }
}

export const dockerCheck: HealthCheckFn = () => {
  try {
    const version = execSync('docker --version', { encoding: 'utf-8', timeout: 5000, stdio: 'pipe' }).trim()
    return { name: 'docker', status: 'ok', message: version }
  } catch {
    return { name: 'docker', status: 'warning', message: 'Docker is not installed' }
  }
}

export const diskSpaceCheck: HealthCheckFn = () => {
  const freeBytes = os.freemem()
  const totalBytes = os.totalmem()
  const freePercent = (freeBytes / totalBytes) * 100

  if (freePercent < 10) {
    return { name: 'disk-space', status: 'error', message: `Low disk space: ${freePercent.toFixed(1)}% free` }
  }
  if (freePercent < 25) {
    return { name: 'disk-space', status: 'warning', message: `Disk space: ${freePercent.toFixed(1)}% free` }
  }
  return {
    name: 'disk-space',
    status: 'ok',
    message: `Disk space: ${freePercent.toFixed(1)}% free (${formatBytes(freeBytes)})`,
  }
}

export const memoryCheck: HealthCheckFn = () => {
  const freeMB = Math.round(os.freemem() / (1024 * 1024))
  if (freeMB < 256) {
    return { name: 'memory', status: 'warning', message: `Low memory: ${freeMB}MB free` }
  }
  return { name: 'memory', status: 'ok', message: `Memory: ${freeMB}MB free` }
}

export const platformCheck: HealthCheckFn = () => {
  return {
    name: 'platform',
    status: 'ok',
    message: `${os.platform()} ${os.arch()} (Node ${process.version})`,
    details: {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
    },
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export const defaultChecks: HealthCheckFn[] = [
  nodeVersionCheck,
  envCheck,
  platformCheck,
  gitCheck,
  dockerCheck,
  diskSpaceCheck,
  memoryCheck,
]
