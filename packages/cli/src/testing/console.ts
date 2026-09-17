import { vi } from 'vitest'
import { afterEach as registerAfterEach } from 'vitest'

export interface ConsoleCapture {
  /** Every intercepted line, in order. */
  lines: string[]
  /** All intercepted output joined into one string. */
  output: () => string
  /** Stop capturing and restore the original console methods. */
  restore: () => void
}

function format(args: unknown[]): string {
  return `${args.map((arg) => (typeof arg === 'string' ? arg : String(arg))).join(' ')}\n`
}

/**
 * Spies on console.log/warn/error/info so tests can assert command output.
 * Vitest itself intercepts console methods, so spying at this level is the
 * reliable seam — patching process.stdout.write misses console.log output.
 */
export function captureConsole(): ConsoleCapture {
  const lines: string[] = []
  const record = (args: unknown[]) => lines.push(format(args))

  const logSpy = vi.spyOn(console, 'log').mockImplementation((...args: unknown[]) => record(args))
  const warnSpy = vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => record(args))
  const errorSpy = vi
    .spyOn(console, 'error')
    .mockImplementation((...args: unknown[]) => record(args))
  const infoSpy = vi.spyOn(console, 'info').mockImplementation((...args: unknown[]) => record(args))

  return {
    lines,
    output: () => lines.join(''),
    restore: () => {
      logSpy.mockRestore()
      warnSpy.mockRestore()
      errorSpy.mockRestore()
      infoSpy.mockRestore()
    },
  }
}

/** Captures console output for the duration of `fn`, then restores the streams. */
export async function withCapturedConsole<T>(
  fn: () => Promise<T> | T,
): Promise<{ capture: ConsoleCapture; result: T }> {
  const capture = captureConsole()
  try {
    const result = await fn()
    return { capture, result }
  } finally {
    capture.restore()
  }
}

/**
 * Installs a console capture restored automatically after each test in the
 * suite where this is called (typically from `beforeEach`).
 */
export function useConsoleCapture(): ConsoleCapture {
  const capture = captureConsole()
  registerAfterEach(() => capture.restore())
  return capture
}
