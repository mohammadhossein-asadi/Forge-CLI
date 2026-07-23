import { describe, it, expect } from 'vitest'
import { MemoryFileSystem } from './memory.js'

describe('MemoryFileSystem', () => {
  it('should read and write files', async () => {
    const fs = new MemoryFileSystem()
    await fs.writeFile('/test.txt', 'hello')
    const content = await fs.readFile('/test.txt')
    expect(content).toBe('hello')
  })

  it('should throw when reading non-existent file', async () => {
    const fs = new MemoryFileSystem()
    await expect(fs.readFile('/missing.txt')).rejects.toThrow('File not found')
  })

  it('should check file existence', async () => {
    const fs = new MemoryFileSystem()
    expect(await fs.exists('/test.txt')).toBe(false)
    await fs.writeFile('/test.txt', 'content')
    expect(await fs.exists('/test.txt')).toBe(true)
  })

  it('should delete files', async () => {
    const fs = new MemoryFileSystem()
    await fs.writeFile('/test.txt', 'content')
    await fs.rm('/test.txt')
    expect(await fs.exists('/test.txt')).toBe(false)
  })

  it('should copy files', async () => {
    const fs = new MemoryFileSystem()
    await fs.writeFile('/src.txt', 'content')
    await fs.cp('/src.txt', '/dest.txt')
    expect(await fs.readFile('/dest.txt')).toBe('content')
  })

  it('should move files', async () => {
    const fs = new MemoryFileSystem()
    await fs.writeFile('/src.txt', 'content')
    await fs.mv('/src.txt', '/dest.txt')
    expect(await fs.exists('/src.txt')).toBe(false)
    expect(await fs.readFile('/dest.txt')).toBe('content')
  })

  it('should append to files', async () => {
    const fs = new MemoryFileSystem()
    await fs.writeFile('/test.txt', 'hello')
    await fs.appendFile('/test.txt', ' world')
    expect(await fs.readFile('/test.txt')).toBe('hello world')
  })

  it('should read and write JSON', async () => {
    const fs = new MemoryFileSystem()
    await fs.writeFileJson('/config.json', { key: 'value' })
    const data = await fs.readFileJson<{ key: string }>('/config.json')
    expect(data.key).toBe('value')
  })

  it('should get file info', async () => {
    const fs = new MemoryFileSystem()
    await fs.writeFile('/test.txt', 'hello')
    const stat = await fs.stat('/test.txt')
    expect(stat.isFile).toBe(true)
    expect(stat.size).toBe(5)
  })

  it('should glob files', async () => {
    const fs = new MemoryFileSystem()
    await fs.writeFile('/src/a.ts', 'content')
    await fs.writeFile('/src/b.ts', 'content')
    await fs.writeFile('/src/c.js', 'content')

    const files = await fs.glob('*.ts', '/src')
    expect(files).toHaveLength(2)
  })

  it('should clear all files', async () => {
    const fs = new MemoryFileSystem()
    await fs.writeFile('/a.txt', 'a')
    await fs.writeFile('/b.txt', 'b')
    fs.clear()
    expect(fs.getAllFiles().size).toBe(0)
  })
})
