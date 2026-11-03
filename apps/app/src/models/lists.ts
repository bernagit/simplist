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

/** Task counts returned with the lists overview */
export type ListTaskCounts = {
  totalTasks: number
  openTasks: number
}

export type OwnedList = List &
  ListTaskCounts & {
    shared: boolean
  }

export type SharedList = List &
  ListTaskCounts & {
    owner: {
      id: string
      name: string | null
      email: string
      avatar: string | null
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
