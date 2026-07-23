import type { PluginValidationResult } from './types.js'

export class PluginValidator {
  validate(plugin: unknown): PluginValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (typeof plugin !== 'object' || plugin === null) {
      return { valid: false, errors: ['Plugin must be an object'], warnings }
    }

    const p = plugin as Record<string, unknown>

    if (typeof p.name !== 'string' || p.name.length === 0) {
      errors.push('Plugin must have a non-empty "name" string')
    }

    if (typeof p.version !== 'string' || !this.isValidSemver(p.version)) {
      errors.push(`Plugin must have a valid semver "version", got: ${String(p.version)}`)
    }

    if (p.description !== undefined && typeof p.description !== 'string') {
      warnings.push('"description" should be a string')
    }

    if (p.commands !== undefined && !Array.isArray(p.commands)) {
      warnings.push('"commands" should be an array')
    }

    if (p.hooks !== undefined && !Array.isArray(p.hooks)) {
      warnings.push('"hooks" should be an array')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  private isValidSemver(version: string): boolean {
    return /^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)
  }
}
