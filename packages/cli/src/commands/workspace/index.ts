import type { Kernel } from '@forge/core'
import { CLI_NAME } from '@forge/shared'

export interface WorkspaceInfo {
  root: string
  type: string
  projects: { name: string; path: string }[]
}

export async function runWorkspace(kernel: Kernel): Promise<void> {
  const workspace = kernel.getWorkspace()

  console.log('')
  console.log('  Workspace')
  console.log('')
  console.log(`    Root: ${workspace.root}`)
  console.log(`    Type: ${workspace.type}`)

  if (workspace.projects && workspace.projects.length > 0) {
    console.log('')
    console.log(`    Projects (${workspace.projects.length}):`)
    for (const project of workspace.projects) {
      console.log(`      ${project.name}`)
      console.log(`        ${project.path}`)
    }
  } else {
    console.log('')
    console.log('    No projects detected in this workspace.')
    console.log(`    Create one with: ${CLI_NAME} create <project-name>`)
  }

  console.log('')
}
