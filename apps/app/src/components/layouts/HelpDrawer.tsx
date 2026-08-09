'use client'

import { useMemo } from 'react'
import { useHelp } from '@/providers/HelpProvider'
import { HOTKEYS, HotkeyId } from '@/utils/hotkeys'

import { ActionIcon, Divider, Drawer, Group, ScrollArea, Stack, Text, Title } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { useTranslations } from 'next-intl'
import { HotkeyBinding } from '../common/KeyBinding'

function ShortcutSection({ title, hotkeys }: { title: string; hotkeys: HotkeyId[] }) {
  const tCategory = useTranslations('HotkeyCategories')
  const tHotkeys = useTranslations('Hotkeys')

  return (
    <Stack gap={4}>
      <Text fw={600} size="sm">
        {tCategory.has(title) ? tCategory(title) : title}
      </Text>

      <Divider />

      {hotkeys.map(hotkey => (
        <Group key={hotkey} justify="space-between" py={4}>
          <Text size="sm">
            {tHotkeys.has(hotkey) ? tHotkeys(hotkey) : HOTKEYS[hotkey].description}
          </Text>

          <HotkeyBinding hotkey={hotkey} />
        </Group>
      ))}
    </Stack>
  )
}

export default function HelpDrawer() {
  const t = useTranslations('HelpDrawer')
  const { opened, close } = useHelp()

  const sections = useMemo(() => {
    return Object.entries(HOTKEYS).reduce(
      (acc, [id, hotkey]) => {
        const category = hotkey.category
        acc[category] ??= []
        acc[category].push(id as HotkeyId)
        return acc
      },
      {} as Record<string, HotkeyId[]>
    )
  }, [])

  return (
    <Drawer
      opened={opened}
      onClose={close}
      position="right"
      offset={20}
      radius="md"
      size="md"
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.3 }}
      p={0}
    >
      <Drawer.Body p={'xs'} h="100%">
        <Stack h="100%">
          <Group justify="space-between">
            <Title order={4}>{t('title')}</Title>

            <ActionIcon variant="subtle" onClick={close}>
              <IconX size={18} />
            </ActionIcon>
          </Group>

          <Text size="sm" c="dimmed">
            {t('description')}
          </Text>

          <ScrollArea flex={1}>
            <Stack gap="md" pb="md">
              {Object.entries(sections).map(([title, hotkeys]) => (
                <ShortcutSection key={title} title={title} hotkeys={hotkeys} />
              ))}
            </Stack>
          </ScrollArea>
        </Stack>
      </Drawer.Body>
    </Drawer>
  )
}