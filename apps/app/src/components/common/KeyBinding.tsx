'use client'

import { Fragment } from 'react'
import { Group, Kbd, Text } from '@mantine/core'
import { HOTKEYS, HotkeyId } from '@/utils/hotkeys'
import { useTranslations } from 'next-intl'
import { useMediaQuery } from '@mantine/hooks'
import { TOUCH_QUERY } from '@/providers/SidebarProvider'

type Props = {
  hotkey: HotkeyId
  /** Show it on touch devices too (e.g. in the shortcuts list itself). */
  showOnTouch?: boolean
}

export function HotkeyBinding({ hotkey, showOnTouch = false }: Props) {
  const t = useTranslations('HotkeyBinding')
  const { keys } = HOTKEYS[hotkey]
  // Read directly: hints are also rendered in places outside SidebarProvider.
  const isTouch = useMediaQuery(TOUCH_QUERY)

  // Keyboard hints are noise on phones and tablets, which usually have no keyboard.
  if (isTouch && !showOnTouch) return null

  return (
    <Group gap={4}>
      {keys.map((step, stepIndex) => (
        <Fragment key={`${step}-${stepIndex}`}>
          {step.split('+').map((key, comboIndex, combo) => (
            <Fragment key={`${key}-${comboIndex}`}>
              <Kbd>{key}</Kbd>

              {comboIndex < combo.length - 1 && (
                <Text span c="dimmed" size="sm">
                  +
                </Text>
              )}
            </Fragment>
          ))}

          {stepIndex < keys.length - 1 && (
            <Text span c="dimmed" size="sm">
              {t('then')}
            </Text>
          )}
        </Fragment>
      ))}
    </Group>
  )
}