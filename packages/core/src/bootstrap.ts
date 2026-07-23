import { Kernel, type KernelOptions } from './kernel.js'

export interface BootstrapOptions extends KernelOptions {}

export async function bootstrap(options?: BootstrapOptions): Promise<Kernel> {
  const kernel = new Kernel(options)
  await kernel.bootstrap()
  return kernel
}
