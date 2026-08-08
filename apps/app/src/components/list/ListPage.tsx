'use client'

import { useParams } from 'next/navigation'
import { useListById, useUpdateList } from '@/queries/lists'
import {
  Center,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  Box,
  ThemeIcon,
  Tooltip
} from '@mantine/core'
import { EditableTitle } from '@/components/list/EditableText'
import AddTask from '@/components/list/AddTask'
import { CreateTaskInput, Task } from '@/models/task'
import { useCreateTask, useReorderTasks } from '@/queries/task'
import TaskList from '@/components/task/TaskList'
import { useEffect, useMemo, useRef, useState } from 'react'
import { IconLock } from '@tabler/icons-react'
import AddSection from '@/components/list/AddSection'
import { useCreateSection, useReorderSections } from '@/queries/section'
import { useTopbar } from '@/providers/TopbarProvider'
import { useMe } from '@/queries/auth'
import SectionPanel from './SectionPanel'
import {
  DndContext,
  DragOverEvent,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
  DragOverlay,
  useDroppable,
  TouchSensor
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove
} from '@dnd-kit/sortable'
import TaskRow from '@/components/task/TaskRow'
import { Section } from '@/models/section'
import ListMembers from './ListMembers'

function DefaultSectionDroppable({
  id,
  children
}: {
  id: string
  children: React.ReactNode
}) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <Box ref={setNodeRef} id={id}>
      {children}
    </Box>
  )
}

