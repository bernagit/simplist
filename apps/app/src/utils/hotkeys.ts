export const HOTKEYS = {
  NEW_LIST: {
    keys: 'mod+L',
    description: 'Add a new list'
  }
} as const

export type HotkeyId = keyof typeof HOTKEYS
