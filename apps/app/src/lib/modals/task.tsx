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
    // Changes are saved as they are made (an open title edit is saved on close, see EditTask),
    // so clicking outside can close it. The app default is off for modals with forms.
    closeOnClickOutside: true,
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