export default function ListPage() {
  const params = useParams()
  const lastCrossedRef = useRef<boolean>(false)
  const { setTitle, setDescription, setShowTitle, showTitle: showTopbarTitle } = useTopbar()
  const reorderTasksMutation = useReorderTasks()
  const reorderSectionsMutation = useReorderSections()

  const { data, isLoading } = useListById(params.id as string)
  const updateList = useUpdateList()
  const createTask = useCreateTask()
  const createSection = useCreateSection()
  const { data: me } = useMe()

  const list = data?.data

  const [prevList, setPrevList] = useState(list)
  const [sections, setSections] = useState<Section[]>(() =>
    list ? [...list.sections].sort((a, b) => (a.order ?? '').localeCompare(b.order ?? '')) : []
  )

  const [tasks, setTasks] = useState<Task[]>(() => list?.tasks || [])

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'section' | 'task' | null>(null)

  // Track initial section ID when drag starts to handle backend sync cleanly
  const dragSourceSectionRef = useRef<string | null>(null)

  if (list && list !== prevList) {
    setPrevList(list)
    setSections([...list.sections].sort((a, b) => (a.order ?? '').localeCompare(b.order ?? '')))
    setTasks(list.tasks || [])
  }

  const canEdit = useMemo(() => {
    if (!list) return false
    const member = list.members.find(m => m.userId === me?.id)
    return member ? member.role === 'owner' || member.role === 'editor' : false
  }, [list, me])

  const isOwner = useMemo(() => {
    if (!list) return false
    const member = list.members.find(m => m.userId === me?.id)
    return member ? member.role === 'owner' : false
  }, [list, me])

  const reorderableSections = useMemo(
    () => sections.filter(s => s.id !== list?.defaultSectionId),
    [sections, list?.defaultSectionId]
  )

  const reorderableSectionIds = useMemo(
    () => reorderableSections.map(s => s.id),
    [reorderableSections]
  )

  const defaultSection = useMemo(
    () => sections.find(s => s.id === list?.defaultSectionId),
    [sections, list?.defaultSectionId]
  )

  const defaultSectionTasks = useMemo(
    () => (defaultSection ? tasks.filter(t => t.sectionId === defaultSection.id) : []),
    [tasks, defaultSection]
  )

  const defaultSectionTaskIds = useMemo(
    () => defaultSectionTasks.map(t => t.id),
    [defaultSectionTasks]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const sectionIds = useMemo(() => sections.map(s => s.id), [sections])

  const customCollisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) return pointerCollisions
    return rectIntersection(args)
  }

  const handleReorderSections = async (
    movedSectionId: string,
    prevSectionId?: string,
    nextSectionId?: string
  ) => {
    try {
      if (!list) return
      await reorderSectionsMutation.mutateAsync({
        listId: list.id,
        sectionId: movedSectionId,
        prevSectionId,
        nextSectionId
      })
    } catch (error) {
      console.error('Failed to reorder sections:', error)
    }
  }

  const handleReorderTasks = async (
    movedTaskId: string,
    sourceSectionId: string,
    targetSectionId: string,
    prevTaskId?: string,
    nextTaskId?: string
  ) => {
    try {
      if (!list) return
      await reorderTasksMutation.mutateAsync({
        listId: list.id,
        sourceSectionId,
        targetSectionId,
        movedTaskId,
        prevTaskId,
        nextTaskId
      })
    } catch (error) {
      console.error('Failed to reorder tasks:', error)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const id = active.id as string

    if (sectionIds.includes(id)) {
      setActiveType('section')
    } else {
      setActiveType('task')
      const task = tasks.find(t => t.id === id)
      if (task) {
        dragSourceSectionRef.current = task.sectionId
      }
    }
    setActiveId(id)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || activeType !== 'task') return

    const activeTaskId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find(t => t.id === activeTaskId)
    if (!activeTask) return

    let targetSectionId: string | null = null

    if (sectionIds.includes(overId)) {
      targetSectionId = overId
    } else {
      const overTask = tasks.find(t => t.id === overId)
      if (overTask) targetSectionId = overTask.sectionId
    }

    if (!targetSectionId || activeTask.sectionId === targetSectionId) return

    setTasks(prev =>
      prev.map(t => (t.id === activeTaskId ? { ...t, sectionId: targetSectionId! } : t))
    )
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    const activeIdStr = active.id as string
    const overIdStr = over ? (over.id as string) : null

    setActiveId(null)
    setActiveType(null)

    if (!overIdStr) {
      dragSourceSectionRef.current = null
      return
    }

    // --- REORDER SECTIONS (LexoRank) ---
    if (activeType === 'section') {
      if (activeIdStr === list?.defaultSectionId || overIdStr === list?.defaultSectionId) {
        return
      }

      const oldIndex = sections.findIndex(s => s.id === activeIdStr)
      const newIndex = sections.findIndex(s => s.id === overIdStr)

      if (oldIndex !== -1 && newIndex !== -1) {
        // 1. Move array visually for immediate UI feedback
        const reorderedSections = arrayMove(sections, oldIndex, newIndex)
        setSections(reorderedSections)

        // 2. Derive adjacent section IDs
        const movedIndex = reorderedSections.findIndex(s => s.id === activeIdStr)
        const prevSectionId = reorderedSections[movedIndex - 1]?.id
        const nextSectionId = reorderedSections[movedIndex + 1]?.id

        // 3. Send neighboring section IDs to backend
        await handleReorderSections(activeIdStr, prevSectionId, nextSectionId)
      }
      return
    }

    // --- REORDER TASKS ---
    if (activeType === 'task') {
      const activeTask = tasks.find(t => t.id === activeIdStr)
      if (!activeTask) return

      const sourceSectionId = dragSourceSectionRef.current || activeTask.sectionId
      const targetSectionId = activeTask.sectionId

      const targetSectionTasks = tasks.filter(t => t.sectionId === targetSectionId)
      const oldIndex = targetSectionTasks.findIndex(t => t.id === activeIdStr)

      let newIndex = targetSectionTasks.findIndex(t => t.id === overIdStr)
      if (newIndex === -1) {
        newIndex = targetSectionTasks.length - 1
      }

      const reorderedSectionTasks = arrayMove(targetSectionTasks, oldIndex, newIndex)

      const movedIndex = reorderedSectionTasks.findIndex(t => t.id === activeIdStr)
      const prevTaskId = reorderedSectionTasks[movedIndex - 1]?.id
      const nextTaskId = reorderedSectionTasks[movedIndex + 1]?.id

      const reorderedSectionTaskIds = new Set(reorderedSectionTasks.map(t => t.id))
      const updatedTasks = [
        ...tasks.filter(t => !reorderedSectionTaskIds.has(t.id)),
        ...reorderedSectionTasks
      ]

      setTasks(updatedTasks)
      dragSourceSectionRef.current = null

      await handleReorderTasks(
        activeIdStr,
        sourceSectionId,
        targetSectionId,
        prevTaskId,
        nextTaskId
      )
    }
  }

  const handleSaveTitle = async (newTitle: string) => {
    if (!list || !isOwner) return
    await updateList.mutateAsync({ id: list.id, title: newTitle })
  }

  const handleAddTask = async (task: CreateTaskInput) => {
    await createTask.mutateAsync(task)
  }

  const handleAddSection = async (listId: string, title: string) => {
    await createSection.mutateAsync({ listId, title })
  }

  useEffect(() => {
    const container = document.getElementById('app-scroll-container')
    if (!container) return

    const onScroll = () => {
      const y = container.scrollTop
      const HIDE_THRESHOLD = 25
      const SHOW_THRESHOLD = 15

      let isPastThreshold = lastCrossedRef.current
      if (y > HIDE_THRESHOLD) isPastThreshold = true
      else if (y < SHOW_THRESHOLD) isPastThreshold = false

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

    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [list, setTitle, setDescription, setShowTitle])

  if (!list && !isLoading) return null
  if (isLoading || !list) {
    return (
      <Center>
        <Loader size="xl" />
      </Center>
    )
  }

  const activeTask = tasks.find(t => t.id === activeId)
  const activeSection = sections.find(s => s.id === activeId)

  return (
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
          <Group gap="xs" wrap="nowrap">
            <ListMembers members={list.members} />

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
        </Group>

        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <Stack gap={'xs'}>
            {defaultSection && (
              <DefaultSectionDroppable id={defaultSection.id}>
                <SortableContext
                  items={defaultSectionTaskIds}
                  strategy={verticalListSortingStrategy}
                >
                  <TaskList
                    data={defaultSectionTasks}
                    canEdit={canEdit}
                    sectionId={defaultSection.id}
                  />
                </SortableContext>
                {canEdit && (
                  <AddTask
                    ml={38}
                    listId={list.id}
                    sectionId={defaultSection.id}
                    onSave={handleAddTask}
                  />
                )}
              </DefaultSectionDroppable>
            )}

            <SortableContext items={reorderableSectionIds} strategy={verticalListSortingStrategy}>
              <Stack gap={'xs'}>
                {reorderableSections.map(section => {
                  const sectionTasks = tasks.filter(t => t.sectionId === section.id)
                  const sectionTaskIds = sectionTasks.map(t => t.id)
                  const completedTasksCount = sectionTasks.filter(t => t.completed).length
                  const totalTasksCount = sectionTasks.length

                  return (
                    <SectionPanel
                      key={section.id}
                      section={section}
                      totalTasksCount={totalTasksCount}
                      completedTasksCount={completedTasksCount}
                      canEdit={canEdit}
                    >
                      <SortableContext
                        items={sectionTaskIds}
                        strategy={verticalListSortingStrategy}
                      >
                        <TaskList
                          data={sectionTasks}
                          canEdit={canEdit}
                          sectionId={section.id}
                        />
                      </SortableContext>
                      {canEdit && (
                        <AddTask
                          ml={38}
                          listId={list.id}
                          sectionId={section.id}
                          onSave={handleAddTask}
                        />
                      )}
                    </SectionPanel>
                  )
                })}
              </Stack>
            </SortableContext>
          </Stack>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeType === 'task' && activeTask ? (
              <TaskRow task={activeTask} canEdit={false} />
            ) : activeType === 'section' && activeSection ? (
              <Box p="xs" bg="var(--mantine-color-body)" style={{ border: '1px solid gray', borderRadius: 8 }}>
                <Text fw={600}>{activeSection.title}</Text>
              </Box>
            ) : null}
          </DragOverlay>
        </DndContext>

        {canEdit && list && (
          <AddSection
            listId={list.id}
            onSave={handleAddSection}
          />
        )}
      </Stack>
    </Container>
  )
}