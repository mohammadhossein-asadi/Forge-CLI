import React from 'react'
import { Text } from './Text.js'

export interface BadgeProps {
  label: string
  color?: string
  backgroundColor?: string
  bold?: boolean
}

export function Badge({ label, color = '#FFFFFF', backgroundColor = '#6C9EEB', bold = true }: BadgeProps) {
  return (
    <Text bold={bold} color={backgroundColor}>
      {' '}
      <Text bold={bold} color={color} backgroundColor={backgroundColor}>
        {` ${label} `}
      </Text>
    </Text>
  )
}
