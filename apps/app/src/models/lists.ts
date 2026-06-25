export type List = {
  id: string;
  ownerId: string;
  title: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type AllList = {
  owned: List[];
  shared: List[];
}
