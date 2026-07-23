import React from 'react'
import { Text } from './Text.js'
import { Box } from './Box.js'

export interface SearchInputProps {
  value: string
  placeholder?: string
  onChange: (value: string) => void
  color?: string
}

export function SearchInput({ value, placeholder = 'Search...', onChange, color = '#6C9EEB' }: SearchInputProps) {
  return (
    <Box flexDirection="row" gap={1}>
      <Text color={color}>⌕</Text>
      <Text>
        {value || <Text dimColor>{placeholder}</Text>}
      </Text>
      <Text color={color}>▌</Text>
    </Box>
  )
}
