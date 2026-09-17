import { useEffect, useState } from 'react'
import { icons } from '../../rendering/icons.js'
import { Text } from './Text.js'

const FRAMES = icons.spinnerFrames

export interface SpinnerProps {
  label?: string
  color?: string
}

export function Spinner({ label, color = '#6C9EEB' }: SpinnerProps) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % FRAMES.length)
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return (
    <Text color={color}>
      {FRAMES[frame]}
      {label ? ` ${label}` : ''}
    </Text>
  )
}
