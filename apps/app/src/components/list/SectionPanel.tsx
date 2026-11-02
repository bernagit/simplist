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
import {
  IconChevronDown,
  IconChevronRight,
  IconDots,
  IconGripVertical,
  IconTrash
} from '@tabler/icons-react'
import { EditableTitle } from './EditableText'
import { useState } from 'react'
import { Section } from '@/models/section'
import { useDeleteSection, useUpdateSection } from '@/queries/section'
import { getHTMLSectionId } from '@/utils/misc'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslations } from 'next-intl'
import { useSidebar } from '@/providers/SidebarProvider'

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
  const t = useTranslations('SectionPanel')
  const [isExpanded, setIsExpanded] = useState(true)
  const [hovered, setHovered] = useState(false)
  const { isMobile } = useSidebar()
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
      <Group
        gap={9}
        align="center"
        id={getHTMLSectionId(section.id)}
        mb={4}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {canEdit && (
          // Only the grip starts a drag, so swiping on the header still scrolls the page.
          <ActionIcon
            {...attributes}
            {...listeners}
            variant="transparent"
            color="gray"
            size="sm"
            aria-label={t('dragSection')}
            style={{
              opacity: isMobile || hovered || isDragging ? 1 : 0,
              cursor: 'grab',
              transition: 'opacity 120ms',
              touchAction: 'none'
            }}
          >
            <IconGripVertical size={18} />
          </ActionIcon>
        )}
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
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
          <EditableTitle
            canEdit={canEdit}
            order={4}
            value={section.title}
            onSave={(newTitle) => handleUpdateSection(section.id, newTitle)}
          />
          <Menu>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
                <IconDots />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconTrash size={16} />}
                color="red"
                onClick={() => handleDeleteSection(section.id)}
              >
                {t('deleteSection')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
      <Collapse expanded={isExpanded}>{children}</Collapse>
    </Box>
  )
}