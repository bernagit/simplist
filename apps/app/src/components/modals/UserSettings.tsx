'use client'

import {
  ActionIcon,
  Box,
  Group,
  NavLink,
  Overlay,
  ScrollArea,
  Stack,
  Text,
  Title
} from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { ContextModalProps } from '@mantine/modals'
import {
  IconBell,
  IconMoon,
  IconSettings,
  IconUser,
  IconLayoutSidebar,
  IconX,
  IconUsers,
  IconInfoCircle
} from '@tabler/icons-react'
import { useState } from 'react'
import { AppearanceSection } from '../settings/AppearanceSection'
import { GeneralSection } from '../settings/GeneralSection'
import { AccountSection } from '../settings/AccountSection'
import { usePreferences } from '@/queries/preferences'
import { InvitesSection } from '../settings/InviteSection'
import { InfoSection } from '../settings/InfoSection'
import { NotificationsSection } from '../settings/NotificationsSection'
import { useTranslations } from 'next-intl'
import { MOBILE_QUERY } from '@/providers/SidebarProvider'

export type SettingsSection =
  | 'general'
  | 'account'
  | 'appearance'
  | 'invites'
  | 'notifications'
  | 'info'
type Section = SettingsSection

const NAV_WIDTH = 240

export default function UserSettings({
  context,
  id,
  innerProps
}: ContextModalProps<{ section?: SettingsSection | undefined }>) {
  const t = useTranslations('UserSettings')
  const [opened, { toggle }] = useDisclosure(false)
  const [section, setSection] = useState<Section>(innerProps?.section ?? 'general')
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const { data: pref, isLoading: prefLoading } = usePreferences(true)

  const handleSectionChange = (next: Section) => {
    setSection(next)
    if (isMobile) toggle()
  }

  const navLabels: Record<Section, string> = {
    general: t('nav.general'),
    account: t('nav.account'),
    appearance: t('nav.appearance'),
    invites: t('nav.invites'),
    notifications: t('nav.notifications'),
    info: t('nav.info')
  }

  return (
    <Box
      style={{
        display: 'flex',
        // The modal is full screen on phones: use the whole height there
        height: isMobile ? '100dvh' : '80dvh',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {isMobile && opened && (
        <Overlay pos="absolute" zIndex={199} backgroundOpacity={0.4} onClick={toggle} />
      )}
      {/* Sidebar Navigazione */}
      <Box
        w={NAV_WIDTH}
        p="md"
        pos={isMobile ? 'absolute' : 'relative'}
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
          <Title order={3}>{t('settingsTitle')}</Title>

          <Stack gap={4}>
            <NavLink
              active={section === 'general'}
              label={navLabels.general}
              leftSection={<IconSettings size={18} />}
              onClick={() => handleSectionChange('general')}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />

            <NavLink
              active={section === 'account'}
              label={navLabels.account}
              leftSection={<IconUser size={18} />}
              onClick={() => handleSectionChange('account')}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />

            <NavLink
              active={section === 'appearance'}
              label={navLabels.appearance}
              leftSection={<IconMoon size={18} />}
              onClick={() => handleSectionChange('appearance')}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />

            <NavLink
              active={section === 'notifications'}
              label={navLabels.notifications}
              leftSection={<IconBell size={18} />}
              onClick={() => handleSectionChange('notifications')}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />

            <NavLink
              active={section === 'invites'}
              label={navLabels.invites}
              leftSection={<IconUsers size={18} />}
              onClick={() => handleSectionChange('invites')}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />

            <NavLink
              active={section === 'info'}
              label={navLabels.info}
              leftSection={<IconInfoCircle size={18} />}
              onClick={() => handleSectionChange('info')}
              style={{ borderRadius: 'var(--mantine-radius-md)' }}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Contenuto Principale */}
      <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Header con Titolo e Bottone di Chiusura */}
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
              aria-label={t('aria.toggleNav')}
            >
              <IconLayoutSidebar size={18} />
            </ActionIcon>

            <Title order={3}>{navLabels[section]}</Title>
          </Group>

          {/* Tasto per chiudere il Modale di Contesto */}
          <ActionIcon variant="subtle" color="gray" onClick={() => context.closeModal(id)}>
            <IconX size={18} />
          </ActionIcon>
        </Group>

        {/* Corpo della Sezione */}
        <ScrollArea flex={1} p="lg">
          {section === 'general' && (
            <Stack>
              <Text c="dimmed">{t('general.subtitle')}</Text>
              <GeneralSection preferences={pref?.data} loading={prefLoading} />
            </Stack>
          )}

          {section === 'account' && (
            <Stack>
              <Text c="dimmed">{t('account.subtitle')}</Text>
              <AccountSection />
            </Stack>
          )}

          {section === 'appearance' && (
            <Stack>
              <Text c="dimmed">{t('appearance.subtitle')}</Text>
              <AppearanceSection />
            </Stack>
          )}

          {section === 'notifications' && (
            <Stack>
              <Text c="dimmed">{t('notifications.subtitle')}</Text>
              <NotificationsSection />
            </Stack>
          )}

          {section === 'invites' && (
            <Stack>
              <Text c="dimmed">{t('invites.subtitle')}</Text>
              <InvitesSection />
            </Stack>
          )}

          {section === 'info' && <InfoSection />}
        </ScrollArea>
      </Box>
    </Box>
  )
}