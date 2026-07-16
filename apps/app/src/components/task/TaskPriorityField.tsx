'use client'

import { Box, Button, Group, Popover, Stack, Text } from '@mantine/core'
import { IconFlag } from '@tabler/icons-react'
import { getPriorityColor } from '@/utils/color'
import { PRIORITY_OPTIONS } from '@/utils/constants'
import HoverableBox from './HoverableBox'

type TaskPriorityFieldProps = {
  priority: string | null
  canEdit?: boolean
  onChange: (priority: string | null) => void
}

export default function TaskPriorityField({ priority, canEdit, onChange }: TaskPriorityFieldProps) {
  const color = getPriorityColor(priority)
  const label = priority
    ? (PRIORITY_OPTIONS.find(option => option.value === priority)?.label ?? 'Priority')
    : 'Priority'

  return (
    <Popover disabled={!canEdit} position="bottom-start" shadow="md" zIndex={500}>
      <Popover.Target>
        <HoverableBox disabled={!canEdit}>
          <Group flex={1} justify="space-between">
            <Group align="flex-start">
              <IconFlag size={20} color={color} />
              <Text size="sm" c="dimmed">
                {label}
              </Text>
            </Group>
          </Group>
        </HoverableBox>
      </Popover.Target>

      <Popover.Dropdown>
        <Stack gap={0} p={0}>
          {PRIORITY_OPTIONS.map(option => (
            <Button
              key={option.value}
              variant="subtle"
              color="gray"
              onClick={() => canEdit && onChange(option.value)}
              leftSection={
                <Box>
                  <IconFlag size={16} color={getPriorityColor(option.value)} />
                </Box>
              }
              styles={{
                root: { justifyContent: 'flex-start', paddingLeft: 8, paddingRight: 8, borderRadius: 0 },
                inner: { justifyContent: 'flex-start' }
              }}
            >
              {option.label}
            </Button>
          ))}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}