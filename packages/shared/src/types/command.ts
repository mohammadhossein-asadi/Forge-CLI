export interface CommandMetadata {
  id: string
  description: string
  aliases?: string[]
  examples?: string[]
  category?: string
  experimental?: boolean
  hidden?: boolean
  requiredPlugins?: string[]
  requiredRuntime?: string
  outputFormat?: 'text' | 'json' | 'both'
  permissions?: string[]
}

export interface FlagDefinition {
  type: 'string' | 'boolean' | 'number' | 'enum' | 'array'
  char?: string
  description?: string
  default?: unknown
  required?: boolean
  env?: string
  aliases?: string[]
  choices?: readonly (string | number)[]
}

export interface CommandFlags {
  [key: string]: FlagDefinition
}

export interface ArgDefinition {
  type: 'string' | 'number' | 'boolean'
  description?: string
  required?: boolean
  default?: unknown
  variadic?: boolean
}

export interface CommandArgs {
  [name: string]: ArgDefinition
}
