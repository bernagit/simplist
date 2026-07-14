export interface Resp<T> {
  data: T
  message: string
}

export type ErrorResponse = {
  message: string
  statusCode: number
}

export type SearchData = {
  lists: ListResult[]
  sections: SectionResult[]
  items: ItemResult[]
}

export type ListResult = {
  id: string
  title: string
  description?: string
  color?: string
  icon?: string
}

export type SectionResult = {
  id: string
  title: string
  listName: string
  listId: string
}

export type ItemResult = {
  id: string
  title: string
  description?: string
  sectionId: string
  listId: string
}
