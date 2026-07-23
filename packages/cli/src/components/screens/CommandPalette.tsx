import React, { useState, useMemo } from 'react'
import { Box } from '../ui/Box.js'
import { Text } from '../ui/Text.js'
import { Divider } from '../ui/Divider.js'

export interface CommandItem {
  id: string
  label: string
  description?: string
  category?: string
  shortcut?: string
}

export interface CommandPaletteProps {
  commands: CommandItem[]
  onSelect: (id: string) => void
  onClose: () => void
}

export function CommandPalette({ commands, onSelect, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filtered = useMemo(() => {
    if (!query) return commands
    const lower = query.toLowerCase()
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) ||
        cmd.description?.toLowerCase().includes(lower) ||
        cmd.category?.toLowerCase().includes(lower),
    )
  }, [commands, query])

  const handleKeyDown = (key: string) => {
    switch (key) {
      case 'up':
        setSelectedIndex((prev) => Math.max(0, prev - 1))
        break
      case 'down':
        setSelectedIndex((prev) => Math.min(filtered.length - 1, prev + 1))
        break
      case 'enter':
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex]!.id)
        }
        break
      case 'escape':
        onClose()
        break
    }
  }

  return (
    <Box flexDirection="column" gap={1} width={60}>
      <Text bold color="#6C9EEB">
        Command Palette
      </Text>
      <Box flexDirection="row" gap={1} borderStyle="single" borderColor="#374151" paddingLeft={1}>
        <Text color="#6C9EEB">⌕</Text>
        <Text>{query || <Text dimColor>Type to search...</Text>}</Text>
      </Box>
      <Divider width={58} />
      <Box flexDirection="column" gap={0}>
        {filtered.map((cmd, i) => (
          <Box key={cmd.id} flexDirection="row" gap={1}>
            <Text color={i === selectedIndex ? '#6C9EEB' : undefined}>
              {i === selectedIndex ? '→' : ' '}
            </Text>
            <Text bold={i === selectedIndex} color={i === selectedIndex ? '#6C9EEB' : undefined}>
              {cmd.label}
            </Text>
            {cmd.description && (
              <Text dimColor> — {cmd.description}</Text>
            )}
            {cmd.shortcut && (
              <Text dimColor> [{cmd.shortcut}]</Text>
            )}
          </Box>
        ))}
      </Box>
      {filtered.length === 0 && (
        <Text dimColor>No commands found.</Text>
      )}
    </Box>
  )
}
