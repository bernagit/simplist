export type Section = {
  id: string
  listId: string
  title: string
  order: string
  createdAt: Date
  updatedAt: Date
}

export type CreateSectionInput = {
  listId: string
  title: string
}
