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
  Tooltip,
  useMantineTheme
} from '@mantine/core'
import { ContextModalProps, modals } from '@mantine/modals'
import { IconTrash, IconUsers } from '@tabler/icons-react'
import dayjs from 'dayjs'

type ShareListProps = {
  listId: string
}

export default function ShareList({ innerProps }: ContextModalProps<ShareListProps>) {
  const listId = innerProps?.listId
  const theme = useMantineTheme()
  const [shareWithEmail, setShareWithEmail] = useState('')
  const [role, setRole] = useState<string | null>('viewer')

  const shareList = useShareList()
  const deleteMember = useDeleteListMember()
  const changeRole = useChangeListMemberRole()

  const { data: listResponse } = useListById(listId)
  const list = listResponse?.data

  const members = useMemo(() => {
    if (!list) return []
    return list.members.filter(member => member.role !== 'owner').sort((a, b) => dayjs(a.joinedAt).diff(dayjs(b.joinedAt)))
  }, [list])

  const handleShare = useCallback(() => {
    if (!listId || !shareWithEmail) return

    shareList.mutate(
      { listId, shareWithEmail, role: role as 'editor' | 'viewer' },
      { onSuccess: () => setShareWithEmail('') }
    )
  }, [listId, shareWithEmail, role, shareList])

  const handleConfirmDeleteMember = useCallback(
    (memberId: string, label: string) => () => {
      modals.openConfirmModal({
        title: 'Remove member',
        children: (
          <Text size="sm">
            Remove<strong>{' ' + label + ' '}</strong>from this list? They&apos;ll lose access immediately.
          </Text>
        ),
        labels: { confirm: 'Remove', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        onConfirm: () => {
          if (!listId) return
          deleteMember.mutate({ listId, memberId })
        }
      })
    },
    [deleteMember, listId]
  )

  if (!listId) {
    return (
      <Container>
        <Text c="red">Error: No list ID provided.</Text>
      </Container>
    )
  }

  return (
    <Stack gap="lg">
      <Flex gap="sm" align="flex-end">
        <TextInput
          style={{ flex: 1 }}
          label="Email"
          placeholder="name@example.com"
          value={shareWithEmail}
          onChange={e => setShareWithEmail(e.currentTarget.value)}
          onKeyDown={e => e.key === 'Enter' && handleShare()}
        />

        <div>
          <Text size="sm" fw={500} mb={4}>
            Role
          </Text>
          <SegmentedControl
            value={role ?? 'viewer'}
            onChange={setRole}
            data={[
              { value: 'editor', label: 'Editor' },
              { value: 'viewer', label: 'Viewer' }
            ]}
          />
        </div>

        <Button loading={shareList.isPending} disabled={!shareWithEmail} onClick={handleShare}>
          Share
        </Button>
      </Flex>

      <Divider
        label={
          <Group gap={6}>
            <IconUsers size={14} />
            <Text size="sm" fw={500}>
              Members
            </Text>
            <Badge size="sm" variant="light" circle>
              {members.length}
            </Badge>
          </Group>
        }
        labelPosition="left"
      />

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
              >
                <Group gap="sm" wrap="nowrap">
                  <Avatar radius="xl" color={theme.primaryColor} src={member.avatar}>
                    {!member.avatar && label.charAt(0).toUpperCase()}
                  </Avatar>

                  <div>
                    <Text size="sm" fw={500} lineClamp={1}>
                      {label}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
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
                      { value: 'editor', label: 'Editor' },
                      { value: 'viewer', label: 'Viewer' }
                    ]}
                  />

                  <Tooltip label="Remove member" withArrow>
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
              This list hasn&apos;t been shared with anyone yet.
            </Text>
          </Stack>
        )}
      </Stack>

      <style jsx>{`
        .share-list-row:hover {
          background-color: ${theme.colors.gray[0]};
        }
      `}</style>
    </Stack>
  )
}