'use client'

import { forwardRef, ReactNode } from 'react'
import { Box, BoxProps, useComputedColorScheme } from '@mantine/core'

type HoverableBoxProps = BoxProps & {
  children: ReactNode
  disabled?: boolean
}

const HoverableBox = forwardRef<HTMLDivElement, HoverableBoxProps>(
  ({ children, disabled, style, ...rest }, ref) => {
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
        onMouseEnter={e => {
          if (disabled) return
          e.currentTarget.style.backgroundColor = hoverColor
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
        {...rest}
      >
        {children}
      </Box>
    )
  }
)

HoverableBox.displayName = 'HoverableBox'

export default HoverableBox
