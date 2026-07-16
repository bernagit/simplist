'use client'

import { Group, Text } from '@mantine/core'
import BreadcrumbLink from './BreadcrumbLink'

type TaskBreadcrumbProps = {
  listTitle: string
  sectionTitle?: string
  onOpenList: () => void
  onOpenSection?: () => void
}

export default function TaskBreadcrumb({
  listTitle,
  sectionTitle,
  onOpenList,
  onOpenSection
}: TaskBreadcrumbProps) {
  const showSection = sectionTitle && sectionTitle !== 'DEFAULT' && onOpenSection
  return (
    <Group gap={6}>
      <BreadcrumbLink onClick={onOpenList}>{listTitle}</BreadcrumbLink>

      {showSection && (
        <>
          <Text c="dimmed">/</Text>
          <BreadcrumbLink onClick={onOpenSection}>{sectionTitle}</BreadcrumbLink>
        </>
      )}
    </Group>
  )
}