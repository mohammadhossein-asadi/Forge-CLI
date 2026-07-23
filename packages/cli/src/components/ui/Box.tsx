import React from 'react'
import { Box as InkBox } from 'ink'

export interface BoxProps {
  children?: React.ReactNode
  flexDirection?: 'row' | 'column'
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch'
  padding?: number
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  margin?: number
  marginLeft?: number
  marginRight?: number
  marginTop?: number
  marginBottom?: number
  width?: number | string
  height?: number | string
  borderStyle?: 'single' | 'double' | 'round' | 'bold' | 'classic'
  borderColor?: string
  gap?: number
  flexWrap?: 'wrap' | 'nowrap'
  flexGrow?: number
  flexShrink?: number
  flexBasis?: number | string
}

export function Box(props: BoxProps) {
  return <InkBox {...props} />
}
