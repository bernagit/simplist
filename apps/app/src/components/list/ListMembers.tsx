'use client'

import { useState } from 'react'
import { ListMember } from '@/models/lists'
import { Avatar, Popover, Stack, Group, Text, UnstyledButton } from '@mantine/core'
import { useMe } from '@/queries/auth'
import { useTranslations } from 'next-intl'

const MAX_VISIBLE = 3

function initials(member: ListMember) {
  if (member.name) {
    return member.name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }
  return member.email[0]?.toUpperCase() ?? '?'
}

function MemberRow({ member }: { member: ListMember }) {
  const t = useTranslations('ListMembers')
  const { data: me } = useMe()
  const isMe = me?.id === member.userId

  const displayName = member.name ?? member.email
  const localizedRole = t.has(`roles.${member.role}`)
    ? t(`roles.${member.role}`)
    : member.role

  return (
    <Group gap="xs" wrap="nowrap">
      <Avatar src={member.avatar} radius="xl" size="sm">
        {!member.avatar && initials(member)}
      </Avatar>
      <Stack gap={0}>
        <Text size="sm">
          {displayName} {isMe && <Text component="span" c="dimmed" size="xs">{t('you')}</Text>}
        </Text>
        <Text size="xs" c="dimmed">
          {localizedRole}
        </Text>
      </Stack>
    </Group>
  )
}

export default function ListMembers({ members }: { members: ListMember[] }) {
  const [opened, setOpened] = useState(false)

  if (!members || members.length <= 1) return null

  const visible = members.slice(0, MAX_VISIBLE)
  const overflow = members.length - visible.length

  return (
    <Popover opened={opened} onChange={setOpened} withArrow shadow="md" position="bottom-end">
      <Popover.Target>
        <UnstyledButton onClick={() => setOpened(o => !o)}>
          {/* Nota: In Mantine v7 'spacing' accetta valori della scala Mantine (es. 'xs', 'sm', o numeri) */}
          <Avatar.Group spacing="xs">
            {visible.map(member => (
              <Avatar key={member.id} src={member.avatar} radius="xl" size="sm">
                {!member.avatar && initials(member)}
              </Avatar>
            ))}

            {overflow > 0 && (
              <Avatar radius="xl" size="sm">
                +{overflow}
              </Avatar>
            )}
          </Avatar.Group>
        </UnstyledButton>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap="xs">
          {members.map(member => (
            <MemberRow key={member.id} member={member} />
          ))}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}