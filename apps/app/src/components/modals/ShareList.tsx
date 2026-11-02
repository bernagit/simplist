'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  useChangeListMemberRole,
  useDeleteListMember,
  useListById,
  useShareList
} from '@/queries/lists'
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Container,
  Divider,
  Flex,
  Group,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme
} from '@mantine/core'
import { ContextModalProps, modals } from '@mantine/modals'
import { useMediaQuery } from '@mantine/hooks'
import { IconTrash, IconUsers, IconX } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useTranslations } from 'next-intl'
import { MOBILE_QUERY } from '@/providers/SidebarProvider'

type ShareListProps = {
  listId: string
}

export default function ShareList({ context, id, innerProps }: ContextModalProps<ShareListProps>) {
  const t = useTranslations('ShareList')
  const listId = innerProps?.listId
  const theme = useMantineTheme()
  // Modals render outside SidebarProvider, so read the breakpoint directly.
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const [shareWithEmail, setShareWithEmail] = useState('')
  const [role, setRole] = useState<string | null>('viewer')

  const shareList = useShareList()
  const deleteMember = useDeleteListMember()
  const changeRole = useChangeListMemberRole()

  const { data: listResponse } = useListById(listId)
  const list = listResponse?.data

  const isValidEmail = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(shareWithEmail)
  }, [shareWithEmail])

  const members = useMemo(() => {
    if (!list) return []
    return list.members
      .filter(member => member.role !== 'owner')
      .sort((a, b) => dayjs(a.joinedAt).diff(dayjs(b.joinedAt)))
  }, [list])

  const handleShare = useCallback(() => {
    if (!listId || !isValidEmail) return

    shareList.mutate(
      { listId, shareWithEmail, role: role as 'editor' | 'viewer' },
      { onSuccess: () => setShareWithEmail('') }
    )
  }, [listId, isValidEmail, shareList, shareWithEmail, role])

  const handleConfirmDeleteMember = useCallback(
    (memberId: string, label: string) => () => {
      modals.openConfirmModal({
        fullScreen: false,
        title: t('confirmDelete.title'),
        children: (
          <Text size="sm">
            {t.rich('confirmDelete.message', {
              label: label,
              strong: chunks => <strong>{chunks}</strong>
            })}
          </Text>
        ),
        labels: {
          confirm: t('confirmDelete.confirm'),
          cancel: t('confirmDelete.cancel')
        },
        confirmProps: { color: 'red' },
        onConfirm: () => {
          if (!listId) return
          deleteMember.mutate({ listId, memberId })
        }
      })
    },
    [deleteMember, listId, t]
  )

  if (!listId) {
    return (
      <Container>
        <Text c="red">{t('errors.noListId')}</Text>
      </Container>
    )
  }

  return (
    <Stack gap="lg">
      {/* Header del Modale */}
      <Group justify="space-between" align="center">
        <Title order={3}>{t('title')}</Title>
        <ActionIcon variant="subtle" color="gray" onClick={() => context.closeModal(id)}>
          <IconX size={18} />
        </ActionIcon>
      </Group>

      {/* Form di Condivisione */}
      {/* Stacked on phones: email, role and button don't fit on one row */}
      <Flex
        gap="sm"
        direction={{ base: 'column', sm: 'row' }}
        align={{ base: 'stretch', sm: 'flex-end' }}
      >
        <TextInput
          style={{ flex: 1 }}
          label={t('fields.emailLabel')}
          placeholder={t('fields.emailPlaceholder')}
          value={shareWithEmail}
          onChange={e => setShareWithEmail(e.currentTarget.value)}
          onKeyDown={e => e.key === 'Enter' && handleShare()}
        />

        <div>
          <Text size="sm" fw={600} mb={4}>
            {t('fields.roleLabel')}
          </Text>
          <SegmentedControl
            fullWidth={isMobile}
            value={role ?? 'viewer'}
            onChange={setRole}
            data={[
              { value: 'editor', label: t('roles.editor') },
              { value: 'viewer', label: t('roles.viewer') }
            ]}
          />
        </div>

        <Button loading={shareList.isPending} disabled={!isValidEmail} onClick={handleShare}>
          {t('actions.share')}
        </Button>
      </Flex>

      <Divider
        label={
          <Group gap={6}>
            <IconUsers size={14} />
            <Text size="sm" fw={500}>
              {t('members.title')}
            </Text>
            <Badge size="sm" variant="light" circle>
              {members.length}
            </Badge>
          </Group>
        }
        labelPosition="left"
      />

      {/* Lista Membri */}
      <Stack gap={4}>
        {members.length ? (
          members.map(member => {
            const label = member.name ?? member.email
            const isRemoving =
              deleteMember.isPending && deleteMember.variables?.memberId === member.id

            return (
              <Group
                key={member.id}
                justify="space-between"
                align="center"
                py={6}
                px={8}
                style={{
                  borderRadius: theme.radius.sm,
                  opacity: isRemoving ? 0.5 : 1,
                  transition: 'background-color 120ms ease, opacity 120ms ease'
                }}
                className="share-list-row"
                wrap="nowrap"
              >
                <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <Avatar radius="xl" color={theme.primaryColor} src={member.avatar}>
                    {!member.avatar && label.charAt(0).toUpperCase()}
                  </Avatar>

                  <div style={{ minWidth: 0 }}>
                    <Text size="sm" fw={500} truncate>
                      {label}
                    </Text>
                    <Text size="xs" c="dimmed" truncate>
                      {member.email}
                    </Text>
                  </div>
                </Group>

                <Group gap={6} wrap="nowrap">
                  <SegmentedControl
                    size="xs"
                    value={member.role}
                    onChange={newRole => {
                      if (!listId) return
                      changeRole.mutate({
                        listId,
                        memberId: member.id,
                        role: newRole as 'editor' | 'viewer'
                      })
                    }}
                    data={[
                      { value: 'editor', label: t('roles.editor') },
                      { value: 'viewer', label: t('roles.viewer') }
                    ]}
                  />

                  <Tooltip label={t('actions.removeMember')} withArrow>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      loading={isRemoving}
                      onClick={handleConfirmDeleteMember(member.id, label)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            )
          })
        ) : (
          <Stack align="center" gap={4} py="md">
            <IconUsers size={28} color={theme.colors.gray[4]} />
            <Text c="dimmed" size="sm" ta="center">
              {t('members.empty')}
            </Text>
          </Stack>
        )}
      </Stack>

      <style jsx>{`
        @media (hover: hover) {
          .share-list-row:hover {
            background-color: light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6));
          }
        }
      `}</style>
    </Stack>
  )
}