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

function getStatus(invite: Invite): { label: string; color: string } {
  if (invite.used) return { label: 'Used', color: 'gray' }
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    return { label: 'Expired', color: 'red' }
  }
  return { label: 'Pending', color: 'green' }
}

export function InvitesSection() {
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
          title: 'Could not create invite',
          message: 'Please try again.'
        })
      }
    })
  }, [createInvite, email])

  const handleRevoke = useCallback(
    (inviteId: string) => {
      revokeInvite.mutate(inviteId, {
        onError: () => {
          notifications.show({
            color: 'red',
            title: 'Could not revoke invite',
            message: 'Please try again.'
          })
        }
      })
    },
    [revokeInvite]
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
            Invites
          </Text>
          <Text size="xs" c="dimmed">
            Create and manage invite links for new members.
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
          {panelOpen ? 'Cancel' : 'New invite'}
        </Button>
      </Group>

      <Collapse expanded={panelOpen}>
        <Card withBorder padding="md" radius="md">
          <Stack gap="md">
            {!createdUrl ? (
              <>
                <TextInput
                  label="Email (optional)"
                  placeholder="person@example.com"
                  value={email}
                  onChange={event => setEmail(event.currentTarget.value)}
                />
                <Button onClick={handleCreate} loading={createInvite.isPending} fullWidth>
                  Create invite
                </Button>
              </>
            ) : (
              <>
                <Text size="sm" c="dimmed">
                  Share this link with the invitee:
                </Text>

                <Group gap="xs" wrap="nowrap">
                  <TextInput value={createdUrl} readOnly style={{ flex: 1 }} />
                  <CopyButton value={createdUrl} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy link'}>
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
                          Scan to open invite
                        </Text>
                      </Group>
                    </Stack>
                  </Card>
                </Center>

                <Button variant="light" onClick={closePanelAndReset} fullWidth>
                  Done
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
          No invites yet.
        </Text>
      ) : (
        <>
          {/* Desktop / tablet: table */}
          <Table.ScrollContainer minWidth={500} visibleFrom="sm">
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Expires</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {invites.map(invite => {
                  const status = getStatus(invite)
                  const disabled = invite.used || status.label === 'Expired'

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
                        <Tooltip label="Revoke invite">
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
              const status = getStatus(invite)
              const disabled = invite.used || status.label === 'Expired'

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
                          Expires {new Date(invite.expiresAt).toLocaleDateString()}
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