import fs from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import type { FileSystemInterface } from './abstract.js'

export class NodeFileSystem implements FileSystemInterface {
  async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8')
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, content, 'utf-8')
  }

  async appendFile(filePath: string, content: string): Promise<void> {
    await fs.appendFile(filePath, content, 'utf-8')
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  async stat(filePath: string) {
    const s = await fs.stat(filePath)
    return {
      isFile: s.isFile(),
      isDirectory: s.isDirectory(),
      size: s.size,
      modifiedAt: s.mtime,
    }
  }

  async mkdir(dirPath: string, options?: { recursive?: boolean }): Promise<void> {
    await fs.mkdir(dirPath, { recursive: options?.recursive ?? true })
  }

  async rm(targetPath: string, options?: { recursive?: boolean; force?: boolean }): Promise<void> {
    await fs.rm(targetPath, {
      recursive: options?.recursive ?? true,
      force: options?.force ?? true,
    })
  }

  async cp(src: string, dest: string): Promise<void> {
    await fs.cp(src, dest, { recursive: true })
  }

  async mv(src: string, dest: string): Promise<void> {
    await fs.rename(src, dest)
  }

  async readdir(dirPath: string): Promise<string[]> {
    return fs.readdir(dirPath)
  }

  async glob(pattern: string, cwd?: string): Promise<string[]> {
    return fg(pattern, { cwd: cwd ?? process.cwd(), dot: true })
  }

  async readFileJson<T = unknown>(filePath: string): Promise<T> {
    const content = await this.readFile(filePath)
    return JSON.parse(content) as T
  }

  async writeFileJson(filePath: string, data: unknown, indent = 2): Promise<void> {
    await this.writeFile(filePath, JSON.stringify(data, null, indent) + '\n')
  }
}
