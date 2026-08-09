'use client'

import { Fragment } from 'react'
import { Group, Kbd, Text } from '@mantine/core'
import { HOTKEYS, HotkeyId } from '@/utils/hotkeys'
import { useTranslations } from 'next-intl'

type Props = {
  hotkey: HotkeyId
}

export function HotkeyBinding({ hotkey }: Props) {
  const t = useTranslations('HotkeyBinding')
  const { keys } = HOTKEYS[hotkey]

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