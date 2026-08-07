import { MantineColor, MantineColorScheme } from '@mantine/core'

export type User = {
  id: string
  name: string
  email: string
  avatar: string | null
}

export type UserPreferences = {
  userId: string
  themeColor: MantineColor
  colorScheme: MantineColorScheme
  defaultView: string
  startOfWeek: string
  confirmDelete: boolean
  settings: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}
