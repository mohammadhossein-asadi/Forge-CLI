type DeepMergeTarget = Record<string, unknown>

function isObject(value: unknown): value is DeepMergeTarget {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function deepMerge<T extends DeepMergeTarget>(
  target: T,
  ...sources: Array<Partial<T>>
): T {
  let result = { ...target }

  for (const source of sources) {
    if (!isObject(source)) continue

    for (const key of Object.keys(source)) {
      const targetValue = result[key as keyof T]
      const sourceValue = source[key as keyof T]

      if (isObject(targetValue) && isObject(sourceValue)) {
        ;(result as Record<string, unknown>)[key] = deepMerge(
          targetValue as DeepMergeTarget,
          sourceValue as DeepMergeTarget,
        )
      } else if (sourceValue !== undefined) {
        ;(result as Record<string, unknown>)[key] = sourceValue
      }
    }
  }

  return result
}
