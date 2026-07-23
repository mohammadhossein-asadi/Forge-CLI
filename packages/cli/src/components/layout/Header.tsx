import React from 'react'
import { Box } from '../ui/Box.js'
import { Text } from '../ui/Text.js'
import { CLI_NAME, CLI_VERSION } from '@forge/shared'

export interface HeaderProps {
  subtitle?: string
}

export function Header({ subtitle }: HeaderProps) {
  return (
    <Box flexDirection="column" gap={0}>
      <Box flexDirection="row" gap={1}>
        <Text bold color="#6C9EEB">
          {CLI_NAME}
        </Text>
        <Text dimColor>
          v{CLI_VERSION}
        </Text>
      </Box>
      {subtitle && (
        <Text dimColor>{subtitle}</Text>
      )}
    </Box>
  )
}
