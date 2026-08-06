import { modals } from "@mantine/modals";

export function openSettingsModal(isMobile: boolean) {
  const width = isMobile ? '100%' : '80rem'
  modals.openContextModal({
    modal: 'userSettings',
    size: width,
    innerProps: undefined,
    fullScreen: isMobile,
    withCloseButton: false,
    padding: 0,
    overlayProps: {
      blur: 3,
      opacity: 0.55
    }
  })
}
