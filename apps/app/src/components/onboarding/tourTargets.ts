/** Elements the guided tour points at (OnboardingTour.Target ids) */
export const TOUR_TARGETS = {
  navigation: 'tour-navigation',
  lists: 'tour-lists',
  shared: 'tour-shared',
  profile: 'tour-profile',
  help: 'tour-help',
  /** Phones: the topbar button that opens the sidebar */
  menu: 'tour-menu'
} as const

/** Steps without a target: shown as a centered dialog */
export const TOUR_DIALOGS = {
  welcome: 'tour-welcome',
  actions: 'tour-actions',
  install: 'tour-install',
  done: 'tour-done'
} as const

/**
 * Popover options of every step. Step options replace the tour ones key by key (shallow), so
 * steps spread these instead of setting only their position.
 */
export const TOUR_POPOVER = {
  withArrow: true,
  shadow: 'md',
  radius: 'md',
  // Phones: the screen width minus the margins; larger screens: a fixed width
  width: { base: 'calc(100vw - 2rem)', xs: 340 }
} as const
