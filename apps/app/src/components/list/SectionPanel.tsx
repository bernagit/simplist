'use client'

import {
  ActionIcon,
  Center,
  Collapse,
  Group,
  Menu,
  RingProgress,
  useMantineTheme,
  Box,
  Text
} from '@mantine/core'
import { IconChevronDown, IconChevronRight, IconDots, IconTrash } from '@tabler/icons-react'
import { EditableTitle } from './EditableText'
import { useState } from 'react'
import { Section } from '@/models/section'
import { useDeleteSection, useUpdateSection } from '@/queries/section'
import { getHTMLSectionId } from '@/utils/misc'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
  const deleteSection = useDeleteSection()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled: !canEdit
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  }

  const hasNoTasks = totalTasksCount === 0
  const progress = hasNoTasks ? 0 : (completedTasksCount / totalTasksCount) * 100

  const handleDeleteSection = async (sectionId: string) => {
    await deleteSection.mutateAsync({
      listId: section.listId,
      sectionId
    })
  }

  const handleUpdateSection = async (sectionId: string, newTitle: string) => {
    await updateSection.mutateAsync({
      listId: section.listId,
      sectionId,
      title: newTitle,
    })
  }

  return (
    <Box ref={setNodeRef} style={style}>
      {/* Attach drag handle listeners directly to the section header Group */}
      <Group
        gap={9}
        align="center"
        id={getHTMLSectionId(section.id)}
        mb={4}
        style={{ cursor: canEdit ? 'grab' : 'default', userSelect: 'none' }}
        {...(canEdit ? { ...attributes, ...listeners } : {})}
      >
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={(e) => {
            e.stopPropagation() // Prevents drag activation when toggling collapse
            setIsExpanded(!isExpanded)
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {isExpanded ? <IconChevronDown /> : <IconChevronRight />}
        </ActionIcon>
        <RingProgress
          size={30}
          thickness={3}
          sections={[{ value: progress, color: theme.primaryColor }]}
          label={
            <Center>
              <Text size="10px" fw={500}>
                {totalTasksCount}
              </Text>
            </Center>
          }
        />
        <Group justify="space-between" flex={1} wrap="nowrap">
          <Box
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <EditableTitle
              canEdit={canEdit}
              order={4}
              value={section.title}
              onSave={(newTitle) => handleUpdateSection(section.id, newTitle)}
            />
          </Box>
          <Menu>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <IconDots />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconTrash size={16} />}
                color="red"
                onClick={() => handleDeleteSection(section.id)}
              >
                Delete Section
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
      <Collapse expanded={isExpanded}>{children}</Collapse>
    </Box>
  )
}