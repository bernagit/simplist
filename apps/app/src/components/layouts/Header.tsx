"use client";
import { useSidebar } from "@/providers/SidebarProvider";
import { Group, ActionIcon, Box } from "@mantine/core";
import {
  IconLayoutSidebar,
} from "@tabler/icons-react";

export function Header() {
  const { toggle, opened } = useSidebar();

  return (
    <Box h={50} style={{ flexShrink: 0 }}>
      <Group h="100%" px="md">
        {!opened && (
          <ActionIcon mt={'sm'} variant="subtle" color="gray" size="md" onClick={toggle} aria-label="Toggle sidebar">
            <IconLayoutSidebar size={18} />
          </ActionIcon>
        )}
      </Group>
    </Box>
  );
}