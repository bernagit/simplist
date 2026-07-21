import { useState } from 'react'
import { PlannedTask } from '@/models/task'
import { useTaskFieldUpdate } from './useTaskFieldUpdate'

export function useTaskEditForm(task: PlannedTask) {
  const { updateField } = useTaskFieldUpdate(task)

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')

  const startEditing = () => setIsEditing(true)

  const save = async () => {
    await updateField({ title, description })
    setIsEditing(false)
  }

  const cancel = () => {
    setTitle(task.title)
    setDescription(task.description ?? '')
    setIsEditing(false)
  }

  return { isEditing, title, description, setTitle, setDescription, startEditing, save, cancel }
}
