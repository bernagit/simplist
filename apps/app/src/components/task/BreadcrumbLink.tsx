'use client'

import { ReactNode } from 'react'
import { Box, Text } from '@mantine/core'
import { isMousePointer } from '@/hooks/useMouseHover'

type Props = {
  children: ReactNode
  onClick: () => void
}

export default function BreadcrumbLink({ children, onClick }: Props) {
  return (
    <Box
      component="div"
      onClick={onClick}
      onPointerEnter={e => {
        if (!isMousePointer(e)) return
        e.currentTarget.style.backgroundColor =
          'light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))'
      }}
      onPointerLeave={e => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        borderRadius: 8,
        padding: '4px 10px',
        transition: 'background-color 150ms ease, transform 150ms ease'
      }}
    >
      <Text size="sm" fw={600}>
        {children}
      </Text>
    </Box>
  )
}
