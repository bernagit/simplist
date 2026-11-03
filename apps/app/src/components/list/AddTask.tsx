'use client'

import { CreateTaskInput, EMPTY_TASK_PROPERTIES, TaskProperties } from '@/models/task'
import {
  Box,
  Button,
  Card,
  Group,
  Stack,
  Text,
  TextInput,
  useComputedColorScheme,
  useMantineTheme
} from '@mantine/core'
import { useHotkeys } from '@mantine/hooks'
import { IconCirclePlus, IconPlus } from '@tabler/icons-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TaskPropertiesEditor } from '../task/properties/TaskPropertiesEditor'
import { useTranslations } from 'next-intl'
import { useSidebar } from '@/providers/SidebarProvider'
import { useMouseHover } from '@/hooks/useMouseHover'

type AddTaskProps = {
  ml?: number
  listId: string
  sectionId: string
  onSave?: (task: CreateTaskInput) => Promise<void> | void
}

export default function AddTask({ ml, listId, sectionId, onSave }: AddTaskProps) {
  const t = useTranslations('AddTask')
  const colorScheme = useComputedColorScheme()
  const theme = useMantineTheme()
  const { isTouch } = useSidebar()
  const [isClicked, setIsClicked] = useState(false)
  const { hovered, hoverProps } = useMouseHover()
  const titleInputRef = useRef<HTMLInputElement | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [properties, setProperties] = useState<TaskProperties>(EMPTY_TASK_PROPERTIES)

  const clearInputs = () => {
    setTitle('')
    setDescription('')
    setProperties(EMPTY_TASK_PROPERTIES)
  }

  const handleSave = useCallback(async () => {
    if (title.trim().length === 0) return

    const task: CreateTaskInput = {
      listId: listId,
      sectionId: sectionId,
      title: title.trim(),
      description: description.trim() || null,
      ...properties
    }

    if (onSave) {
      await onSave(task)
    }

    clearInputs()
    // Mantiene l'input aperto dopo il salvataggio
    setIsClicked(true)
    requestAnimationFrame(() => {
      titleInputRef.current?.focus()
    })
  }, [title, listId, sectionId, description, properties, onSave])

  useHotkeys(
    [
      [
        'Escape',
        () => {
          clearInputs()
          setIsClicked(false)
        }
      ]
    ],
    [],
    true
  )

  useEffect(() => {
    if (isClicked) {
      requestAnimationFrame(() => {
        titleInputRef.current?.focus()
      })
    }
  }, [isClicked])

  if (!isClicked) {
    return (
      <Box
        onClick={() => setIsClicked(true)}
        {...hoverProps}
        ml={0}
        my={6}
        style={{
          width: '100%',
          cursor: 'pointer',
          borderRadius: 6,
          padding: '6px 8px',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 120ms ease',
          outline: hovered ? '1px solid var(--mantine-primary-color-filled)' : undefined,
          color: hovered ? theme.colors[theme.primaryColor]?.[8] : 'var(--mantine-color-dimmed)'
        }}
      >
        <Group gap={6} ml={ml ?? 0}>
          {!hovered ? <IconPlus size={16} /> : <IconCirclePlus size={16} />}

          <Text mt={4} size="sm" fw={500} c="inherit">
            {t('addTask')}
          </Text>
        </Group>
      </Box>
    )
  }

  return (
    <Card
      withBorder
      radius="md"
      p="xs"
      style={{
        borderColor:
          colorScheme === 'dark' ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'
      }}
      mt="xs"
      ml={{ base: 0, sm: 'lg' }}
      w={{ base: '100%', sm: '90%' }}
    >
      <form
        onSubmit={e => {
          e.preventDefault()
          handleSave()
        }}
      >
        <Stack gap={0} p={0}>
          <TextInput
            ref={titleInputRef}
            variant="unstyled"
            placeholder={t('titlePlaceholder')}
            value={title}
            onChange={e => setTitle(e.currentTarget.value)}
            styles={{
              root: {
                margin: 0
              },
              wrapper: {
                margin: 0
              },
              input: {
                height: 26,
                minHeight: 20,
                lineHeight: '26px',
                padding: 0,
                // >= 16px on touch devices, otherwise iOS zooms in on focus
                fontSize: isTouch ? 16 : 15,
                fontWeight: 600
              }
            }}
          />
          <TextInput
            variant="unstyled"
            placeholder={t('descriptionPlaceholder')}
            value={description}
            onChange={e => setDescription(e.currentTarget.value)}
            mt="xs"
            styles={{
              input: {
                height: 20,
                minHeight: 18,
                lineHeight: '20px',
                padding: 0,
                fontSize: isTouch ? 16 : 13
              }
            }}
          />
          <Box mt="sm">
            <TaskPropertiesEditor
              variant="chip"
              value={properties}
              onChange={patch => setProperties(current => ({ ...current, ...patch }))}
            />
          </Box>

          <Group
            justify="flex-end"
            mt="xs"
            pt="xs"
            style={{
              borderTop:
                colorScheme === 'dark'
                  ? '1px solid var(--mantine-color-dark-4)'
                  : '1px solid var(--mantine-color-gray-3)'
            }}
          >
            <Button
              variant="outline"
              color="gray"
              onClick={() => {
                clearInputs()
                setIsClicked(false)
              }}
            >
              {t('cancel')}
            </Button>

            <Button disabled={title.trim().length === 0} type="submit">
              {t('submit')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  )
}