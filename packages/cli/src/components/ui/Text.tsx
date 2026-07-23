import React from 'react'
import { Text as InkText } from 'ink'

export interface TextProps {
  children?: React.ReactNode
  color?: string
  backgroundColor?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  dimColor?: boolean
  invisible?: boolean
}

export function Text(props: TextProps) {
  return <InkText {...props} />
}
