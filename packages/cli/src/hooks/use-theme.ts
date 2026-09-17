import { type Theme, defaultTheme, getTheme } from '../rendering/theme.js'

export interface UseThemeOptions {
  themeName?: string
}

export function useTheme(options: UseThemeOptions = {}): Theme {
  return options.themeName ? getTheme(options.themeName) : defaultTheme
}
