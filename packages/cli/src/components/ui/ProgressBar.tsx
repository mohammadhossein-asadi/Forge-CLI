import React from 'react'
import { Text } from './Text.js'

export interface ProgressBarProps {
  current: number
  total: number
  width?: number
  showPercent?: boolean
  color?: string
  trackColor?: string
}

export function ProgressBar({
  current,
  total,
  width = 30,
  showPercent = true,
  color = '#4ADE80',
  trackColor = '#374151',
}: ProgressBarProps) {
  const percent = Math.min(Math.round((current / total) * 100), 100)
  const filled = Math.round((current / total) * width)
  const empty = width - filled

  const filledBar = '█'.repeat(filled)
  const emptyBar = '░'.repeat(empty)

  return (
    <Text>
      <Text color={color}>{filledBar}</Text>
      <Text color={trackColor}>{emptyBar}</Text>
      {showPercent && <Text> {percent}%</Text>}
    </Text>
  )
}
