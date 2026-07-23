export interface FileSystemInterface {
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  appendFile(path: string, content: string): Promise<void>
  exists(path: string): Promise<boolean>
  stat(path: string): Promise<{ isFile: boolean; isDirectory: boolean; size: number; modifiedAt: Date }>
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>
  rm(path: string, options?: { recursive?: boolean; force?: boolean }): Promise<void>
  cp(src: string, dest: string): Promise<void>
  mv(src: string, dest: string): Promise<void>
  readdir(path: string): Promise<string[]>
  glob(pattern: string, cwd?: string): Promise<string[]>
  readFileJson<T = unknown>(path: string): Promise<T>
  writeFileJson(path: string, data: unknown, indent?: number): Promise<void>
}
