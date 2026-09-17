export interface UseCommandOptions {
  id: string
  running?: boolean
}

export interface UseCommandResult {
  id: string
  running: boolean
}

export function useCommand({ id, running = false }: UseCommandOptions): UseCommandResult {
  return { id, running }
}
