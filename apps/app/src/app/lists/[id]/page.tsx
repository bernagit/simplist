'use client'

import { useParams } from 'next/navigation'
import { useListById, useUpdateList } from '@/queries/lists'
import {
  ActionIcon,
  Center,
  Collapse,
  Container,
  Group,
  Loader,
  Stack,
  Title,
  Text,
  Divider,
  ScrollArea,
  Box
} from '@mantine/core'
import { EditableTitle } from '@/components/list/EditableText'
import AddTask from '@/components/list/AddTask'
import { CreateTaskInput } from '@/models/task'
import { useCreateTask, useUpdateTask } from '@/queries/task'
import TaskList from '@/components/task/TaskList'
import { useEffect, useMemo, useRef, useState } from 'react'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import AddSection from '@/components/list/AddSection'
import { useCreateSection } from '@/queries/section'
import { useTopbar } from '@/providers/TopbarProvider'
import { useMe } from '@/queries/auth'

export default function Page() {
  const params = useParams()
  const lastCrossedRef = useRef<boolean>(false)
  const { setTitle, setDescription, setShowTitle, showTitle: showTopbarTitle } = useTopbar()

  const { data, isLoading } = useListById(params.id as string)
  const [sectionExpanded, setSectionExpanded] = useState<Record<string, boolean>>({})
  const updateList = useUpdateList()
  const createTask = useCreateTask()
  const createSection = useCreateSection()
  const updateTask = useUpdateTask()
  const { data: me } = useMe()

  const list = data?.data

  const canEdit = useMemo(() => {
    if (!list) return false
    // check if the user is the owner or has edit permissions
    const member = list.members.find(m => m.userId === me?.id)
    return member ? member.role === 'owner' || member.role === 'editor' : false
  }, [list, me])

  const orderedSections = useMemo(() => {
    if (!list) return []
    return [...list.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [list])

  const handleSaveTitle = async (newTitle: string) => {
    if (!list) return

    await updateList.mutateAsync({
      id: list.id,
      title: newTitle
    })
  }

  const handleAddTask = async (task: CreateTaskInput) => {
    await createTask.mutateAsync(task)
  }

  const handleAddSection = async (listId: string, title: string, order: number | undefined) => {
    await createSection.mutateAsync({ listId, title, order })
  }

  const handleUpdateTask = async (taskId: string, updates: Partial<CreateTaskInput>) => {
    if (!list) return
    await updateTask.mutateAsync({ taskId, listId: list.id, updates })
  }

  const handleScroll = ({ y }: { y: number }) => {
    const HIDE_THRESHOLD = 25
    const SHOW_THRESHOLD = 15

    let isPastThreshold = lastCrossedRef.current

    if (y > HIDE_THRESHOLD) {
      isPastThreshold = true
    } else if (y < SHOW_THRESHOLD) {
      isPastThreshold = false
    }

    if (isPastThreshold !== lastCrossedRef.current) {
      lastCrossedRef.current = isPastThreshold

      if (isPastThreshold && list?.title) {
        setTitle(list.title)
        setDescription(list.description ?? undefined)
        setShowTitle(true)
      } else {
        setShowTitle(false)
        setTitle(undefined)
        setDescription(undefined)
      }
    }
  }

  useEffect(() => {
    if (lastCrossedRef.current && list?.title) {
      setTitle(list.title)
    }
  }, [list?.title, setTitle])

  if (!list && !isLoading) return null

  if (isLoading && !list) {
    return (
      <Center>
        <Loader size="xl" />
      </Center>
    )
  } else if (!list) {
    return (
      <Center>
        <Title order={2}>List not found</Title>
      </Center>
    )
  }

  return (
    <ScrollArea h="100%" type="auto" scrollbars="y" onScrollPositionChange={handleScroll}>
      <Container>
        <Stack>
          <Box
            style={{
              transition: 'opacity 400ms ease, transform 400ms ease',
              opacity: showTopbarTitle ? 0 : 1,
              transform: showTopbarTitle ? 'translateY(-20px)' : 'translateY(0)',
              visibility: showTopbarTitle ? 'hidden' : 'visible'
            }}
          >
            <EditableTitle onSave={handleSaveTitle} value={list.title} />
            {list.description && (
              <Text ml={8} size="sm" c="dimmed">
                {list.description}
              </Text>
            )}
          </Box>
          {orderedSections.length > 0 && (
            <Stack gap={'xs'}>
              {orderedSections.map((section, index) => {
                if (section.id === list.defaultSectionId) {
                  return (
                    <div key={section.id}>
                      <TaskList
                        title={list.title}
                        data={list.tasks.filter(task => task.sectionId === list.defaultSectionId)}
                        canEdit={canEdit}
                        onUpdate={handleUpdateTask}
                      />
                      {canEdit && (
                        <AddTask
                          ml={38}
                          listId={list.id}
                          sectionId={list.defaultSectionId}
                          onSave={handleAddTask}
                        />
                      )}
                      {canEdit && index === orderedSections.length - 1 && (
                        <AddSection
                          order={2}
                          listId={list.id}
                          key={section.id}
                          onSave={handleAddSection}
                        />
                      )}
                    </div>
                  )
                } else {
                  return (
                    <div key={section.id}>
                      <Group gap={4} align="center">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          onClick={() => {
                            setSectionExpanded(prev => ({
                              ...prev,
                              [section.id]: !prev[section.id]
                            }))
                          }}
                        >
                          {(sectionExpanded[section.id] ?? true) ? (
                            <IconChevronDown />
                          ) : (
                            <IconChevronRight />
                          )}
                        </ActionIcon>
                        <Title m={0} mt={4} order={4}>
                          {section.title}
                        </Title>
                        <Text size="sm" c="gray" ml={4}>
                          ({list.tasks.filter(task => task.sectionId === section.id).length})
                        </Text>
                      </Group>
                      <Divider ml={28} mr={8} />
                      <Collapse expanded={sectionExpanded[section.id] ?? true}>
                        <TaskList
                          canEdit={canEdit}
                          title={`${list.title} / ${section.title}`}
                          data={list.tasks.filter(task => task.sectionId === section.id)}
                          onUpdate={handleUpdateTask}
                        />
                        {canEdit && (
                          <AddTask
                            ml={38}
                            listId={list.id}
                            sectionId={section.id}
                            onSave={handleAddTask}
                          />
                        )}
                      </Collapse>
                      {canEdit && index === orderedSections.length - 1 && (
                        <AddSection
                          order={section.order}
                          listId={list.id}
                          key={section.id}
                          onSave={handleAddSection}
                        />
                      )}
                    </div>
                  )
                }
              })}
            </Stack>
          )}
        </Stack>
      </Container>
    </ScrollArea>
  )
}
