'use client'

import { useDisclosure } from '@mantine/hooks'
import {
  ActionIcon,
  Box,
  Button,
  Collapse,
  Group,
  Stack,
  Text,
  ThemeIcon,
  rem
} from '@mantine/core'
import { IconChevronDown, IconFlag } from '@tabler/icons-react'
import { getPriorityColor } from '@/utils/color'
import HoverableBox from './HoverableBox'
import { useTranslations } from 'next-intl'
import { usePriorityOptions } from '@/hooks/useOptionLabel'

type TaskPriorityFieldProps = {
  priority: string | null
  canEdit?: boolean
  onChange: (priority: string | null) => void
}

export default function TaskPriorityField({
  priority,
  canEdit = true,
  onChange
}: TaskPriorityFieldProps) {
  const t = useTranslations('TaskPriorityField')
  const priorityOptions = usePriorityOptions()
  const [opened, { toggle, close }] = useDisclosure(false)

  const color = getPriorityColor(priority)

  const activeOption = priorityOptions.find(option => option.value === priority)
  const label = activeOption?.label ?? t('defaultPriority')

  const isOpen = opened && canEdit

  return (
    <Box
      style={{
        border: '1px solid var(--mantine-color-default-border)',
        borderRadius: 'var(--mantine-radius-md)',
        overflow: 'hidden'
      }}
    >
      <HoverableBox
        disabled={!canEdit}
        onClick={() => canEdit && toggle()}
        style={{ borderRadius: 0 }}
        active={false}
      >
        <Group justify="space-between" wrap="nowrap" style={{ width: '100%' }}>
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon variant="light" color="gray" radius="md" size="md">
              <IconFlag
                style={{
                  width: rem(18),
                  height: rem(18),
                  color
                }}
              />
            </ThemeIcon>

            <Stack gap={2}>
              <Text size="xs" c="dimmed" fw={500} style={{ lineHeight: 1 }}>
                {t('label')}
              </Text>

              <Text size="sm" fw={priority ? 600 : 400} c={priority ? 'dark.4' : 'dimmed'}>
                {label}
              </Text>
            </Stack>
          </Group>

          {canEdit && (
            <ActionIcon variant="subtle" color="gray" radius="xl">
              <IconChevronDown
                style={{
                  width: rem(16),
                  height: rem(16),
                  transform: isOpen ? 'rotate(180deg)' : undefined,
                  transition: 'transform 150ms ease'
                }}
              />
            </ActionIcon>
          )}
        </Group>
      </HoverableBox>

      <Collapse expanded={isOpen} transitionDuration={180} transitionTimingFunction="ease">
        <Box
          p="xs"
          style={{
            borderTop: '1px solid var(--mantine-color-default-border)'
          }}
        >
          <Stack gap={4}>
            {priorityOptions.map(option => (
              <Button
                key={option.value ?? 'none'}
                variant={priority === option.value ? 'light' : 'subtle'}
                color="gray"
                justify="flex-start"
                leftSection={
                  <IconFlag
                    size={16}
                    color={getPriorityColor(option.value)}
                  />
                }
                onClick={() => {
                  onChange(option.value)
                  close()
                }}
              >
                {option.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Box>
  )
}