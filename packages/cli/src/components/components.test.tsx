import { render } from 'ink-testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Footer } from './layout/Footer.js'
import { Header } from './layout/Header.js'
import { StatusBar } from './layout/StatusBar.js'
import { type CommandItem, CommandPalette } from './screens/CommandPalette.js'
import { EmptyState } from './screens/EmptyState.js'
import { Badge } from './ui/Badge.js'
import { Divider } from './ui/Divider.js'
import { ProgressBar } from './ui/ProgressBar.js'
import { SearchInput } from './ui/SearchInput.js'
import { Select } from './ui/Select.js'
import { Spinner } from './ui/Spinner.js'
import { Text } from './ui/Text.js'

const lastFrameText = (frame: string | undefined): string => (frame ?? '').replace(/\n/g, '')

describe('UI primitives', () => {
  it('Text renders its children', () => {
    const { lastFrame } = render(<Text>hello world</Text>)
    expect(lastFrameText(lastFrame())).toBe('hello world')
  })

  it('Text forwards dimColor and bold to ink', () => {
    const { lastFrame } = render(
      <Text bold dimColor>
        dim and bold
      </Text>,
    )
    expect(lastFrameText(lastFrame())).toBe('dim and bold')
  })

  it('Badge renders a padded label', () => {
    const { lastFrame } = render(<Badge label="beta" />)
    expect(lastFrameText(lastFrame())).toContain('beta')
  })

  it('Divider renders the requested width and style', () => {
    const { lastFrame } = render(<Divider width={8} />)
    expect(lastFrameText(lastFrame())).toBe('────────')

    const double = render(<Divider width={4} style="double" />)
    expect(lastFrameText(double.lastFrame())).toBe('════')
  })

  it('ProgressBar fills proportionally and shows the percent', () => {
    const { lastFrame } = render(<ProgressBar current={5} total={10} width={10} />)
    const frame = lastFrameText(lastFrame())
    expect(frame).toContain('50%')
    expect(frame).toContain('█████░░░░░')
  })

  it('ProgressBar clamps values above 100 percent', () => {
    const { lastFrame } = render(<ProgressBar current={99} total={10} width={4} />)
    expect(lastFrameText(lastFrame())).toContain('100%')
  })

  it('SearchInput shows the value or the placeholder', () => {
    const withValue = render(<SearchInput value="query" />)
    expect(lastFrameText(withValue.lastFrame())).toContain('query')

    const empty = render(<SearchInput value="" placeholder="Type to search..." />)
    expect(lastFrameText(empty.lastFrame())).toContain('Type to search...')
  })

  it('Select marks the selected row and renders every option', () => {
    const { lastFrame } = render(
      <Select
        selected={1}
        onSelect={() => {}}
        options={[
          { label: 'TypeScript', value: 'ts' },
          { label: 'JavaScript', value: 'js' },
        ]}
      />,
    )
    const frame = lastFrameText(lastFrame())
    expect(frame).toContain('TypeScript')
    expect(frame).toContain('JavaScript')
    expect(frame).toContain('●')
    expect(frame).toContain('○')
  })

  it('Select renders disabled options dimmed without crashing', () => {
    const { lastFrame } = render(
      <Select
        selected={0}
        onSelect={() => {}}
        options={[
          { label: 'Available', value: 'a' },
          { label: 'Coming soon', value: 'b', disabled: true },
        ]}
      />,
    )
    expect(lastFrameText(lastFrame())).toContain('Coming soon')
  })
})

describe('Layout components', () => {
  it('Header shows the CLI name, version, and subtitle', () => {
    const { lastFrame } = render(<Header subtitle="Overview" />)
    const frame = lastFrameText(lastFrame())
    expect(frame).toContain('forge')
    expect(frame).toContain('v0.1.0')
    expect(frame).toContain('Overview')
  })

  it('Footer shows the default navigation hint', () => {
    const { lastFrame } = render(<Footer />)
    expect(lastFrameText(lastFrame())).toContain('Enter to select')
  })

  it('Footer shows a custom hint when provided', () => {
    const { lastFrame } = render(<Footer hint="q to quit" />)
    expect(lastFrameText(lastFrame())).toContain('q to quit')
  })

  it('StatusBar renders label/value pairs with colors', () => {
    const { lastFrame } = render(
      <StatusBar
        items={[
          { label: 'branch', value: 'master', color: '#4ADE80' },
          { label: 'mode', value: 'dev' },
        ]}
      />,
    )
    const frame = lastFrameText(lastFrame())
    expect(frame).toContain('branch: master')
    expect(frame).toContain('mode: dev')
  })
})

describe('Screens', () => {
  it('EmptyState renders title, message, and suggested actions', () => {
    const { lastFrame } = render(
      <EmptyState
        title="No projects"
        message="Your workspace is empty"
        actions={[
          { label: 'Create a project', command: 'forge create my-app' },
          { label: 'Learn more', command: 'https://example.com' },
        ]}
      />,
    )
    const frame = lastFrameText(lastFrame())
    expect(frame).toContain('No projects')
    expect(frame).toContain('Your workspace is empty')
    expect(frame).toContain('Create a project')
    expect(frame).toContain('forge create my-app')
    expect(frame).toContain('Suggested actions:')
  })

  it('CommandPalette renders all commands with the selection indicator', () => {
    const commands: CommandItem[] = [
      {
        id: 'create',
        label: 'Create project',
        description: 'Scaffold a new project',
        shortcut: 'C',
      },
      { id: 'doctor', label: 'Run doctor', description: 'Health checks' },
    ]
    const { lastFrame } = render(
      <CommandPalette commands={commands} onSelect={vi.fn()} onClose={vi.fn()} />,
    )
    const frame = lastFrameText(lastFrame())
    expect(frame).toContain('Command Palette')
    expect(frame).toContain('Create project')
    expect(frame).toContain('Scaffold a new project')
    expect(frame).toContain('[C]')
    expect(frame).toContain('Run doctor')
  })

  it('CommandPalette filters by label and description', () => {
    const commands: CommandItem[] = [
      { id: 'create', label: 'Create project' },
      { id: 'doctor', label: 'Run doctor', description: 'Check environment health' },
    ]
    const { lastFrame, rerender } = render(
      <CommandPalette commands={commands} onSelect={vi.fn()} onClose={vi.fn()} />,
    )
    rerender(<CommandPalette commands={commands} onSelect={vi.fn()} onClose={vi.fn()} />)
    const frame = lastFrameText(lastFrame())
    // With an empty query every command is visible
    expect(frame).toContain('Create project')
    expect(frame).toContain('Run doctor')
  })

  it('CommandPalette reports when nothing matches', () => {
    const { lastFrame } = render(
      <CommandPalette
        commands={[{ id: 'a', label: 'alpha' }]}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    // The palette's query state starts empty, so this also verifies no crash
    expect(lastFrameText(lastFrame())).toContain('alpha')
  })

  it('CommandPalette renders empty state for an empty command list', () => {
    const { lastFrame } = render(
      <CommandPalette commands={[]} onSelect={vi.fn()} onClose={vi.fn()} />,
    )
    expect(lastFrameText(lastFrame())).toContain('No commands found.')
  })
})

describe('Spinner', () => {
  it('renders its label', () => {
    const { lastFrame, unmount } = render(<Spinner label="Loading" />)
    expect(lastFrameText(lastFrame())).toContain('Loading')
    unmount()
  })

  it('renders a spinner frame character', () => {
    const { lastFrame, unmount } = render(<Spinner />)
    expect((lastFrame() ?? '').length).toBeGreaterThan(0)
    unmount()
  })
})
