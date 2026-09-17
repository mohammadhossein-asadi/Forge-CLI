export interface AppContextValue {
  cliName: string
  cliVersion: string
  verbose: boolean
  quiet: boolean
  json: boolean
  noColor: boolean
}

export function useApp(context: Partial<AppContextValue> = {}): AppContextValue {
  return {
    cliName: 'forge',
    cliVersion: '0.1.0',
    verbose: false,
    quiet: false,
    json: false,
    noColor: false,
    ...context,
  }
}
