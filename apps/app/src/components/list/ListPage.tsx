'use client'

import { useParams } from 'next/navigation'
import { useListById, useUpdateList } from '@/queries/lists'
import {
  Center,
  Container,
  Group,
  Loader,
  Stack,
  Title,
  Text,
  Divider,
  ScrollArea,
  Box,
  ThemeIcon,
  Tooltip
} from '@mantine/core'
import { EditableTitle } from '@/components/list/EditableText'
import AddTask from '@/components/list/AddTask'
import { CreateTaskInput } from '@/models/task'
import { useCreateTask, useReorderTasks } from '@/queries/task'
import TaskList from '@/components/task/TaskList'
import { useEffect, useMemo, useRef } from 'react'
import { IconLock } from '@tabler/icons-react'
import AddSection from '@/components/list/AddSection'
import { useCreateSection } from '@/queries/section'
import { useTopbar } from '@/providers/TopbarProvider'
import { useMe } from '@/queries/auth'
import SectionPanel from './SectionPanel'

export default function ListPage() {
  const params = useParams()
  const lastCrossedRef = useRef<boolean>(false)
  const { setTitle, setDescription, setShowTitle, showTitle: showTopbarTitle } = useTopbar()

  const { data, isLoading } = useListById(params.id as string)
  const updateList = useUpdateList()
  const createTask = useCreateTask()
  const createSection = useCreateSection()
  const reorderTasks = useReorderTasks()
  const { data: me } = useMe()

  const list = data?.data

  const canEdit = useMemo(() => {
    if (!list) return false
    // check if the user is the owner or has edit permissions
    const member = list.members.find(m => m.userId === me?.id)
    return member ? member.role === 'owner' || member.role === 'editor' : false
  }, [list, me])

  const isOwner = useMemo(() => {
    if (!list) return false
    const member = list.members.find(m => m.userId === me?.id)
    return member ? member.role === 'owner' : false
  }, [list, me])

  const orderedSections = useMemo(() => {
    if (!list) return []
    return [...list.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [list])

  const handleSaveTitle = async (newTitle: string) => {
    if (!list || !isOwner) return
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

  const handleReorderTasks = async (
    movedTaskId: string,
    targetTaskId: string,
    sectionId: string
  ) => {
    if (!list) return
    await reorderTasks.mutateAsync({ listId: list.id, sectionId, movedTaskId, targetTaskId })
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
    } else {
      setTitle(undefined)
    }
  }, [list?.title, setTitle])

  useEffect(() => {
    return () => {
      setTitle(undefined)
      setDescription(undefined)
      setShowTitle(false)
    }
  }, [setDescription, setShowTitle, setTitle])

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
          <Group justify="space-between" wrap="nowrap">
            <Box
              style={{
                transition: 'opacity 400ms ease, transform 400ms ease',
                opacity: showTopbarTitle ? 0 : 1,
                transform: showTopbarTitle ? 'translateY(-20px)' : 'translateY(0)',
                visibility: showTopbarTitle ? 'hidden' : 'visible'
              }}
            >
              <EditableTitle
                canEdit={isOwner}
                onSave={handleSaveTitle}
                value={list.title}
                order={2}
              />
              {list.description && (
                <Text ml={8} size="sm" c="dimmed">
                  {list.description}
                </Text>
              )}
            </Box>
            {!canEdit && (
              <Tooltip
                label="You don't have permission to edit this list"
                position="bottom"
                withArrow
                transitionProps={{ transition: 'pop', duration: 200 }}
              >
                <ThemeIcon variant="light" size={30}>
                  <IconLock size={18} />
                </ThemeIcon>
              </Tooltip>
            )}
          </Group>
          {orderedSections.length > 0 && (
            <Stack gap={'xs'}>
              {orderedSections.map((section, index) => {
                const sectionTasks = list.tasks.filter(task => task.sectionId === section.id)
                const isDefaultSection = section.id === list.defaultSectionId
                const completedTasksCount = sectionTasks.filter(task => task.completed).length
                const totalTasksCount = sectionTasks.length
                if (isDefaultSection) {
                  return (
                    <div key={section.id}>
                      <TaskList
                        data={sectionTasks}
                        canEdit={canEdit}
                        onReorder={handleReorderTasks}
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
                      <SectionPanel
                        section={section}
                        totalTasksCount={totalTasksCount}
                        completedTasksCount={completedTasksCount}
                        canEdit={canEdit}
                      >
                        <Divider ml={28} mr={8} />
                        <TaskList
                          canEdit={canEdit}
                          data={list.tasks.filter(task => task.sectionId === section.id)}
                          onReorder={handleReorderTasks}
                        />
                        {canEdit && (
                          <AddTask
                            ml={38}
                            listId={list.id}
                            sectionId={section.id}
                            onSave={handleAddTask}
                          />
                        )}
                      </SectionPanel>
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
