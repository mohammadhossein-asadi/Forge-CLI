import { Kernel } from '@forge/core'
import type { ForgeConfig } from '@forge/shared'

export interface FakeKernelOptions {
  config?: Partial<ForgeConfig>
  workspace?: {
    root?: string
    type?: string
    workspaceTool?: string
    projects?: { name: string; path: string }[]
  }
}

export type KernelOverrides = Partial<
  Record<
    'getConfig' | 'getWorkspace' | 'getLogger' | 'getBus' | 'getPluginManager' | 'getHealthChecker',
    unknown
  >
>

/**
 * Builds a real `Kernel` (so the `instanceof` contracts hold) and overrides
 * only the accessors the command runners use, keeping the tests hermetic:
 * no real bootstrap, filesystem detection, or plugin loading happens.
 */
export function createFakeKernel(options: FakeKernelOptions = {}): Kernel {
  const kernel = new Kernel()
  const workspace = {
    root: options.workspace?.root ?? process.cwd(),
    type: options.workspace?.type ?? 'single',
    workspaceTool: options.workspace?.workspaceTool,
    projects: options.workspace?.projects ?? [],
    hasGit: false,
    hasPackageJson: true,
  }
  const config = {
    version: '1.0.0',
    ...(options.config ?? {}),
  }

  const overrides = {
    getConfig: () => config as ReturnType<Kernel['getConfig']>,
    getWorkspace: () => workspace as ReturnType<Kernel['getWorkspace']>,
    getLogger: () => ({
      info: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      child: () => ({
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {},
        setLevel: () => {},
      }),
      setLevel: () => {},
    }),
    getBus: () => ({
      on: () => ({ unsubscribe: () => {} }),
      once: () => ({ unsubscribe: () => {} }),
      emit: async () => [],
      removeAllListeners: () => {},
      listenerCount: () => 0,
    }),
    getPluginManager: () => ({
      getAllEntries: () => [],
      loadByName: async () => null,
      unload: async () => {},
    }),
    getHealthChecker: () => ({
      run: async () => ({ status: 'healthy', checks: [], duration: 0 }),
      register: () => {},
    }),
  }

  for (const [method, impl] of Object.entries(overrides)) {
    Object.defineProperty(kernel, method, { value: impl, configurable: true, writable: true })
  }

  return kernel
}
