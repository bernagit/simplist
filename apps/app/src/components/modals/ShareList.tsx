import { useDeleteListMember, useListById, useShareList } from '@/queries/lists'
import { ActionIcon, Avatar, Button, Container, Divider, Group, Select, Stack, Tabs, Text, TextInput } from '@mantine/core'
import { ContextModalProps, modals } from '@mantine/modals'
import { IconTrash } from '@tabler/icons-react'
import { useCallback, useMemo, useState } from 'react'

type ShareListProps = {
  listId: string
}

export default function ShareList({
  context,
  id,
  innerProps
}: ContextModalProps<ShareListProps>) {
  const listId = innerProps?.listId
  const [tabValue, setTabValue] = useState<string | null>('invite')
  const [shareWithEmail, setShareWithEmail] = useState<string>('')
  const [role, setRole] = useState<string | null>('viewer')
  const shareList = useShareList()
  const deleteMember = useDeleteListMember()

  const { data: listResponse } = useListById(listId)

  const list = listResponse?.data

  const members = useMemo(() => {
    if (!list) return []
    return list.members.filter((member) => member.role !== 'owner')
  }, [list])

  const handleShare = useCallback(() => {
    if (!listId || !shareWithEmail) return
    shareList.mutate({ listId, shareWithEmail, role: role as 'editor' | 'viewer' })
  }, [listId, shareWithEmail, shareList, role])

  const handleConfirmDeleteMember = useCallback(
    (memberId: string) => () => {
      modals.openConfirmModal({
        title: 'Confirm Remove Member',
        children: (
          <Text size="sm">
            Are you sure you want to remove this member from the list?
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
        <Text color="red">Error: No list ID provided.</Text>
      </Container>
    )
  }

  return (
    <Tabs value={tabValue} onChange={setTabValue} h={400} variant="pills">
      <Tabs.List>
        <Tabs.Tab value="invite">Invite</Tabs.Tab>
        <Tabs.Tab value="members">
          Members ({members.length})
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="invite" pt="md">
        <Stack>
          <TextInput
            label="Email"
            placeholder="Enter email to share with"
            value={shareWithEmail}
            onChange={(event) =>
              setShareWithEmail(event.currentTarget.value)
            }
          />

          <Select
            label="Role"
            data={[
              { value: 'editor', label: 'Editor' },
              { value: 'viewer', label: 'Viewer' }
            ]}
            value={role}
            onChange={setRole}
            comboboxProps={{ withinPortal: false }}
          />

          <Group justify="flex-end">
            <Button
              variant="outline"
              color="gray"
              onClick={() => context.closeModal(id)}
            >
              Cancel
            </Button>

            <Button
              disabled={!shareWithEmail || !listId}
              onClick={handleShare}
            >
              Share
            </Button>
          </Group>
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="members" pt="md">
        <Stack gap="sm">
          {members.length ? (
            members.map((member) => (
              <div key={member.id}>
                <Group justify="space-between" align="center">
                  <Group>
                    <Avatar radius="xl">
                      {(member.name ?? member.email)?.charAt(0).toUpperCase()}
                    </Avatar>

                    <div>
                      <Text>
                        {member.name ?? member.email}
                      </Text>

                      <Text size="sm" c="dimmed">
                        {member.email}
                      </Text>
                    </div>
                  </Group>

                  {member.role === 'owner' ? (
                    <Text size="sm" c="dimmed">
                      Owner
                    </Text>
                  ) : (
                    <Group gap={8} align="center">
                      <Select
                        size="sm"
                        w={120}
                        value={member.role}
                        data={[
                          { value: 'editor', label: 'Editor' },
                          { value: 'viewer', label: 'Viewer' }
                        ]}
                        comboboxProps={{ withinPortal: false }}
                      />
                      <ActionIcon color="red" onClick={handleConfirmDeleteMember(member.id)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  )}
                </Group>

                <Divider mt="sm" />
              </div>
            ))
          ) : (
            <Text c="dimmed" ta="center">
              This list hasn&apos;t been shared with anyone yet.
            </Text>
          )}
        </Stack>
      </Tabs.Panel>
    </Tabs>
  )
}
