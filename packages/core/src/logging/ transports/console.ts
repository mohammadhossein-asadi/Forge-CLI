export interface ConsoleTransportOptions {
  colors?: boolean
  json?: boolean
}

export class ConsoleTransport {
  private colors: boolean
  private json: boolean

  constructor(options?: ConsoleTransportOptions) {
    this.colors = options?.colors ?? true
    this.json = options?.json ?? false
  }

  write(level: string, message: string, data?: Record<string, unknown>): void {
    if (this.json) {
      const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data,
      }
      const output = JSON.stringify(entry)
      if (level === 'error') {
        process.stderr.write(output + '\n')
      } else {
        process.stdout.write(output + '\n')
      }
    } else {
      const timestamp = new Date().toISOString()
      const levelTag = this.colors ? this.colorize(level) : `[${level.toUpperCase()}]`
      let output = `${timestamp} ${levelTag} ${message}`
      if (data && Object.keys(data).length > 0) {
        output += ` ${JSON.stringify(data)}`
      }
      if (level === 'error') {
        process.stderr.write(output + '\n')
      } else {
        process.stdout.write(output + '\n')
      }
    }
  }

  private colorize(level: string): string {
    const colors: Record<string, string> = {
      error: '\x1b[31m',
      warning: '\x1b[33m',
      info: '\x1b[36m',
      verbose: '\x1b[35m',
      debug: '\x1b[90m',
      trace: '\x1b[90m',
    }
    const reset = '\x1b[0m'
    const color = colors[level] ?? ''
    return `${color}[${level.toUpperCase()}]${reset}`
  }
}
