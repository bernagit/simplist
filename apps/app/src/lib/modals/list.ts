import { CreateListInput, OwnedList, SharedList } from '@/models/lists'
import { modals } from '@mantine/modals'

export function createListModal() {
  modals.openContextModal({
    modal: 'addList',
    title: 'Create a new list',
    size: 'lg',
    innerProps: undefined
  })
}

export function updateListModal(listId: string, data?: CreateListInput) {
  modals.openContextModal({
    modal: 'addList',
    title: 'Update list',
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
    title: 'Share list',
    size: 'lg',
    innerProps: {
      listId
    }
  })
}

export function openOwnedListInfoModal(list: OwnedList) {
  modals.openContextModal({
    modal: 'ownedListInfo',
    title: 'List info',
    size: 'lg',
    innerProps: {
      list
    }
  })
}

export function openSharedListInfoModal(list: SharedList) {
  modals.openContextModal({
    modal: 'sharedListInfo',
    title: 'List info',
    size: 'lg',
    innerProps: {
      list
    }
  })
}
