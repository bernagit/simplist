export function getPriorityColor(priority: string | null) {
  switch (priority) {
    case 'high':
      return 'var(--mantine-color-red-6)'
    case 'medium':
      return 'var(--mantine-color-yellow-6)'
    case 'low':
      return 'var(--mantine-color-blue-6)'
    default:
      return 'var(--mantine-color-gray-outline)'
  }
}
