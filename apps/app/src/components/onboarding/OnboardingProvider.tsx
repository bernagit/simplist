'use client'

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { OnboardingTour } from '@gfazioli/mantine-onboarding-tour'
import { useTranslations } from 'next-intl'
import { useSidebar } from '@/providers/SidebarProvider'
import { useAuth } from '@/providers/AuthProvider'
import { usePreferences, useUpdatePreferences } from '@/queries/preferences'
import { useCloseOnBack } from '@/hooks/useCloseOnBack'
import { useTourSteps } from './useTourSteps'
import { TOUR_POPOVER } from './tourTargets'

/** Wait for the layout to settle (sidebar, lists) before pointing at it */
const AUTO_START_DELAY_MS = 800

type OnboardingContextValue = { startTour: () => void }

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}

type OnboardingProviderProps = {
  children: ReactNode
  /** Don't start by itself while something else asks for attention (e.g. the changelog) */
  paused?: boolean
}

/**
 * Guided tour of the app: starts once per account (saved in the preferences, so not again on
 * another device), and again from "Help & Support". Must be inside SidebarProvider.
 */
export function OnboardingProvider({ children, paused = false }: OnboardingProviderProps) {
  const t = useTranslations('Onboarding.nav')
  const { isMobile, isMediaResolved, open, close } = useSidebar()
  const { isAuthenticated } = useAuth()
  const { data: preferences } = usePreferences(isAuthenticated)
  const updatePreferences = useUpdatePreferences()
  const steps = useTourSteps(isMobile)
  const [started, setStarted] = useState(false)
  const autoStarted = useRef(false)

  const done = preferences?.data.settings?.onboardingDone === true

  const startTour = useCallback(() => {
    // Desktop: the steps point at the sidebar. Phones: at the menu button, visible only
    // while the sidebar overlay is closed.
    if (isMobile) close()
    else open()
    setStarted(true)
  }, [isMobile, open, close])

  const finishTour = useCallback(() => {
    setStarted(false)
    if (!done) updatePreferences.mutate({ settings: { onboardingDone: true } })
  }, [done, updatePreferences])

  useEffect(() => {
    // Phones and desktop get different steps: wait until the layout is known
    if (autoStarted.current || paused || done || !preferences || !isMediaResolved) return
    // Marked when it actually starts: a change meanwhile reschedules it instead of losing it
    const timer = setTimeout(() => {
      autoStarted.current = true
      startTour()
    }, AUTO_START_DELAY_MS)
    return () => clearTimeout(timer)
  }, [paused, done, preferences, isMediaResolved, startTour])

  // "Back" (Android gesture, browser button) leaves the tour instead of the page
  useCloseOnBack(started, finishTour)

  return (
    <OnboardingContext.Provider value={{ startTour }}>
      <OnboardingTour
        tour={steps}
        started={started}
        onOnboardingTourEnd={finishTour}
        withStepper={false}
        withStepCounter
        stepCounterLabel={(current, total) => t('counter', { current, total })}
        nextStepNavigation={t('next')}
        prevStepNavigation={t('back')}
        skipNavigation={t('skip')}
        endStepNavigation={t('finish')}
        cutoutRadius={8}
        focusRevealProps={{
          // Sidebar and topbar are fixed: nothing to scroll into view
          withReveal: false,
          disableTargetInteraction: true,
          overlayProps: { backgroundOpacity: 0.55, blur: 2 },
          popoverProps: TOUR_POPOVER
        }}
      >
        {children}
      </OnboardingTour>
    </OnboardingContext.Provider>
  )
}
