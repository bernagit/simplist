'use client'

import { modals, useModals } from '@mantine/modals'
import { useCloseOnBack } from '@/hooks/useCloseOnBack'

function ModalBackEntry({ id }: { id: string }) {
  useCloseOnBack(true, () => modals.close(id))
  return null
}

/**
 * Lets "back" close modals opened through the modals manager (`modals.open*`), one at a
 * time from the top. Each open modal gets its own history entry, in opening order.
 * Must be rendered inside ModalsProvider.
 */
export function ModalsBackHandler() {
  const { modals: openModals } = useModals()
  return openModals.map(modal => <ModalBackEntry key={modal.id} id={modal.id} />)
}
