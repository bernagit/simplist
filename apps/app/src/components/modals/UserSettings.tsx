'use client'

import { ActionIcon, Box, Group, NavLink, ScrollArea, Stack, Text, Title } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { ContextModalProps } from '@mantine/modals'
import { IconMoon, IconSettings, IconUser, IconLayoutSidebar, IconX } from '@tabler/icons-react'
import { useState } from 'react'
import { AppearanceSection } from '../settings/AppearanceSection'
import { GeneralSection } from '../settings/GeneralSection'
import { AccountSection } from '../settings/AccountSection'
import { usePreferences } from '@/queries/preferences'

type Section = 'general' | 'account' | 'appearance' | 'notifications'

const NAV_WIDTH = 240

const SECTION_LABELS: Record<Section, string> = {
  general: 'General',
  account: 'Account',
  appearance: 'Appearance',
  notifications: 'Notifications'
}

export default function UserSettings({ context, id }: ContextModalProps) {
  const [opened, { toggle }] = useDisclosure(false)
  const [section, setSection] = useState<Section>('general')
  const isMobile = useMediaQuery('(max-width: 768px)') ?? false
  const { data: pref, isLoading: prefLoading } = usePreferences(true)

  const handleSectionChange = (next: Section) => {
    setSection(next)
    if (isMobile) toggle()
  }

  return (
    <Box style={{ display: 'flex', height: '80dvh', position: 'relative', overflow: 'hidden' }}>
      <Box
        w={NAV_WIDTH}
        p="md"
        pos={isMobile ? 'fixed' : 'relative'}
        h={isMobile ? '100%' : undefined}
        style={{
          top: 0,
          left: isMobile ? (opened ? 0 : -NAV_WIDTH) : undefined,
          zIndex: isMobile ? 200 : undefined,
          flexShrink: 0,
          transition: isMobile ? 'left 200ms ease' : undefined,
          borderRight: `1px solid var(--mantine-color-default-border)`,
          backgroundColor: 'var(--mantine-color-body)'
        }}
      >
        <Stack gap="md">
          <Title order={3}>Settings</Title>

          <Stack gap={4}>
            <NavLink
              active={section === 'general'}
              label={SECTION_LABELS.general}
              leftSection={<IconSettings size={18} />}
              onClick={() => handleSectionChange('general')}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />

            <NavLink
              active={section === 'account'}
              label={SECTION_LABELS.account}
              leftSection={<IconUser size={18} />}
              onClick={() => handleSectionChange('account')}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />

            <NavLink
              active={section === 'appearance'}
              label={SECTION_LABELS.appearance}
              leftSection={<IconMoon size={18} />}
              onClick={() => handleSectionChange('appearance')}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />

            {/* <NavLink
              active={section === 'notifications'}
              label={SECTION_LABELS.notifications}
              leftSection={<IconBell size={18} />}
              onClick={() => handleSectionChange('notifications')}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            /> */}
          </Stack>
        </Stack>
      </Box>

      <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Group
          justify="space-between"
          p="md"
          style={{
            borderBottom: '1px solid var(--mantine-color-default-border)'
          }}
        >
          <Group>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={toggle}
              hiddenFrom="sm"
              aria-label="Toggle settings navigation"
            >
              <IconLayoutSidebar size={18} />
            </ActionIcon>

            <Title order={3}>{SECTION_LABELS[section]}</Title>
          </Group>

          <ActionIcon variant="subtle" onClick={() => context.closeModal(id)}>
            <IconX />
          </ActionIcon>
        </Group>

        <ScrollArea flex={1} p="lg">
          {section === 'general' && (
            <Stack>
              <Title order={4}>General</Title>
              <Text c="dimmed">General application settings.</Text>
              <GeneralSection preferences={pref?.data} loading={prefLoading} />
            </Stack>
          )}

          {section === 'account' && (
            <Stack>
              <Title order={4}>Account</Title>
              <Text c="dimmed">Profile, password and email.</Text>
              <AccountSection />
            </Stack>
          )}

          {section === 'appearance' && (
            <Stack>
              <Title order={4}>Appearance</Title>
              <Text c="dimmed">Customize the look and feel of Simplist.</Text>
              <AppearanceSection />
            </Stack>
          )}

          {/* {section === 'notifications' && (
            <Stack>
              <Title order={4}>Notifications</Title>
            </Stack>
          )} */}
        </ScrollArea>
      </Box>
    </Box>
  )
}
