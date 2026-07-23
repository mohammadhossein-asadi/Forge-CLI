import React from 'react'
import { Text } from './Text.js'

export interface DividerProps {
  width?: number
  color?: string
  style?: 'single' | 'double' | 'dashed' | 'dotted'
}

const CHARS = {
  single: '─',
  double: '═',
  dashed: '╌',
  dotted: '┈',
}

export function Divider({ width = 40, color = '#374151', style = 'single' }: DividerProps) {
  const char = CHARS[style]
  return <Text color={color}>{char.repeat(width)}</Text>
}
