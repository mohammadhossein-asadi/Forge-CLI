import { ErrorCode, type ErrorSeverity } from '@forge/shared'

export class ForgeError extends Error {
  readonly code: ErrorCode
  readonly description?: string
  readonly severity: ErrorSeverity
  readonly category: string
  readonly recovery: string[]
  readonly docsUrl?: string
  readonly metadata?: Record<string, unknown>
  readonly cause?: Error

  constructor(options: {
    code: ErrorCode
    title: string
    message: string
    description?: string
    cause?: Error
    severity?: ErrorSeverity
    category?: string
    recovery?: string[]
    docsUrl?: string
    metadata?: Record<string, unknown>
  }) {
    super(options.message)
    this.name = 'ForgeError'
    this.code = options.code
    this.description = options.description
    this.severity = options.severity ?? 'error'
    this.category = options.category ?? 'general'
    this.recovery = options.recovery ?? []
    this.docsUrl = options.docsUrl
    this.metadata = options.metadata
    this.cause = options.cause
  }

  toFormattedString(): string {
    const lines: string[] = []
    lines.push(`Error [${this.code}]: ${this.message}`)
    if (this.description) {
      lines.push(`  ${this.description}`)
    }
    if (this.recovery.length > 0) {
      lines.push('  Suggestions:')
      for (const suggestion of this.recovery) {
        lines.push(`    - ${suggestion}`)
      }
    }
    if (this.docsUrl) {
      lines.push(`  Docs: ${this.docsUrl}`)
    }
    return lines.join('\n')
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      description: this.description,
      severity: this.severity,
      category: this.category,
      recovery: this.recovery,
      docsUrl: this.docsUrl,
      metadata: this.metadata,
    }
  }
}
