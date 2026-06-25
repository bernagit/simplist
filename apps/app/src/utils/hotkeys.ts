export const HOTKEYS = {
    NEW_LINK: {
        keys: "mod+L",
        description: "Add a new link",
    },
    NEW_COLLECTION: {
        keys: "mod+shift+C",
        description: "Add a new collection",
    },
    FAVORITE: {
        keys: "mod+p",
        description: "Toggle favorite",
    },
    NAV_DASHBOARD: {
        keys: "mod+D",
        description: "Go to Dashboard",
    },
    NAV_COLLECTIONS: {
        keys: "mod+G",
        description: "Go to Collections",
    },
    SHORTCUT_HELP: {
        keys: "shift+?",
        description: "Show shortcuts help",
    },
} as const;

export type HotkeyId = keyof typeof HOTKEYS;
