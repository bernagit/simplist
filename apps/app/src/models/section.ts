export type Section = {
  id: string;
  listId: string;
  title: string;
  order?: number | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateSectionInput = {
  listId: string;
  title: string;
  order?: number | undefined;
}