'use client'

import { useSidebar } from '@/providers/SidebarProvider'
import { Button, Divider, Group, Stack, Text, TextInput } from '@mantine/core'
import { useCallback, useState } from 'react'

type AddSectionProps = {
  listId: string
  newOrder?: number | undefined
  onSave?: (listId: string, sectionTitle: string, order?: number) => Promise<void> | void
}

export default function AddSection({ listId, newOrder, onSave }: AddSectionProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const { isMobile } = useSidebar()

  const [sectionTitle, setSectionTitle] = useState('')

  const handleSave = useCallback(async () => {
    if (sectionTitle.trim().length === 0) return

    if (onSave) {
      await onSave(listId, sectionTitle.trim(), newOrder)
    }
    setSectionTitle('')
    setIsClicked(false)
  }, [sectionTitle, onSave, newOrder, listId])

  if (!isClicked) {
    return (
      <Divider
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        label={
          <Text c="dimmed" size="sm">
            Add Section
          </Text>
        }
        style={{
          opacity: isMobile || isHovered ? 1 : 0,
          cursor: 'pointer',
          transition: 'opacity 150ms ease',
          marginTop: isMobile ? 16 : 8
        }}
        onClick={() => setIsClicked(true)}
      />
    )
  }

  return (
    <Stack gap={0} p={0} mt="md" ml={'lg'} w={'90%'}>
      <TextInput placeholder="Section Title" onChange={e => setSectionTitle(e.target.value)} />
      <Group justify="flex-end" mt="xs" pt="xs">
        <Button
          variant="subtle"
          color="gray"
          onClick={() => {
            setIsClicked(false)
            setSectionTitle('')
          }}
        >
          Cancel
        </Button>
        <Button disabled={sectionTitle.trim().length === 0} onClick={handleSave}>
          Add Section
        </Button>
      </Group>
    </Stack>
  )
}
