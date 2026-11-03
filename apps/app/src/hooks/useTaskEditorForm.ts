import { useState } from 'react'
import { Task } from '@/models/task'

/** Title and description edited together, saved or cancelled at once. */
export function useTaskEditForm(
  task: Pick<Task, 'title' | 'description'>,
  onSave: (updates: { title: string; description: string | null }) => void
) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')

  const startEditing = () => setIsEditing(true)

  const save = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    onSave({ title: trimmed, description: description.trim() || null })
    setTitle(trimmed)
    setIsEditing(false)
  }

  const cancel = () => {
    setTitle(task.title)
    setDescription(task.description ?? '')
    setIsEditing(false)
  }

  return { isEditing, title, description, setTitle, setDescription, startEditing, save, cancel }
}
