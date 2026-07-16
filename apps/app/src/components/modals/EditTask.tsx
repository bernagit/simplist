'use client'

import { CreateTaskInput, PlannedTask } from '@/models/task'
import { getPriorityColor } from '@/utils/color'
import {
  Checkbox,
  Group,
  Stack,
  Title,
  Text,
  Button,
  TextInput,
  Textarea,
  Popover,
  Box,
  useComputedColorScheme,
  UnstyledButton
} from '@mantine/core'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { IconCalendar, IconFlag, IconX } from '@tabler/icons-react'
import { formatDate } from '@/utils/date'
import { DatePicker } from '@mantine/dates'
import { PRIORITY_OPTIONS } from '@/utils/constants'
import { useToggleTask, useUpdateTask } from '@/queries/task'
import { ContextModalProps } from '@mantine/modals'

export type NavigationCallbacks = {
  onOpenList: () => void
  onOpenSection?: () => void
}

type EditTaskProps = {
  task: PlannedTask
  canEdit: boolean | undefined
  navigation: NavigationCallbacks
}

export default function EditTask({ context, id, innerProps }: ContextModalProps<EditTaskProps>) {
  const colorScheme = useComputedColorScheme()
  const toggleTask = useToggleTask()
  const updateTask = useUpdateTask()
  const { task, canEdit, navigation } = innerProps
  const colorMemo = useMemo(() => getPriorityColor(task.priority), [task.priority])
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [selectedDate, setSelectedDate] = useState<string | null>(
    task.dueDate ? dayjs(task.dueDate).toISOString() : null
  )
  const shortDate = formatDate(selectedDate)
  const [selectedPriority, setSelectedPriority] = useState<string | null>(task.priority)
  const priorityLabel = selectedPriority
    ? (PRIORITY_OPTIONS.find(option => option.value === selectedPriority)?.label ?? 'Priority')
    : 'Priority'

  const [completed, setCompleted] = useState(task.completed)

  const handleToggle = async () => {
    const next = !completed

    setCompleted(next)
    try {
      await toggleTask.mutateAsync({
        listId: task.listId,
        taskId: task.id,
      })
    } catch {
      setCompleted(!next)
    }
  }

  const handleUpdateTask = async (taskId: string, updates: Partial<CreateTaskInput>) => {
    if (!task.listId) return
    await updateTask.mutateAsync({ taskId, listId: task.listId, updates })
  }

  const handlePrioritySelect = (priority: string | null) => {
    setSelectedPriority(priority)
    handleUpdateTask(task.id, { priority: priority ?? null })
  }

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date)

    handleUpdateTask(task.id, {
      dueDate: date ? new Date(date) : null
    })
  }

  const handleSaveEdit = async () => {
    await handleUpdateTask(task.id, {
      title,
      description
    })
    setIsEditing(false)
  }

  const handleCancelEdit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setTitle(task.title)
    setDescription(task.description ?? '')
    setIsEditing(false)
  }

  const handleNavigateToList = () => {
    navigation.onOpenList()
    context.closeModal(id)
  }

  const handleNavigateToSection = () => {
    if (navigation.onOpenSection) {
      navigation.onOpenSection()
      context.closeModal(id)
    }
  }

  return (
    <Stack
      py={0}
      h={'100%'}
    >
      <Group gap={6}>
        <UnstyledButton
          onClick={handleNavigateToList}
          style={{
            padding: '4px 8px',
            borderRadius: 6,
            transition: 'background-color 150ms ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Text size="sm" fw={600}>
            {task.listTitle}
          </Text>
        </UnstyledButton>

        {task.sectionTitle && task.sectionTitle !== 'DEFAULT' && (
          <>
            <Text c="dimmed">/</Text>

            <UnstyledButton
              onClick={handleNavigateToSection}
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                transition: 'background-color 150ms ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <Text size="sm" fw={600}>
                {task.sectionTitle}
              </Text>
            </UnstyledButton>
          </>
        )}
      </Group>
      <Group align="start">
        <Checkbox
          size="lg"
          radius="xl"
          checked={completed}
          mt={task.description ? 10 : 0}
          onChange={() => {
            handleToggle()
          }}
          disabled={!canEdit}
          color={colorMemo}
          styles={{
            root: {
              opacity: completed ? 0.6 : 1,
              transition: 'opacity 150ms ease'
            },
            input: {
              border: `1px solid ${colorMemo}`,
              backgroundColor: completed ? colorMemo : undefined
            }
          }}
        />
        <Stack
          flex={1}
          gap={4}
          style={{
            opacity: !isEditing && completed ? 0.6 : 1,
            transition: 'opacity 150ms ease',
            border: isEditing ? '1px solid var(--mantine-color-gray-4)' : undefined,
            borderRadius: 6,
            padding: isEditing ? 8 : 0
          }}
          onClick={() => canEdit && !completed && setIsEditing(true)}
        >
          {isEditing ? (
            <>
              <TextInput
                variant="unstyled"
                value={title}
                onChange={e => setTitle(e.currentTarget.value)}
                placeholder="Task name"
                styles={{
                  input: {
                    fontSize: 24,
                    fontWeight: 700
                  }
                }}
                autoFocus
              />

              <Textarea
                variant="unstyled"
                value={description}
                onChange={e => setDescription(e.currentTarget.value)}
                placeholder="Description"
                autosize
                minRows={2}
              />

              <Group justify="flex-end">
                <Button variant="subtle" color="gray" onClick={handleCancelEdit}>
                  Cancel
                </Button>

                <Button onClick={handleSaveEdit}>Save</Button>
              </Group>
            </>
          ) : (
            <>
              <Title order={3}>{title}</Title>

              {description && (
                <Text size="sm" c="dimmed">
                  {description}
                </Text>
              )}
            </>
          )}
        </Stack>
      </Group>
      <Popover disabled={!canEdit} position="bottom-start" shadow="md" zIndex={500}>
        <Popover.Target>
          <Box
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor =
                colorScheme === 'dark'
                  ? 'var(--mantine-color-dark-5)'
                  : 'var(--mantine-color-gray-2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            style={{
              borderRadius: 4,
              padding: 10,
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <Group flex={1} justify="space-between">
              <Group align="flex-start" style={{ height: 'var(--button-height-xs)' }}>
                <IconCalendar size={20} />
                <Text size="sm" c="dimmed">
                  {shortDate ?? 'No due date'}
                </Text>
              </Group>
              {selectedDate && (
                <Button
                  variant="subtle"
                  color="gray"
                  size="xs"
                  m={0}
                  p={0}
                  onClick={e => {
                    if (!canEdit) return
                    e.stopPropagation()
                    handleDateSelect(null)
                  }}
                >
                  <IconX size={16} />
                </Button>
              )}
            </Group>
          </Box>
        </Popover.Target>
        <Popover.Dropdown>
          <DatePicker highlightToday allowDeselect onChange={handleDateSelect} />
        </Popover.Dropdown>
      </Popover>
      <Popover disabled={!canEdit} position="bottom-start" shadow="md" zIndex={500}>
        <Popover.Target>
          <Box
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor =
                colorScheme === 'dark'
                  ? 'var(--mantine-color-dark-5)'
                  : 'var(--mantine-color-gray-2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            style={{
              borderRadius: 4,
              padding: 10,
              cursor: 'pointer',
              display: 'flex'
            }}
          >
            <Group flex={1} justify="space-between">
              <Group align="flex-start">
                <IconFlag size={20} color={colorMemo} />
                <Text size="sm" c="dimmed">
                  {priorityLabel}
                </Text>
              </Group>
            </Group>
          </Box>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap={0} p={0}>
            {PRIORITY_OPTIONS.map(option => (
              <Button
                key={option.value}
                variant="subtle"
                color="gray"
                onClick={() => {
                  if (!canEdit) return
                  handlePrioritySelect(option.value)
                }}
                leftSection={
                  <Box>
                    <IconFlag size={16} color={getPriorityColor(option.value)} />
                  </Box>
                }
                styles={{
                  root: {
                    justifyContent: 'flex-start',
                    paddingLeft: 8,
                    paddingRight: 8,
                    borderRadius: 0
                  },
                  inner: {
                    justifyContent: 'flex-start'
                  }
                }}
              >
                {option.label}
              </Button>
            ))}
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Stack>
  )
}
