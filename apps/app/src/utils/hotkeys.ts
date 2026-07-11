export const HOTKEYS = {
  NEW_LIST: {
    keys: ['mod+l'],
    description: 'Add a new list',
  },

  TOGGLE_THEME: {
    keys: ['mod+j'],
    description: 'Toggle theme',
  },

  TOGGLE_SIDEBAR: {
    keys: ['m'],
    description: 'Toggle sidebar',
  },

  GO_HOME: {
    keys: ['g', 'h'],
    description: 'Go home',
  },

  GO_CALENDAR: {
    keys: ['g', 'c'],
    description: 'Go to calendar',
  },

  GO_LISTS: {
    keys: ['g', 'l'],
    description: 'Go to lists',
  },

  GO_SHARED_LISTS: {
    keys: ['g', 's'],
    description: 'Go to shared lists',
  },

} as const

export type HotkeyId = keyof typeof HOTKEYS