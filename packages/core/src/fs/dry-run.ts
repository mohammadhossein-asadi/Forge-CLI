import type { FileSystemInterface } from './abstract.js'

export interface DryRunEntry {
  operation: 'write' | 'delete' | 'mkdir' | 'cp' | 'mv'
  path: string
  content?: string
  dest?: string
}

export class DryRunFileSystem implements FileSystemInterface {
  private operations: DryRunEntry[] = []
  private realFs: FileSystemInterface

  constructor(realFs: FileSystemInterface) {
    this.realFs = realFs
  }

  getOperations(): DryRunEntry[] {
    return [...this.operations]
  }

  async readFile(path: string): Promise<string> {
    return this.realFs.readFile(path)
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.operations.push({ operation: 'write', path, content })
  }

  async appendFile(path: string, content: string): Promise<void> {
    this.operations.push({ operation: 'write', path, content })
  }

  async exists(path: string): Promise<boolean> {
    return this.realFs.exists(path)
  }

  async stat(path: string) {
    return this.realFs.stat(path)
  }

  async mkdir(path: string, _options?: { recursive?: boolean }): Promise<void> {
    this.operations.push({ operation: 'mkdir', path })
  }

  async rm(path: string, _options?: { recursive?: boolean; force?: boolean }): Promise<void> {
    this.operations.push({ operation: 'delete', path })
  }

  async cp(src: string, dest: string): Promise<void> {
    this.operations.push({ operation: 'cp', path: src, dest })
  }

  async mv(src: string, dest: string): Promise<void> {
    this.operations.push({ operation: 'mv', path: src, dest })
  }

  async readdir(path: string): Promise<string[]> {
    return this.realFs.readdir(path)
  }

  async glob(pattern: string, cwd?: string): Promise<string[]> {
    return this.realFs.glob(pattern, cwd)
  }

  async readFileJson<T = unknown>(path: string): Promise<T> {
    return this.realFs.readFileJson<T>(path)
  }

  async writeFileJson(path: string, data: unknown, indent = 2): Promise<void> {
    await this.writeFile(path, JSON.stringify(data, null, indent) + '\n')
  }
}
