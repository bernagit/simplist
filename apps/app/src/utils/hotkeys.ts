export const HOTKEYS = {
  NEW_LIST: {
    keys: ['mod+l'],
    description: 'Add a new list',
    category: 'Actions'
  },

  SHARE_LIST: {
    keys: ['shift+s'],
    description: 'Share current list',
    category: 'Actions'
  },

  EDIT_LIST: {
    keys: ['shift+e'],
    description: 'Edit current list',
    category: 'Actions'
  },

  TOGGLE_THEME: {
    keys: ['mod+j'],
    description: 'Toggle theme',
    category: 'General'
  },

  TOGGLE_SIDEBAR: {
    keys: ['m'],
    description: 'Toggle sidebar',
    category: 'General'
  },

  TOGGLE_HELP: {
    keys: ['shift+h'],
    description: 'Open help',
    category: 'General'
  },

  GO_HOME: {
    keys: ['g', 'g'],
    description: 'Go home',
    category: 'Navigation'
  },

  GO_CALENDAR: {
    keys: ['g', 'c'],
    description: 'Go to calendar',
    category: 'Navigation'
  },

  GO_LISTS: {
    keys: ['g', 'l'],
    description: 'Go to lists',
    category: 'Navigation'
  },

  GO_SHARED_LISTS: {
    keys: ['g', 's'],
    description: 'Go to "shared with me"',
    category: 'Navigation'
  }
} as const

export type HotkeyId = keyof typeof HOTKEYS
