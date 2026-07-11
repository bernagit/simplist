'use client'

import {
  ActionIcon,
  Center,
  Collapse,
  Group,
  Popover,
  RingProgress,
  Text,
  useMantineTheme
} from '@mantine/core'
import { IconChevronDown, IconChevronRight, IconDots } from '@tabler/icons-react'
import { EditableTitle } from './EditableText'
import { useState } from 'react'
import { Section } from '@/models/section'
import { useUpdateSection } from '@/queries/section'
import { getHTMLSectionId } from '@/utils/misc'

type SectionPanelProps = {
  section: Section
  totalTasksCount: number
  completedTasksCount: number
  canEdit: boolean
  children: React.ReactNode
}

export default function SectionPanel({
  section,
  totalTasksCount,
  completedTasksCount,
  canEdit,
  children
}: SectionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const theme = useMantineTheme()

  const updateSection = useUpdateSection()
  const handleUpdateSection = async (sectionId: string, newTitle: string) => {
    await updateSection.mutateAsync({
      listId: section.listId,
      sectionId,
      title: newTitle,
      order: undefined
    })
  }

  return (
    <>
      <Group gap={4} align="center" id={getHTMLSectionId(section.id)} mb={4}>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={() => {
            setIsExpanded(!isExpanded)
          }}
        >
          {isExpanded ? <IconChevronDown /> : <IconChevronRight />}
        </ActionIcon>
        {/* <Text size="sm" c="gray" ml={2} mt={4}>
                            ({list.tasks.filter(task => task.sectionId === section.id).length})
                          </Text> */}
        <RingProgress
          size={30}
          thickness={2}
          sections={[
            {
              value: totalTasksCount === 0 ? 100 : (completedTasksCount / totalTasksCount) * 100,
              color: theme.colors.green[6]
            }
          ]}
          label={
            <Center mt={2}>
              <Text size="xs" c="dimmed">
                {totalTasksCount}
              </Text>
            </Center>
          }
        />
        <Group justify="space-between" flex={1} wrap="nowrap">
          <EditableTitle
            canEdit={canEdit}
            order={4}
            value={section.title}
            onSave={newTitle => {
              handleUpdateSection(section.id, newTitle)
            }}
          />
          <Popover>
            <Popover.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
                <IconDots />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="sm" c="dimmed">
                Section actions will go here
              </Text>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>
      <Collapse expanded={isExpanded}>{children}</Collapse>
    </>
  )
}
