import { modals } from '@mantine/modals'
import { PlannedTask } from '@/models/task'
import { NavigationCallbacks } from '@/components/modals/EditTask'

export function editTaskModal(
  task: PlannedTask,
  isMobile: boolean,
  canEdit: boolean | undefined,
  navigation: NavigationCallbacks,
  onUpdate?: (updatedTask: PlannedTask) => void
) {
  modals.openContextModal({
    modal: 'editTask',
    fullScreen: isMobile,
    withCloseButton: false,
    size: 'xl',
    padding: 'lg',
    innerProps: {
      task,
      canEdit,
      navigation,
      onUpdate
    }
  })
}
