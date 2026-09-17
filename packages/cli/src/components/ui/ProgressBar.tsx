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
  const ratio = total > 0 ? Math.min(Math.max(current / total, 0), 1) : 0
  const percent = Math.round(ratio * 100)
  const filled = Math.round(ratio * width)
  const empty = Math.max(width - filled, 0)

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
