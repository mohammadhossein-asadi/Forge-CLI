import { describe, expect, it } from 'vitest'
import { deepMerge } from './deep-merge.js'

describe('deepMerge', () => {
  it('merges flat objects with later sources winning', () => {
    expect(deepMerge({ a: 1, b: 2 }, { b: 3 })).toEqual({ a: 1, b: 3 })
  })

  it('merges multiple sources left to right', () => {
    expect(deepMerge({ a: 1 }, { a: 2 }, { a: 3 })).toEqual({ a: 3 })
  })

  it('deeply merges nested objects', () => {
    const result = deepMerge(
      { cli: { verbosity: 'normal', color: true }, defaults: { language: 'ts' } },
      { cli: { verbosity: 'debug', color: true } },
    )
    expect(result).toEqual({
      cli: { verbosity: 'debug', color: true },
      defaults: { language: 'ts' },
    })
  })

  it('replaces arrays instead of merging them', () => {
    expect(deepMerge({ list: [1, 2, 3] }, { list: [9] })).toEqual({ list: [9] })
  })

  it('ignores undefined values from sources', () => {
    expect(deepMerge({ a: 1, b: 2 }, { a: undefined } as never)).toEqual({ a: 1, b: 2 })
  })

  it('does not mutate the target object', () => {
    const target = { nested: { value: 1 } }
    deepMerge(target, { nested: { value: 2 } })
    expect(target.nested.value).toBe(1)
  })

  it('skips non-object sources', () => {
    expect(deepMerge({ a: 1 }, undefined as never, null as never)).toEqual({ a: 1 })
  })

  it('returns an equal copy when no sources are given', () => {
    const target = { a: { b: 1 } }
    const result = deepMerge(target)
    expect(result).toEqual(target)
    expect(result).not.toBe(target)
  })
})
