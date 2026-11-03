import { modals } from "@mantine/modals";

import type { SettingsSection } from '@/components/modals/UserSettings'

export function openSettingsModal(isMobile: boolean, section?: SettingsSection) {
  const width = isMobile ? '100%' : '80rem'
  modals.openContextModal({
    modal: 'userSettings',
    size: width,
    innerProps: { section },
    fullScreen: isMobile,
    withCloseButton: false,
    padding: 0,
    overlayProps: {
      blur: 3,
      opacity: 0.55
    }
  })
}
