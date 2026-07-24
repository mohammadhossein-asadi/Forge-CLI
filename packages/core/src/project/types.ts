export interface ProjectTemplate {
  id: string
  name: string
  description: string
  framework: string
  language: string
  packageManager?: string
  category: 'frontend' | 'backend' | 'fullstack' | 'library' | 'cli' | 'mobile'
  tags: string[]
  files: ProjectFile[]
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
}

export interface ProjectFile {
  path: string
  content: string | (() => string)
  condition?: (options: CreateOptions) => boolean
}

export interface CreateOptions {
  name: string
  template?: string
  framework?: string
  language?: string
  packageManager?: string
  outputDir: string
  git?: boolean
  install?: boolean
}

export interface CreateResult {
  success: boolean
  path: string
  files: string[]
  template: string
  duration: number
  error?: string
}
