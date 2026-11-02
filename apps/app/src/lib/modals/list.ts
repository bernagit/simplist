import { CreateListInput } from '@/models/lists'
import { modals } from '@mantine/modals'

export function createListModal() {
  modals.openContextModal({
    modal: 'addList',
    withCloseButton: false,
    size: 'lg',
    innerProps: undefined
  })
}

export function updateListModal(listId: string, data?: CreateListInput) {
  modals.openContextModal({
    modal: 'addList',
    withCloseButton: false,
    size: 'lg',
    innerProps: {
      listId,
      data
    }
  })
}

export function shareListModal(listId: string) {
  modals.openContextModal({
    modal: 'shareList',
    withCloseButton: false,
    size: 'lg',
    innerProps: {
      listId
    }
  })
}

export const confirmArchiveModal = (onConfirm: () => void) =>
  modals.openContextModal({
    modal: 'confirmArchive',
    withCloseButton: false,
    fullScreen: false,
    innerProps: { onConfirm }
  }
)
