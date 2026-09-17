export interface ThemeColors {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
  muted: string
  accent: string
  focus: string
  border: string
  background: string
  foreground: string
}

export interface Theme {
  name: string
  colors: ThemeColors
}

export const defaultTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#6C9EEB',
    secondary: '#A78BFA',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#67E8F9',
    muted: '#6B7280',
    accent: '#F472B6',
    focus: '#818CF8',
    border: '#374151',
    background: '#111827',
    foreground: '#F9FAFB',
  },
}

export const themes: Record<string, Theme> = {
  dark: defaultTheme,
  light: {
    name: 'light',
    colors: {
      ...defaultTheme.colors,
      background: '#FFFFFF',
      foreground: '#111827',
      border: '#E5E7EB',
      muted: '#9CA3AF',
    },
  },
  nord: {
    name: 'nord',
    colors: {
      primary: '#88C0D0',
      secondary: '#B48EAD',
      success: '#A3BE8C',
      warning: '#EBCB8B',
      error: '#BF616A',
      info: '#88C0D0',
      muted: '#4C566A',
      accent: '#B48EAD',
      focus: '#81A1C1',
      border: '#3B4252',
      background: '#2E3440',
      foreground: '#ECEFF4',
    },
  },
  'tokyo-night': {
    name: 'tokyo-night',
    colors: {
      primary: '#7AA2F7',
      secondary: '#BB9AF7',
      success: '#9ECE6A',
      warning: '#E0AF68',
      error: '#F7768E',
      info: '#7DCFFF',
      muted: '#565F89',
      accent: '#FF9E64',
      focus: '#7AA2F7',
      border: '#3B4261',
      background: '#1A1B26',
      foreground: '#C0CAF5',
    },
  },
  catppuccin: {
    name: 'catppuccin',
    colors: {
      primary: '#89B4FA',
      secondary: '#CBA6F7',
      success: '#A6E3A1',
      warning: '#F9E2AF',
      error: '#F38BA8',
      info: '#89DCEB',
      muted: '#6C7086',
      accent: '#F5C2E7',
      focus: '#B4BEFE',
      border: '#45475A',
      background: '#1E1E2E',
      foreground: '#CDD6F4',
    },
  },
  dracula: {
    name: 'dracula',
    colors: {
      primary: '#BD93F9',
      secondary: '#FF79C6',
      success: '#50FA7B',
      warning: '#F1FA8C',
      error: '#FF5555',
      info: '#8BE9FD',
      muted: '#6272A4',
      accent: '#FF79C6',
      focus: '#BD93F9',
      border: '#44475A',
      background: '#282A36',
      foreground: '#F8F8F2',
    },
  },
  gruvbox: {
    name: 'gruvbox',
    colors: {
      primary: '#83A598',
      secondary: '#D3869B',
      success: '#B8BB26',
      warning: '#FABD2F',
      error: '#FB4934',
      info: '#8EC07C',
      muted: '#928374',
      accent: '#FE8019',
      focus: '#83A598',
      border: '#3C3836',
      background: '#282828',
      foreground: '#EBDBB2',
    },
  },
  solarized: {
    name: 'solarized',
    colors: {
      primary: '#268BD2',
      secondary: '#6C71C4',
      success: '#859900',
      warning: '#B58900',
      error: '#DC322F',
      info: '#2AA198',
      muted: '#93A1A1',
      accent: '#D33682',
      focus: '#268BD2',
      border: '#586E75',
      background: '#002B36',
      foreground: '#EEE8D5',
    },
  },
  minimal: {
    name: 'minimal',
    colors: {
      primary: '#FFFFFF',
      secondary: '#A0A0A0',
      success: '#D0D0D0',
      warning: '#B0B0B0',
      error: '#FF6B6B',
      info: '#C0C0C0',
      muted: '#808080',
      accent: '#E0E0E0',
      focus: '#F0F0F0',
      border: '#404040',
      background: '#000000',
      foreground: '#EDEDED',
    },
  },
}

export function getTheme(name?: string): Theme {
  if (name && name in themes) {
    return themes[name] as Theme
  }
  return defaultTheme
}
