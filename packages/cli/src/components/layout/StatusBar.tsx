import React from 'react'
import { Box } from '../ui/Box.js'
import { Text } from '../ui/Text.js'

export interface StatusBarProps {
  items?: { label: string; value: string; color?: string }[]
}

export function StatusBar({ items = [] }: StatusBarProps) {
  return (
    <Box flexDirection="row" gap={2}>
      {items.map((item, i) => (
        <Text key={i} dimColor>
          {item.label}:{' '}
          <Text color={item.color ?? '#6C9EEB'}>{item.value}</Text>
        </Text>
      ))}
    </Box>
  )
}
