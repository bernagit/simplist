'use client'

import { useMemo } from 'react'
import { Button, Stack, Text } from '@mantine/core'
import { IconBell } from '@tabler/icons-react'
import type { OnboardingTourStep } from '@gfazioli/mantine-onboarding-tour'
import { useTranslations } from 'next-intl'
import { openSettingsModal } from '@/lib/modals/common'
import { TOUR_DIALOGS, TOUR_POPOVER, TOUR_TARGETS } from './tourTargets'

type Position = 'right-start' | 'right-end' | 'bottom-start'

/** Where the popover opens: next to the sidebar on desktop, under the topbar on phones */
const at = (position: Position) => ({
  focusRevealProps: { popoverProps: { ...TOUR_POPOVER, position } }
})

/**
 * The tour follows the layout: on desktop it walks through the sidebar; on phones the sidebar
 * is closed, so it points at the menu button and explains the rest in centered dialogs.
 */
export function useTourSteps(isMobile: boolean): OnboardingTourStep[] {
  const t = useTranslations('Onboarding')

  return useMemo(() => {
    const step = (id: string, key: string, extra: Partial<OnboardingTourStep> = {}) => ({
      id,
      title: t(`${key}.title`),
      content: (
        <Text size="sm" c="dimmed">
          {t(`${key}.content`)}
        </Text>
      ),
      ...extra
    })

    const done: OnboardingTourStep = {
      id: TOUR_DIALOGS.done,
      title: t('done.title'),
      content: controller => (
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            {t('done.content')}
          </Text>
          <Button
            variant="light"
            leftSection={<IconBell size={16} />}
            onClick={() => {
              controller.endTour()
              openSettingsModal(isMobile, 'notifications')
            }}
          >
            {t('done.notifications')}
          </Button>
        </Stack>
      )
    }

    if (isMobile) {
      return [
        step(TOUR_DIALOGS.welcome, 'welcome'),
        step(TOUR_TARGETS.menu, 'menu', at('bottom-start')),
        step(TOUR_DIALOGS.actions, 'actions'),
        step(TOUR_DIALOGS.install, 'install'),
        done
      ]
    }

    return [
      step(TOUR_DIALOGS.welcome, 'welcome'),
      step(TOUR_TARGETS.navigation, 'navigation', at('right-start')),
      step(TOUR_TARGETS.lists, 'lists', at('right-start')),
      step(TOUR_TARGETS.shared, 'shared', at('right-start')),
      step(TOUR_TARGETS.profile, 'profile', at('right-start')),
      step(TOUR_TARGETS.help, 'help', at('right-end')),
      done
    ]
  }, [t, isMobile])
}
