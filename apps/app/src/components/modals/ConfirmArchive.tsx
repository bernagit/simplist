import { Stack, Text } from "@mantine/core";

export default function ConfirmArchive() {
  return (
    <Stack gap="xs">
      <Text size="sm">
        Are you sure you want to archive this list?
      </Text>
      <Text size="sm" c="dimmed">
        If this list is shared, it will be hidden from other users until you unarchive it.
      </Text>
    </Stack>
  )
}