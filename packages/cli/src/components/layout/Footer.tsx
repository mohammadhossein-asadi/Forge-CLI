import React from 'react'
import { Box } from '../ui/Box.js'
import { Text } from '../ui/Text.js'

export interface FooterProps {
  hint?: string
}

export function Footer({ hint }: FooterProps) {
  return (
    <Box flexDirection="column" gap={0}>
      <Text dimColor>
        {hint ?? 'Press ↑↓ to navigate, Enter to select, Esc to go back'}
      </Text>
    </Box>
  )
}
