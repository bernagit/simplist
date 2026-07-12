import { HotkeyId, HOTKEYS } from "@/utils/hotkeys";
import { Group, Text } from "@mantine/core";
import { HotkeyBinding } from "./KeyBinding";

export function ShortcutRow({ hotkey }: { hotkey: HotkeyId }) {
  return (
    <Group
      justify="space-between"
      py="xs"
      px="sm"
      style={{
        borderRadius: 8,
      }}
    >
      <Text size="sm">
        {HOTKEYS[hotkey].description}
      </Text>

      <HotkeyBinding hotkey={hotkey} />
    </Group>
  )
}