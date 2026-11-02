'use client'

import { forwardRef, ReactNode } from 'react'
import { Box, BoxProps, useComputedColorScheme } from '@mantine/core'
import { isMousePointer } from '@/hooks/useMouseHover'

type HoverableBoxProps = BoxProps & {
  active?: boolean
  children: ReactNode
  disabled?: boolean
  onClick?: (e: React.MouseEvent) => void
}

const HoverableBox = forwardRef<HTMLDivElement, HoverableBoxProps>(
  ({ children, disabled, active, onClick, style, ...rest }, ref) => {
    const colorScheme = useComputedColorScheme()
    const hoverColor =
      colorScheme === 'dark' ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-2)'

    return (
      <Box
        ref={ref}
        style={{
          borderRadius: 4,
          padding: 10,
          cursor: disabled ? 'default' : 'pointer',
          display: 'flex',
          ...style
        }}
        onPointerEnter={e => {
          if (disabled || !active || !isMousePointer(e)) return
          e.currentTarget.style.backgroundColor = hoverColor
        }}
        onPointerLeave={e => {
          if (!active) return
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
        onClick={onClick}
        {...rest}
      >
        {children}
      </Box>
    )
  }
)

HoverableBox.displayName = 'HoverableBox'

export default HoverableBox
