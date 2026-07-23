import type { FileSystemInterface } from './abstract.js'

export class MemoryFileSystem implements FileSystemInterface {
  private files = new Map<string, string>()

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path)
    if (content === undefined) {
      throw new Error(`File not found: ${path}`)
    }
    return content
  }

  async writeFile(path: string, content: string): Promise<void> {
    this.files.set(path, content)
  }

  async appendFile(path: string, content: string): Promise<void> {
    const existing = this.files.get(path) ?? ''
    this.files.set(path, existing + content)
  }

  async exists(path: string): Promise<boolean> {
    return this.files.has(path)
  }

  async stat(path: string) {
    if (!this.files.has(path)) {
      throw new Error(`File not found: ${path}`)
    }
    return {
      isFile: true,
      isDirectory: false,
      size: this.files.get(path)!.length,
      modifiedAt: new Date(),
    }
  }

  async mkdir(_path: string, _options?: { recursive?: boolean }): Promise<void> {
    // No-op for memory filesystem
  }

  async rm(path: string, _options?: { recursive?: boolean; force?: boolean }): Promise<void> {
    this.files.delete(path)
  }

  async cp(src: string, dest: string): Promise<void> {
    const content = this.files.get(src)
    if (content === undefined) {
      throw new Error(`File not found: ${src}`)
    }
    this.files.set(dest, content)
  }

  async mv(src: string, dest: string): Promise<void> {
    await this.cp(src, dest)
    this.files.delete(src)
  }

  async readdir(_path: string): Promise<string[]> {
    return [...this.files.keys()]
  }

  async glob(pattern: string): Promise<string[]> {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
    )
    return [...this.files.keys()].filter((f) => regex.test(f))
  }

  async readFileJson<T = unknown>(path: string): Promise<T> {
    const content = await this.readFile(path)
    return JSON.parse(content) as T
  }

  async writeFileJson(path: string, data: unknown, indent = 2): Promise<void> {
    await this.writeFile(path, JSON.stringify(data, null, indent) + '\n')
  }

  // Test helpers
  getAllFiles(): Map<string, string> {
    return new Map(this.files)
  }

  clear(): void {
    this.files.clear()
  }
}
