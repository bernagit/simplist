'use client'

import { getPriorityColor } from '@/utils/color'
import { PRIORITY_OPTIONS } from '@/utils/constants'
import { Box, Button, Group, Popover, Stack, Text } from '@mantine/core'
import { IconFlag, IconX } from '@tabler/icons-react'
import { useMemo, useState } from 'react'

type PrioritySelectorProps = {
  selectedPriority: string | null
  setSelectedPriority: (priority: string | null) => void
}

export default function PrioritySelector({
  selectedPriority,
  setSelectedPriority
}: PrioritySelectorProps) {
  const colorMemo = useMemo(() => getPriorityColor(selectedPriority), [selectedPriority])
  const isPrioritySelected = selectedPriority !== null
  const [open, setOpen] = useState(false)

  const handlePrioritySelect = (priority: string | null) => {
    setSelectedPriority(priority)
    setOpen(false)
  }

  return (
    <Group gap={0}>
      <Popover position="bottom-start" shadow="md" opened={open} onChange={setOpen}>
        <Popover.Target>
          <Button
            variant="outline"
            color={'gray'}
            c={colorMemo}
            mt="xs"
            h={30}
            px={4}
            radius={4}
            style={{
              fontSize: 13,
              fontWeight: 500,
              width: 'fit-content',
              borderRadius: selectedPriority !== null ? '4px 0px 0px 4px' : 4
            }}
            leftSection={<IconFlag size={16} color={colorMemo} />}
            onClick={() => setOpen(o => !o)}
          >
            <Text mt={4} size={'13px'} fw={isPrioritySelected ? 600 : 500}>
              {isPrioritySelected
                ? PRIORITY_OPTIONS.find(option => option.value === selectedPriority)?.label
                : 'Priority'}
            </Text>
          </Button>
        </Popover.Target>
        <Popover.Dropdown p={0}>
          <Stack gap={0} p={0}>
            {PRIORITY_OPTIONS.map(option => (
              <Button
                key={option.value}
                variant="subtle"
                color="gray"
                onClick={() => handlePrioritySelect(option.value)}
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
      {selectedPriority !== null && (
        <Button
          variant="outline"
          color="gray"
          mt="xs"
          h={30}
          px={4}
          radius={4}
          style={{
            borderRadius: '0px 4px 4px 0px',
            borderLeft: 0,
            fontSize: 13,
            fontWeight: 500,
            width: 'fit-content'
          }}
          onClick={() => setSelectedPriority(null)}
        >
          <IconX size={16} />
        </Button>
      )}
    </Group>
  )
}
