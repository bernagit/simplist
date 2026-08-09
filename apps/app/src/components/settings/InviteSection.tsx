'use client'

import { useState, useCallback } from 'react'
import {
  Stack,
  Group,
  Text,
  Button,
  Table,
  Badge,
  ActionIcon,
  TextInput,
  Collapse,
  CopyButton,
  Tooltip,
  Loader,
  Center,
  Card,
  Box,
  Divider,
  useMantineTheme
} from '@mantine/core'
import { useMediaQuery, useDisclosure } from '@mantine/hooks'
import { IconTrash, IconCopy, IconCheck, IconPlus, IconQrcode, IconX } from '@tabler/icons-react'
import { QRCodeSVG } from 'qrcode.react'
import { Invite } from '@/models/invite'
import { notifications } from '@mantine/notifications'
import { useCreateInvite, useInvites, useRevokeInvite } from '@/queries/invite'
import { useTranslations } from 'next-intl'

function getStatus(
  invite: Invite,
  t: (key: string) => string
): { label: string; color: string; key: 'used' | 'expired' | 'pending' } {
  if (invite.used) return { label: t('status.used'), color: 'gray', key: 'used' }
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    return { label: t('status.expired'), color: 'red', key: 'expired' }
  }
  return { label: t('status.pending'), color: 'green', key: 'pending' }
}

export function InvitesSection() {
  const t = useTranslations('InvitesSection')
  const theme = useMantineTheme()
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)

  const { data, isLoading } = useInvites()
  const invites = data?.data ?? []

  const createInvite = useCreateInvite()
  const revokeInvite = useRevokeInvite()

  const [panelOpen, { toggle: togglePanel, close: closePanel }] = useDisclosure(false)
  const [email, setEmail] = useState('')
  const [createdUrl, setCreatedUrl] = useState<string | null>(null)

  const handleCreate = useCallback(() => {
    createInvite.mutate(email.trim() || null, {
      onSuccess: response => {
        setCreatedUrl(response.data.inviteUrl)
        setEmail('')
      },
      onError: () => {
        notifications.show({
          color: 'red',
          title: t('notifications.createErrorTitle'),
          message: t('notifications.errorMessage')
        })
      }
    })
  }, [createInvite, email, t])

  const handleRevoke = useCallback(
    (inviteId: string) => {
      revokeInvite.mutate(inviteId, {
        onError: () => {
          notifications.show({
            color: 'red',
            title: t('notifications.revokeErrorTitle'),
            message: t('notifications.errorMessage')
          })
        }
      })
    },
    [revokeInvite, t]
  )

  const closePanelAndReset = useCallback(() => {
    closePanel()
    setCreatedUrl(null)
    setEmail('')
  }, [closePanel])

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <div>
          <Text fw={500} size="sm">
            {t('title')}
          </Text>
          <Text size="xs" c="dimmed">
            {t('subtitle')}
          </Text>
        </div>
        <Button
          size="xs"
          variant={panelOpen ? 'light' : 'filled'}
          color={panelOpen ? 'red' : 'inherit'}
          leftSection={panelOpen ? <IconX size={14} /> : <IconPlus size={14} />}
          onClick={() => (panelOpen ? closePanelAndReset() : togglePanel())}
          fullWidth={isMobile}
        >
          {panelOpen ? t('buttons.cancel') : t('buttons.newInvite')}
        </Button>
      </Group>

      <Collapse expanded={panelOpen}>
        <Card withBorder padding="md" radius="md">
          <Stack gap="md">
            {!createdUrl ? (
              <>
                <TextInput
                  label={t('panel.emailLabel')}
                  placeholder={t('panel.emailPlaceholder')}
                  value={email}
                  onChange={event => setEmail(event.currentTarget.value)}
                />
                <Button onClick={handleCreate} loading={createInvite.isPending} fullWidth>
                  {t('buttons.create')}
                </Button>
              </>
            ) : (
              <>
                <Text size="sm" c="dimmed">
                  {t('panel.shareText')}
                </Text>

                <Group gap="xs" wrap="nowrap">
                  <TextInput value={createdUrl} readOnly style={{ flex: 1 }} />
                  <CopyButton value={createdUrl} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? t('panel.copied') : t('panel.copyLink')}>
                        <ActionIcon variant="light" onClick={copy}>
                          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>

                <Center>
                  <Card withBorder padding="md" radius="md">
                    <Stack align="center" gap="xs">
                      <QRCodeSVG value={createdUrl} size={160} />
                      <Group gap={4}>
                        <IconQrcode size={14} />
                        <Text size="xs" c="dimmed">
                          {t('panel.qrCodeScan')}
                        </Text>
                      </Group>
                    </Stack>
                  </Card>
                </Center>

                <Button variant="light" onClick={closePanelAndReset} fullWidth>
                  {t('buttons.done')}
                </Button>
              </>
            )}
          </Stack>
        </Card>
      </Collapse>

      {(panelOpen || invites.length > 0) && !isLoading && <Divider />}

      {isLoading ? (
        <Center py="lg">
          <Loader size="sm" />
        </Center>
      ) : invites.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t('empty')}
        </Text>
      ) : (
        <>
          {/* Desktop / tablet: table */}
          <Table.ScrollContainer minWidth={500} visibleFrom="sm">
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('table.email')}</Table.Th>
                  <Table.Th>{t('table.status')}</Table.Th>
                  <Table.Th>{t('table.expires')}</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {invites.map(invite => {
                  const status = getStatus(invite, t)
                  const disabled = invite.used || status.key === 'expired'

                  return (
                    <Table.Tr key={invite.id}>
                      <Table.Td>
                        <Text size="sm">{invite.email ?? '—'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={status.color} variant="light" size="sm">
                          {status.label}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Tooltip label={t('table.revoke')}>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            disabled={disabled}
                            loading={
                              revokeInvite.isPending &&
                              revokeInvite.variables === invite.id
                            }
                            onClick={() => handleRevoke(invite.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>
                  )
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {/* Mobile: card list */}
          <Stack gap="xs" hiddenFrom="sm">
            {invites.map(invite => {
              const status = getStatus(invite, t)
              const disabled = invite.used || status.key === 'expired'

              return (
                <Card key={invite.id} withBorder padding="sm" radius="md">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" fw={500} truncate>
                        {invite.email ?? '—'}
                      </Text>
                      <Group gap={6} mt={4}>
                        <Badge color={status.color} variant="light" size="sm">
                          {status.label}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {t('table.expiresMobile', {
                            date: new Date(invite.expiresAt).toLocaleDateString()
                          })}
                        </Text>
                      </Group>
                    </Box>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      disabled={disabled}
                      loading={
                        revokeInvite.isPending &&
                        revokeInvite.variables === invite.id
                      }
                      onClick={() => handleRevoke(invite.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Card>
              )
            })}
          </Stack>
        </>
      )}
    </Stack>
  )
}