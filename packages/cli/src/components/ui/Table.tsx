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

  const renderRow = (cells: (string | number)[]) => {
    return cells
      .map((cell, i) => {
        const width = colWidths[i] ?? 10
        return String(cell ?? '').padEnd(width)
      })
      .join(' │ ')
  }

  return (
    <>
      <Text bold color={headerColor}>
        {renderRow(columns.map((c) => c.header))}
      </Text>
      <Text color="#374151">{colWidths.map((w) => '─'.repeat(w)).join('─┼─')}</Text>
      {rows.map((row, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: rows are anonymous positional data
        <Text key={i} color={color}>
          {renderRow(row)}
        </Text>
      ))}
    </>
  )
}
