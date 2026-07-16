import { ReactNode } from 'react'
import { Group, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconList } from '@tabler/icons-react'
import { Task } from '@/models/task'

export function editTaskModal(
  task: Task,
  isMobile: boolean,
  canEdit?: boolean
) {
  const title: ReactNode = (
    <Group gap="xs" align="center">
      <IconList size={18} stroke={1.8} />
      <Text fw={600}>{task.title}</Text>
    </Group>
  )

  modals.openContextModal({
    modal: 'editTask',
    title,
    fullScreen: isMobile,
    size: 'xl',
    padding: 'lg',
    innerProps: {
      task,
      canEdit,
    },
  })
}