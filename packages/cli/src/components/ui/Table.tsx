import React from 'react'
import { Text } from './Text.js'

export interface TableColumn {
  header: string
  width?: number
  align?: 'left' | 'right' | 'center'
}

export interface TableProps {
  columns: TableColumn[]
  rows: (string | number)[][]
  color?: string
  headerColor?: string
}

export function Table({ columns, rows, color = '#F9FAFB', headerColor = '#6C9EEB' }: TableProps) {
  const colWidths = columns.map((col, i) => {
    const maxDataWidth = Math.max(...rows.map((row) => String(row[i] ?? '').length))
    return col.width ?? Math.max(col.header.length, maxDataWidth) + 2
  })

  const renderRow = (cells: (string | number)[], isHeader = false) => {
    return cells.map((cell, i) => {
      const width = colWidths[i]!
      const text = String(cell ?? '').padEnd(width)
      return text
    }).join(' │ ')
  }

  return (
    <>
      <Text bold color={headerColor}>
        {renderRow(columns.map((c) => c.header), true)}
      </Text>
      <Text color="#374151">
        {colWidths.map((w) => '─'.repeat(w)).join('─┼─')}
      </Text>
      {rows.map((row, i) => (
        <Text key={i} color={color}>
          {renderRow(row)}
        </Text>
      ))}
    </>
  )
}
