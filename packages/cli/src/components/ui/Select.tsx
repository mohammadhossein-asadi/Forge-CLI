import React, { useState } from 'react'
import { Box } from './Box.js'
import { Text } from './Text.js'
import { icons } from '../../rendering/icons.js'

export interface SelectOption {
  label: string
  value: string
  description?: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  selected: number
  onSelect: (index: number) => void
  color?: string
  focusColor?: string
}

export function Select({ options, selected, onSelect, color = '#F9FAFB', focusColor = '#6C9EEB' }: SelectProps) {
  const [hovered, setHovered] = useState(selected)

  return (
    <Box flexDirection="column" gap={0}>
      {options.map((option, i) => {
        const isSelected = i === selected
        const isHovered = i === hovered

        return (
          <Box key={option.value} flexDirection="row" gap={1}>
            <Text color={isSelected ? focusColor : undefined}>
              {isSelected ? '●' : '○'}
            </Text>
            <Text
              bold={isSelected}
              color={isSelected ? focusColor : isHovered ? color : undefined}
              dimColor={option.disabled}
            >
              {option.label}
            </Text>
            {option.description && (
              <Text dimColor> — {option.description}</Text>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
