import { describe, expect, it } from 'vitest'
import { DATABASES } from './database-select.js'
import { FRAMEWORKS } from './framework-select.js'
import { PACKAGE_MANAGERS } from './package-manager-select.js'
import { STYLING } from './styling-select.js'
import { TESTING } from './testing-select.js'

describe('create wizard option tables', () => {
  it('offers the six documented frameworks', () => {
    expect(FRAMEWORKS.map((f) => f.id)).toEqual([
      'react',
      'nextjs',
      'vue',
      'node',
      'library',
      'empty',
    ])
    expect(FRAMEWORKS.every((f) => f.name.length > 0)).toBe(true)
  })

  it('offers the four supported package managers', () => {
    expect(PACKAGE_MANAGERS.map((p) => p.id)).toEqual(['npm', 'pnpm', 'yarn', 'bun'])
  })

  it('offers styling choices including an escape hatch', () => {
    expect(STYLING.map((s) => s.id)).toEqual(['css', 'tailwind', 'css-modules', 'none'])
  })

  it('offers test runners with a skip option', () => {
    expect(TESTING.map((t) => t.id)).toEqual(['vitest', 'jest', 'none'])
  })

  it('offers databases with none as an option', () => {
    expect(DATABASES.map((d) => d.id)).toEqual(['none', 'sqlite', 'postgres', 'mysql', 'mongodb'])
    expect(DATABASES[0]?.id).toBe('none')
  })
})
