import React from 'react'
import { Box } from '../ui/Box.js'
import { Text } from '../ui/Text.js'
import { Divider } from '../ui/Divider.js'

export interface EmptyStateProps {
  title: string
  message?: string
  actions?: { label: string; command?: string }[]
}

export function EmptyState({ title, message, actions }: EmptyStateProps) {
  return (
    <Box flexDirection="column" gap={1}>
      <Text bold color="#F9FAFB">
        {title}
      </Text>
      {message && (
        <Text dimColor>{message}</Text>
      )}
      {actions && actions.length > 0 && (
        <>
          <Divider width={40} />
          <Text dimColor>Suggested actions:</Text>
          {actions.map((action, i) => (
            <Box key={i} flexDirection="row" gap={1} paddingLeft={2}>
              <Text color="#6C9EEB">→</Text>
              <Text>{action.label}</Text>
              {action.command && (
                <Text dimColor> ({action.command})</Text>
              )}
            </Box>
          ))}
        </>
      )}
    </Box>
  )
}
