export type LogLevel = 'silent' | 'error' | 'warning' | 'info' | 'verbose' | 'debug' | 'trace'

const LOG_LEVEL_NUMBERS: Record<LogLevel, number> = {
  silent: -1,
  error: 0,
  warning: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  trace: 5,
}

export interface LoggerOptions {
  level?: LogLevel
  prefix?: string
  colors?: boolean
  json?: boolean
}

export class Logger {
  private level: LogLevel
  private prefix: string
  private colors: boolean
  private json: boolean

  constructor(options?: LoggerOptions) {
    this.level = options?.level ?? 'info'
    this.prefix = options?.prefix ?? ''
    this.colors = options?.colors ?? true
    this.json = options?.json ?? false
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data)
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warning', message, data)
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data)
  }

  verbose(message: string, data?: Record<string, unknown>): void {
    this.log('verbose', message, data)
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data)
  }

  trace(message: string, data?: Record<string, unknown>): void {
    this.log('trace', message, data)
  }

  child(prefix: string): Logger {
    return new Logger({
      level: this.level,
      prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
      colors: this.colors,
      json: this.json,
    })
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }

  getLevel(): LogLevel {
    return this.level
  }

  setJsonMode(json: boolean): void {
    this.json = json
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (LOG_LEVEL_NUMBERS[level] > LOG_LEVEL_NUMBERS[this.level]) {
      return
    }

    const output = this.json
      ? this.formatJson(level, message, data)
      : this.formatPretty(level, message, data)

    if (level === 'error') {
      process.stderr.write(output + '\n')
    } else {
      process.stdout.write(output + '\n')
    }
  }

  private formatJson(level: LogLevel, message: string, data?: Record<string, unknown>): string {
    const entry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      message,
    }
    if (this.prefix) entry.prefix = this.prefix
    if (data) entry.data = data
    return JSON.stringify(entry)
  }

  private formatPretty(level: LogLevel, message: string, data?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString()
    const prefix = this.prefix ? `[${this.prefix}] ` : ''
    const levelTag = this.formatLevel(level)

    let output = `${timestamp} ${levelTag} ${prefix}${message}`
    if (data && Object.keys(data).length > 0) {
      output += ` ${JSON.stringify(data)}`
    }

    return output
  }

  private formatLevel(level: LogLevel): string {
    if (!this.colors) {
      return `[${level.toUpperCase()}]`
    }

    const colors: Record<LogLevel, string> = {
      silent: '',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      info: '\x1b[36m',
      verbose: '\x1b[35m',
      debug: '\x1b[90m',
      trace: '\x1b[90m',
    }
    const reset = '\x1b[0m'
    const color = colors[level]
    return `${color}[${level.toUpperCase()}]${reset}`
  }
}
