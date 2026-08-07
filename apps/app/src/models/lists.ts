import { Section } from './section'
import { Task } from './task'

export type List = {
  id: string
  ownerId: string
  title: string
  description: string | null
  color: string | null
  icon: string | null
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type OwnedList = List & {
  shared: boolean
}

export type SharedList = List & {
  owner: {
    id: string
    name: string | null
    email: string
  }
}

export type AllList = {
  owned: OwnedList[]
  shared: SharedList[]
}

export type ListMember = {
  id: string
  userId: string
  role: 'owner' | 'editor' | 'viewer'
  email: string
  avatar: string | null
  name: string | null
  joinedAt: Date
}

export type CompleteList = List & {
  members: ListMember[]
  sections: Section[]
  tasks: Task[]
  defaultSectionId: string | null
}

export type CreateListInput = {
  title: string
  description?: string | null
  color?: string | null
  icon?: string | null
}

export type UpdateListInput = CreateListInput & {
  id: string
}

export type ShareListInput = {
  shareWithEmail: string
  role: 'editor' | 'viewer'
}
