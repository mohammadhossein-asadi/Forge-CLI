import React from 'react'
import { Box } from '../ui/Box.js'
import { Text } from '../ui/Text.js'
import { Badge } from '../ui/Badge.js'
import { Divider } from '../ui/Divider.js'
import { icons } from '../../rendering/icons.js'

export interface DashboardProps {
  workspace?: {
    root: string
    type: string
    projects?: { name: string; path: string }[]
  }
  environment?: {
    platform: string
    nodeVersion: string
    tools: { name: string; available: boolean; version?: string }[]
  }
  plugins?: { name: string; version: string }[]
}

export function Dashboard({ workspace, environment, plugins }: DashboardProps) {
  return (
    <Box flexDirection="column" gap={2}>
      <Box flexDirection="column" gap={0}>
        <Text bold color="#F9FAFB">
          Dashboard
        </Text>
        <Text dimColor>Your development workspace overview</Text>
      </Box>

      <Divider width={50} />

      <Box flexDirection="column" gap={1}>
        <Text bold color="#6C9EEB">
          {icons.folder} Workspace
        </Text>
        {workspace ? (
          <Box flexDirection="column" gap={0} paddingLeft={2}>
            <Text>Root: <Text color="#A78BFA">{workspace.root}</Text></Text>
            <Text>Type: <Badge label={workspace.type} /></Text>
            {workspace.projects && workspace.projects.length > 0 && (
              <>
                <Text>Projects:</Text>
                {workspace.projects.map((p, i) => (
                  <Text key={i} paddingLeft={4}>
                    {icons.bullet} {p.name}
                  </Text>
                ))}
              </>
            )}
          </Box>
        ) : (
          <Text dimColor paddingLeft={2}>No workspace detected</Text>
        )}
      </Box>

      <Box flexDirection="column" gap={1}>
        <Text bold color="#6C9EEB">
          {icons.terminal} Environment
        </Text>
        {environment ? (
          <Box flexDirection="column" gap={0} paddingLeft={2}>
            <Text>Platform: <Text color="#4ADE80">{environment.platform}</Text></Text>
            <Text>Node: <Text color="#4ADE80">{environment.nodeVersion}</Text></Text>
            <Text>Tools:</Text>
            {environment.tools.map((tool, i) => (
              <Text key={i} paddingLeft={4}>
                {tool.available ? '✔' : '✘'} {tool.name}
                {tool.version && <Text dimColor> ({tool.version})</Text>}
              </Text>
            ))}
          </Box>
        ) : (
          <Text dimColor paddingLeft={2}>Detecting environment...</Text>
        )}
      </Box>

      <Box flexDirection="column" gap={1}>
        <Text bold color="#6C9EEB">
          {icons.puzzle} Plugins
        </Text>
        {plugins && plugins.length > 0 ? (
          <Box flexDirection="column" gap={0} paddingLeft={2}>
            {plugins.map((p, i) => (
              <Text key={i}>
                {icons.bullet} {p.name} <Text dimColor>v{p.version}</Text>
              </Text>
            ))}
          </Box>
        ) : (
          <Text dimColor paddingLeft={2}>No plugins installed</Text>
        )}
      </Box>
    </Box>
  )
}
