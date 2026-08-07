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
  Button,
  Container,
  Divider,
  Flex,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  useMantineTheme
} from '@mantine/core'
import { ContextModalProps, modals } from '@mantine/modals'
import { IconTrash } from '@tabler/icons-react'

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
    return list.members.filter(member => member.role !== 'owner')
  }, [list])

  const handleShare = useCallback(() => {
    if (!listId || !shareWithEmail) return

    shareList.mutate({
      listId,
      shareWithEmail,
      role: role as 'editor' | 'viewer'
    })
  }, [listId, shareWithEmail, role, shareList])

  const handleConfirmDeleteMember = useCallback(
    (memberId: string) => () => {
      modals.openConfirmModal({
        title: 'Confirm Remove Member',
        children: <Text size="sm">Are you sure you want to remove this member from the list?</Text>,
        labels: {
          confirm: 'Remove',
          cancel: 'Cancel'
        },
        confirmProps: {
          color: 'red'
        },
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
      <Flex gap="md" align="flex-end">
        <TextInput
          style={{ flex: 1 }}
          label="Email"
          placeholder="Enter email"
          value={shareWithEmail}
          onChange={e => setShareWithEmail(e.currentTarget.value)}
        />

        <Select
          w={140}
          label="Role"
          value={role}
          onChange={setRole}
          data={[
            { value: 'editor', label: 'Editor' },
            { value: 'viewer', label: 'Viewer' }
          ]}
          comboboxProps={{ withinPortal: false }}
        />

        <Button mb={1} disabled={!shareWithEmail} onClick={handleShare}>
          Share
        </Button>
      </Flex>

      <Divider label={`Members (${members.length})`} />

      <Stack gap="sm">
        {members.length ? (
          members.map((member, index) => (
            <div key={member.id}>
              <Group justify="space-between" align="center">
                <Group>
                  <Avatar radius="xl" color={theme.primaryColor} src={member.avatar}>
                    {!member.avatar && (member.name ?? member.email)?.charAt(0).toUpperCase()}
                  </Avatar>

                  <div>
                    <Text>{member.name ?? member.email}</Text>

                    <Text size="sm" c="dimmed">
                      {member.email}
                    </Text>
                  </div>
                </Group>

                <Group gap={8}>
                  <Select
                    size="sm"
                    w={120}
                    value={member.role}
                    data={[
                      { value: 'editor', label: 'Editor' },
                      { value: 'viewer', label: 'Viewer' }
                    ]}
                    onChange={newRole => {
                      if (!listId || !newRole) return
                      changeRole.mutate({
                        listId,
                        memberId: member.id,
                        role: newRole as 'editor' | 'viewer'
                      })
                    }}
                    comboboxProps={{ withinPortal: false }}
                  />

                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={handleConfirmDeleteMember(member.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>

              {index < members.length - 1 && <Divider mt="sm" />}
            </div>
          ))
        ) : (
          <Text c="dimmed" ta="center">
            This list hasn&apos;t been shared with anyone yet.
          </Text>
        )}
      </Stack>
    </Stack>
  )
}
