import { render } from 'ink-testing-library'
import { describe, expect, it } from 'vitest'
import { App } from './app.js'

describe('App', () => {
  it('renders the product name by default', () => {
    const { lastFrame } = render(<App />)
    expect(lastFrame()).toContain('Forge CLI')
  })

  it('renders the running command when provided', () => {
    const { lastFrame } = render(<App command="doctor" />)
    expect(lastFrame()).toContain('Running command: doctor')
  })
})
