'use client'

import { ReactElement, ReactNode, useState } from 'react'
import { Drawer, Popover } from '@mantine/core'
import { useDevice } from '@/hooks/useDevice'
import { useCloseOnBack } from '@/hooks/useCloseOnBack'

/** Above modals (400) so pickers work inside the task modal too */
export const PICKER_Z_INDEX = 1000

type ResponsivePickerProps = {
  /** Drawer title on phones */
  title: string
  disabled?: boolean
  width?: number
  /** The element that opens the picker: a single element that forwards its ref */
  target: (props: { opened: boolean; toggle: () => void }) => ReactElement
  /** Picker content; call `close` once a choice is final */
  children: (close: () => void) => ReactNode
}

/**
 * A picker that opens as a popover next to its target on desktop and as a bottom sheet on
 * phones (thumb reach, no clipped popovers). "Back" closes the sheet.
 */
export function ResponsivePicker({
  title,
  disabled,
  width = 300,
  target,
  children
}: ResponsivePickerProps) {
  const { isMobile } = useDevice()
  const [opened, setOpened] = useState(false)
  const close = () => setOpened(false)
  const toggle = () => !disabled && setOpened(value => !value)
  useCloseOnBack(isMobile && opened, close)

  if (isMobile) {
    return (
      <>
        {target({ opened, toggle })}
        <Drawer
          opened={opened}
          onClose={close}
          position="bottom"
          size="auto"
          radius="md"
          title={title}
          zIndex={PICKER_Z_INDEX}
          styles={{ title: { fontWeight: 600 } }}
        >
          {opened && children(close)}
        </Drawer>
      </>
    )
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="bottom-start"
      shadow="md"
      radius="md"
      width={width}
      withinPortal
      zIndex={PICKER_Z_INDEX}
      trapFocus
      disabled={Boolean(disabled)}
    >
      {/* The target must forward its ref (PropertyTrigger does): it anchors the popover */}
      <Popover.Target>{target({ opened, toggle })}</Popover.Target>
      <Popover.Dropdown p="sm">{opened && children(close)}</Popover.Dropdown>
    </Popover>
  )
}
